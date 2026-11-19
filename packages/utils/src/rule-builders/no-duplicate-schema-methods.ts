import type { ZodExportName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { ZodSchemaConstraint } from '../collect-zod-schema-constraints.js';
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

export interface NoDuplicateSchemaMethodsOptions {
  /** Also report a `.check(...)` argument that repeats an earlier one: `zod/mini` only. */
  checkArguments: true;
}

type MessageIds = 'noDuplicateSchemaMethod' | 'noDuplicateCheckArgument';

/** Checks whose second application is redundant; accumulating checks are left out. */
const SETTER_CHECK_NAMES: ReadonlySet<string> = new Set<ZodExportName>([
  'describe',
  'normalize',
  'toLowerCase',
  'toUpperCase',
  'trim',
]);

/** What two check arguments must share to be duplicates. */
function getCheckArgumentKey(
  constraint: ZodSchemaConstraint,
  sourceCode: Pick<SourceCode, 'getText'>,
): string {
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
  return `normalize:${sourceCode.getText(form)}`;
}

/**
 * Reports a method called twice in one chain segment, the excluded ones aside.
 * With `checkArguments`, a setter-like `.check(...)` argument repeated in the segment is reported too.
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
  const checkArguments = options?.checkArguments === true;

  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods, collectZodSchemaConstraints } =
      scope.createTracker({ kind: 'value' });

    function getCheckArguments(
      node: TSESTree.CallExpression,
    ): Map<number, Array<ZodSchemaConstraint>> {
      const byChainIndex = new Map<number, Array<ZodSchemaConstraint>>();
      if (!checkArguments) {
        return byChainIndex;
      }
      for (const constraint of collectZodSchemaConstraints(node)) {
        if (constraint.origin !== 'check-argument' || !SETTER_CHECK_NAMES.has(constraint.name)) {
          continue;
        }
        const group = byChainIndex.get(constraint.chainIndex) ?? [];
        group.push(constraint);
        byChainIndex.set(constraint.chainIndex, group);
      }
      return byChainIndex;
    }

    return createSchemaVisitor({
      onSchema(node): void {
        const chainMethods = collectZodChainMethods(node);
        const checkArgumentsByChainIndex = getCheckArguments(node);
        const seen = new Set<string>();
        const seenCheckArguments = new Set<string>();

        for (const [chainIndex, method] of chainMethods.entries()) {
          // A type-changing method starts a new segment: what follows constrains a different schema.
          if (ZOD_TYPE_CHANGING_METHODS.includes(method.name)) {
            seen.clear();
            seenCheckArguments.clear();
            continue;
          }

          for (const constraint of checkArgumentsByChainIndex.get(chainIndex) ?? []) {
            const key = getCheckArgumentKey(constraint, context.sourceCode);
            if (seenCheckArguments.has(key)) {
              context.report({
                node: constraint.node,
                messageId: 'noDuplicateCheckArgument',
                data: { check: constraint.name },
              });
            } else {
              seenCheckArguments.add(key);
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
