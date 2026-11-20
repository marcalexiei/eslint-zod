import type { ZodExportName, ZodMethodName } from '@eslint-zod/zod-api';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { ZodSchemaConstraint } from '../collect-zod-schema-constraints.js';
import { getIdentifierValue, skipTypeAssertions } from '../get-binding-initializer.js';
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

/** Checks whose repeat is redundant, by family: a later member of a family overrides an earlier one. */
const CHECK_FAMILIES: ReadonlyMap<string, string> = new Map<ZodExportName, string>([
  ['describe', 'describe'],
  ['normalize', 'normalize'],
  ['toLowerCase', 'case'],
  ['toUpperCase', 'case'],
  ['trim', 'trim'],
]);

/** A chained method or a `.check(...)` argument. */
type AppliedCheck = Pick<ZodSchemaConstraint, 'name' | 'node'>;

/** What a check sets within its family; `null` when it cannot be known statically. */
function getCheckKey(check: AppliedCheck, sourceCode: Readonly<SourceCode>): string | null {
  if (check.name !== 'normalize') {
    return check.name;
  }
  // `normalize()` defaults to `NFC`, as `String.prototype.normalize` does.
  const form = check.node.arguments.at(0);
  if (!form) {
    return 'NFC';
  }
  const expression = form.type === AST_NODE_TYPES.SpreadElement ? null : skipTypeAssertions(form);
  const value =
    expression?.type === AST_NODE_TYPES.Identifier
      ? getIdentifierValue(sourceCode, expression)
      : expression;
  return value?.type === AST_NODE_TYPES.Literal && typeof value.value === 'string'
    ? value.value
    : null;
}

function isCheckMethod(name: string): boolean {
  return name === 'check' || name === 'with';
}

/** Forgets the value checks in effect; `describe` sets metadata, so it stays. */
function forgetValueChecks(inEffect: Map<string, string | null>): void {
  for (const family of inEffect.keys()) {
    if (family !== 'describe') {
      inEffect.delete(family);
    }
  }
}

/**
 * Records checks in `inEffect` (family → key), in order;
 * `undefined` stands for a `.check(...)` argument that is not a zod call.
 * Returns the checks repeating one still in effect.
 */
function trackChecks(
  inEffect: Map<string, string | null>,
  checks: ReadonlyArray<AppliedCheck | undefined>,
  sourceCode: Readonly<SourceCode>,
): Array<AppliedCheck> {
  const repeats: Array<AppliedCheck> = [];
  for (const check of checks) {
    const family = check && CHECK_FAMILIES.get(check.name);
    if (check && family) {
      const key = getCheckKey(check, sourceCode);
      if (key !== null && inEffect.get(family) === key) {
        repeats.push(check);
        continue;
      }
      // A case change or `normalize()` may undo the others; `trim()` only drops whitespace.
      if (family !== 'trim' && family !== 'describe') {
        forgetValueChecks(inEffect);
      }
      inEffect.set(family, key);
    } else if (!check || mayRewriteZodValue(check.name)) {
      // A custom check may rewrite the value too.
      forgetValueChecks(inEffect);
    }
  }
  return repeats;
}

/**
 * Reports a method called twice in one chain segment, the excluded ones aside.
 * The checks in `CHECK_FAMILIES`, chained or passed to `.check(...)`,
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

    return createSchemaVisitor({
      onSchema(node): void {
        const seen = new Set<string>();
        // Checks still in effect: family → key.
        const inEffect = new Map<string, string | null>();
        const chain = collectZodChainMethods(node);
        const constraints = chain.some((it) => isCheckMethod(it.name))
          ? collectZodSchemaConstraints(node)
          : [];

        for (const method of chain) {
          // A type-changing method starts a new segment: what follows constrains a different schema.
          if (ZOD_TYPE_CHANGING_METHODS.includes(method.name)) {
            seen.clear();
            inEffect.clear();
            continue;
          }
          // `.apply(fn)` may return any schema, so earlier checks may not apply to it.
          if (method.name === ('apply' satisfies ZodMethodName)) {
            inEffect.clear();
          }

          const isCheck = isCheckMethod(method.name);
          const checks = isCheck
            ? method.node.arguments.map((argument) =>
                constraints.find((it) => it.node === argument),
              )
            : [method];
          for (const repeat of trackChecks(inEffect, checks, context.sourceCode)) {
            context.report({
              node: isCheck ? repeat.node : node,
              messageId: 'noDuplicateSchemaMethod',
              data: { method: repeat.name },
            });
          }

          if (excluded.includes(method.name) || CHECK_FAMILIES.has(method.name)) {
            continue;
          }

          if (seen.has(method.name)) {
            context.report({
              node,
              messageId: 'noDuplicateSchemaMethod',
              data: { method: method.name },
            });
          } else {
            seen.add(method.name);
          }
        }
      },
    });
  };
}
