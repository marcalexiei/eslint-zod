import type { ZodExportName, ZodMethodName } from '@eslint-zod/zod-api';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { ZodSchemaConstraint } from '../collect-zod-schema-constraints.js';
import { getIdentifierValue } from '../get-binding-initializer.js';
import { CALLBACK_CHECK_NAMES } from '../has-opaque-zod-check.js';
import type { RuleContext, RuleListener, SourceCode } from '../rule-types.js';
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

type MessageIds = 'noDuplicateSchemaMethod' | 'noDuplicateCheckArgument';

/** Checks whose repeat is redundant, by family: a later member of a family overrides an earlier one. */
const CHECK_FAMILIES: ReadonlyMap<string, string> = new Map<ZodExportName, string>([
  ['describe', 'describe'],
  ['normalize', 'normalize'],
  ['toLowerCase', 'case'],
  ['toUpperCase', 'case'],
  ['trim', 'trim'],
]);

/** What a check sets within its family; `null` when it cannot be known statically. */
function getCheckArgumentKey(
  constraint: ZodSchemaConstraint,
  sourceCode: Readonly<SourceCode>,
): string | null {
  if (constraint.name !== 'normalize') {
    return constraint.name;
  }
  // `normalize()` defaults to `NFC`, as `String.prototype.normalize` does.
  const form = constraint.node.arguments.at(0);
  if (!form) {
    return 'NFC';
  }
  const value =
    form.type === AST_NODE_TYPES.Identifier ? getIdentifierValue(sourceCode, form) : form;
  return value?.type === AST_NODE_TYPES.Literal && typeof value.value === 'string'
    ? value.value
    : null;
}

/**
 * Records a `.check(...)` call's arguments in `inEffect` (family → key), in order;
 * `undefined` stands for an argument that is not a zod call.
 * Returns the arguments repeating one still in effect.
 */
function trackCheckArguments(
  inEffect: Map<string, string | null>,
  checkArguments: ReadonlyArray<ZodSchemaConstraint | undefined>,
  sourceCode: Readonly<SourceCode>,
): Array<ZodSchemaConstraint> {
  const repeats: Array<ZodSchemaConstraint> = [];
  for (const constraint of checkArguments) {
    const family = constraint && CHECK_FAMILIES.get(constraint.name);
    if (constraint && family) {
      const key = getCheckArgumentKey(constraint, sourceCode);
      if (key !== null && inEffect.get(family) === key) {
        repeats.push(constraint);
      }
      inEffect.set(family, key);
    } else if (
      !constraint ||
      CALLBACK_CHECK_NAMES.has(constraint.name) ||
      ZOD_MUTATING_CHECK_NAMES.includes(constraint.name)
    ) {
      // A check that may rewrite the value, a custom one included, undoes the value checks in effect.
      for (const inEffectFamily of inEffect.keys()) {
        if (inEffectFamily !== 'describe') {
          inEffect.delete(inEffectFamily);
        }
      }
    }
  }
  return repeats;
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
  options: { readonly checkArguments: true },
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener;
export function buildNoDuplicateSchemaMethodsCreate(
  scope: ZodImportScope,
  excludedMethods: ReadonlyArray<string>,
  options?: { readonly checkArguments: true },
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  const checkArguments = options !== undefined;

  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods, collectZodSchemaConstraints } =
      scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      onSchema(node): void {
        const seen = new Set<string>();
        // Check arguments still in effect: family → key.
        const inEffect = new Map<string, string | null>();
        const constraints = checkArguments ? collectZodSchemaConstraints(node) : [];

        for (const method of collectZodChainMethods(node)) {
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

          if (checkArguments && (method.name === 'check' || method.name === 'with')) {
            const repeats = trackCheckArguments(
              inEffect,
              method.node.arguments.map((argument) =>
                constraints.find((it) => it.node === argument),
              ),
              context.sourceCode,
            );
            for (const repeat of repeats) {
              context.report({
                node: repeat.node,
                messageId: 'noDuplicateCheckArgument',
                data: { check: repeat.name },
              });
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
