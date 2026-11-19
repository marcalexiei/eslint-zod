import type { ZodExportName, ZodMiniMethodName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { ZodSchemaConstraint } from '../collect-zod-schema-constraints.js';
import { CALLBACK_CHECK_NAMES } from '../has-opaque-zod-check.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { ZOD_MUTATING_CHECK_NAMES } from '../zod-mutating-check-names.js';
import type { ZodTypeChangingMethod } from '../zod-type-changing-methods.js';
import { ZOD_TYPE_CHANGING_METHODS } from '../zod-type-changing-methods.js';

/** Each unreachable entry of `TExcluded` becomes the reason, so listing one is a type error. */
export type NoDuplicateSchemaMethodsExclusions<TExcluded extends ReadonlyArray<string>> = {
  readonly [K in keyof TExcluded]: TExcluded[K] extends ZodTypeChangingMethod
    ? `'${TExcluded[K]}' starts a new chain segment, so excluding it is dead code`
    : TExcluded[K];
};

export interface NoDuplicateSchemaMethodsOptions {
  /** Also report a `.check(...)` argument that repeats an earlier one: `zod/mini` only. */
  checkArguments: boolean;
}

type MessageIds = 'noDuplicateSchemaMethod' | 'noDuplicateCheckArgument';

/** Checks whose repeat is redundant, by family: a later member of a family overrides an earlier one. */
const CHECK_FAMILIES: ReadonlyMap<string, string> = new Map<ZodExportName, string>([
  ['describe', 'describe'],
  ['normalize', 'normalize'],
  ['toLowerCase', 'case'],
  ['toUpperCase', 'case'],
  ['trim', 'trim'],
]);

/** The family that sets metadata rather than the value, so a rewriting check leaves it alone. */
const METADATA_FAMILY = 'describe';

/** What two check arguments must share to be duplicates; `null` when it cannot be known statically. */
function getCheckArgumentKey(constraint: ZodSchemaConstraint): string | null {
  if (constraint.name !== 'normalize') {
    return constraint.name;
  }

  // `normalize()` defaults to `NFC`, as `String.prototype.normalize` does.
  const form = constraint.node.arguments.at(0);
  if (!form) {
    return 'normalize:NFC';
  }
  if (form.type === AST_NODE_TYPES.Literal && typeof form.value === 'string') {
    return `normalize:${form.value}`;
  }
  if (form.type === AST_NODE_TYPES.TemplateLiteral && form.expressions.length === 0) {
    return `normalize:${form.quasis.map((quasi) => quasi.value.cooked).join('')}`;
  }
  // The same binding read twice in one expression holds one value; a call or member may not.
  return form.type === AST_NODE_TYPES.Identifier ? `normalize:$${form.name}` : null;
}

function isCheckMethod(name: string): boolean {
  return name === 'check' || name === 'with';
}

/** Whether a zod check argument may rewrite the value in a way no family accounts for. */
function rewritesValue(constraint: ZodSchemaConstraint): boolean {
  return (
    CALLBACK_CHECK_NAMES.has(constraint.name) ||
    (ZOD_MUTATING_CHECK_NAMES.includes(constraint.name) && !CHECK_FAMILIES.has(constraint.name))
  );
}

/**
 * Reports a method called twice in one chain segment, the excluded ones aside.
 * With `checkArguments`, a `.check(...)` argument repeating one still in effect is reported too.
 */
export function buildNoDuplicateSchemaMethodsCreate<const TExcluded extends ReadonlyArray<string>>(
  scope: ZodImportScope,
  excludedMethods: NoDuplicateSchemaMethodsExclusions<TExcluded>,
): (context: Readonly<RuleContext<'noDuplicateSchemaMethod'>>) => RuleListener;
export function buildNoDuplicateSchemaMethodsCreate<const TExcluded extends ReadonlyArray<string>>(
  scope: ZodImportScope,
  excludedMethods: NoDuplicateSchemaMethodsExclusions<TExcluded>,
  options: NoDuplicateSchemaMethodsOptions,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener;
export function buildNoDuplicateSchemaMethodsCreate(
  scope: ZodImportScope,
  excludedMethods: ReadonlyArray<string>,
  options?: NoDuplicateSchemaMethodsOptions,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  const checkArguments = options?.checkArguments ?? false;

  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods, collectZodSchemaConstraints } =
      scope.createTracker({ kind: 'value' });

    /** Check-argument constraints by chain index, then argument index. */
    function getCheckArguments(
      node: TSESTree.CallExpression,
      chainMethods: ReadonlyArray<{ name: string }>,
    ): Map<number, Map<number, ZodSchemaConstraint>> {
      const byChainIndex = new Map<number, Map<number, ZodSchemaConstraint>>();
      if (!checkArguments || !chainMethods.some((it) => isCheckMethod(it.name))) {
        return byChainIndex;
      }
      for (const constraint of collectZodSchemaConstraints(node)) {
        if (constraint.origin !== 'check-argument') {
          continue;
        }
        const byArgumentIndex =
          byChainIndex.get(constraint.chainIndex) ?? new Map<number, ZodSchemaConstraint>();
        byArgumentIndex.set(constraint.argumentIndex, constraint);
        byChainIndex.set(constraint.chainIndex, byArgumentIndex);
      }
      return byChainIndex;
    }

    return createSchemaVisitor({
      onSchema(node): void {
        const chainMethods = collectZodChainMethods(node);
        const checkArgumentsByChainIndex = getCheckArguments(node, chainMethods);
        const seen = new Set<string>();
        // Check arguments still in effect: key → family.
        const seenChecks = new Map<string, string>();

        function forgetChecks(shouldForget: (family: string) => boolean): void {
          for (const [key, family] of seenChecks) {
            if (shouldForget(family)) {
              seenChecks.delete(key);
            }
          }
        }

        for (const [chainIndex, method] of chainMethods.entries()) {
          // A type-changing method starts a new segment: what follows constrains a different schema.
          if (ZOD_TYPE_CHANGING_METHODS.includes(method.name)) {
            seen.clear();
            seenChecks.clear();
            continue;
          }
          // `.apply(fn)` may return any schema, so earlier checks may not apply to it.
          if (method.name === ('apply' satisfies ZodMiniMethodName)) {
            seenChecks.clear();
          }

          if (checkArguments && isCheckMethod(method.name)) {
            const byArgumentIndex = checkArgumentsByChainIndex.get(chainIndex);
            for (const argumentIndex of method.node.arguments.keys()) {
              const constraint = byArgumentIndex?.get(argumentIndex);
              // An argument that is not a zod call is a custom check, which may rewrite anything.
              if (!constraint || rewritesValue(constraint)) {
                forgetChecks((family) => family !== METADATA_FAMILY);
                continue;
              }
              const family = CHECK_FAMILIES.get(constraint.name);
              if (!family) {
                continue;
              }

              const key = getCheckArgumentKey(constraint);
              if (key !== null && seenChecks.has(key)) {
                context.report({
                  node: constraint.node,
                  messageId: 'noDuplicateCheckArgument',
                  data: { check: constraint.name },
                });
                continue;
              }
              forgetChecks((seenFamily) => seenFamily === family);
              if (key !== null) {
                seenChecks.set(key, family);
              }
            }
          }

          if (excludedMethods.includes(method.name)) {
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
