import type { ZodMethodName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { ZodSchemaConstraint } from '../collect-zod-schema-constraints.js';
import { getArgumentValue } from '../get-binding-initializer.js';
import { mayRewriteZodValue } from '../has-opaque-zod-check.js';
import type { RuleContext, RuleListener, SourceCode } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import type { ZodTypeChangingMethod } from '../zod-type-changing-methods.js';
import { ZOD_TYPE_CHANGING_METHODS } from '../zod-type-changing-methods.js';

/** Each unreachable entry of `TExcluded` becomes the reason, so listing one is a type error. */
export type NoDuplicateSchemaMethodsExclusions<TExcluded extends ReadonlyArray<string>> = {
  readonly [K in keyof TExcluded]: TExcluded[K] extends ZodTypeChangingMethod
    ? `'${TExcluded[K]}' starts a new chain segment, so excluding it is dead code`
    : TExcluded[K];
};

/** The checks in effect; `rewrite` is the last case change or `normalize()` form, `null` when unknown. */
interface InEffect {
  describe: boolean;
  trim: boolean;
  rewrite: string | null;
}

/** A chained method or a `.check(...)` argument. */
type AppliedCheck = Pick<ZodSchemaConstraint, 'name' | 'node'>;

/** What a case change or `normalize()` sets; `null` when it cannot be known statically. */
function getRewriteKey(check: AppliedCheck, sourceCode: Readonly<SourceCode>): string | null {
  if (check.name !== 'normalize') {
    return check.name;
  }
  // `normalize()` defaults to `NFC`, as `String.prototype.normalize` does.
  const form = check.node.arguments.at(0);
  if (!form) {
    return 'normalize:NFC';
  }
  const value = getArgumentValue(sourceCode, form);
  return value?.type === AST_NODE_TYPES.Literal && typeof value.value === 'string'
    ? `normalize:${value.value}`
    : null;
}

/**
 * Records `check` in `inEffect` and returns it when it repeats one still in effect;
 * `undefined` stands for a `.check(...)` argument that is not a zod call.
 */
function trackCheck(
  inEffect: InEffect,
  check: AppliedCheck | undefined,
  sourceCode: Readonly<SourceCode>,
): AppliedCheck | null {
  if (check?.name === 'describe' || check?.name === 'trim') {
    const repeated = inEffect[check.name];
    inEffect[check.name] = true;
    return repeated ? check : null;
  }
  if (
    check?.name === 'toLowerCase' ||
    check?.name === 'toUpperCase' ||
    check?.name === 'normalize'
  ) {
    const key = getRewriteKey(check, sourceCode);
    if (key !== null && key === inEffect.rewrite) {
      return check;
    }
    inEffect.trim = false;
    inEffect.rewrite = key;
  } else if (!check || mayRewriteZodValue(check.name)) {
    // A custom check may rewrite the value too.
    inEffect.trim = false;
    inEffect.rewrite = null;
  }
  return null;
}

const COMPARED_CHECKS: ReadonlyArray<string> = Object.freeze<ReadonlyArray<ZodMethodName>>([
  'describe',
  'normalize',
  'toLowerCase',
  'toUpperCase',
  'trim',
]);

/**
 * Reports a method called twice in one chain segment, the excluded ones aside.
 * `describe`, `trim`, case changes and `normalize()`, chained or passed to `.check(...)`,
 * are reported only when repeating one still in effect.
 */
export function buildNoDuplicateSchemaMethodsCreate<const TExcluded extends ReadonlyArray<string>>(
  scope: ZodImportScope,
  excludedMethods: NoDuplicateSchemaMethodsExclusions<TExcluded>,
): (context: Readonly<RuleContext<'noDuplicateSchemaMethod'>>) => RuleListener {
  const excluded: ReadonlyArray<string> = excludedMethods;

  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods, collectZodSchemaConstraints } =
      scope.createTracker({ kind: 'value' });
    const report = (node: TSESTree.Node, method: string): void => {
      context.report({ node, messageId: 'noDuplicateSchemaMethod', data: { method } });
    };

    return createSchemaVisitor({
      onSchema(node): void {
        const seen = new Set<string>();
        let inEffect: InEffect = { describe: false, trim: false, rewrite: null };
        const constraints = collectZodSchemaConstraints(node);

        for (const method of collectZodChainMethods(node)) {
          const isTypeChanging = ZOD_TYPE_CHANGING_METHODS.includes(method.name);
          // `.apply(fn)` may return any schema, so earlier checks may not apply to it.
          if (isTypeChanging || method.name === ('apply' satisfies ZodMethodName)) {
            inEffect = { describe: false, trim: false, rewrite: null };
          }
          // A type-changing method starts a new segment: what follows constrains a different schema.
          if (isTypeChanging) {
            seen.clear();
            continue;
          }

          const isCheck = method.name === 'check' || method.name === 'with';
          const checks = isCheck
            ? method.node.arguments.map((argument) =>
                constraints.find((it) => it.node === argument),
              )
            : [method];
          for (const check of checks) {
            const repeat = trackCheck(inEffect, check, context.sourceCode);
            if (repeat) {
              report(isCheck ? repeat.node : node, repeat.name);
            }
          }

          if (excluded.includes(method.name) || COMPARED_CHECKS.includes(method.name)) {
            continue;
          }
          if (seen.has(method.name)) {
            report(node, method.name);
          } else {
            seen.add(method.name);
          }
        }
      },
    });
  };
}
