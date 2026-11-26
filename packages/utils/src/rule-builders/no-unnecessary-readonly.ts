import type { ZodExportName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { buildZodConstraintsRemoveFix } from '../build-zod-constraints-remove-fix.js';
import { buildZodWrapperUnwrapFix } from '../build-zod-wrapper-unwrap-fix.js';
import { getOpaqueCheckChainIndexes, mayRewriteZodValue } from '../has-opaque-zod-check.js';
import { readsZodSchemaKind } from '../reads-zod-schema-kind.js';
import type { ReportFixFunction, RuleContext, RuleListener } from '../rule-types.js';
import { ZOD_IMMUTABLE_SCHEMA_TYPES } from '../zod-immutable-schema-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { ZOD_TYPE_CHANGING_METHODS } from '../zod-type-changing-methods.js';

type MessageIds = 'unnecessaryReadonly' | 'removeReadonly';

/**
 * Wrapper factories whose output immutability equals their first argument's (e.g. `z.optional(z.string())` is as immutable as `z.string()`).
 */
const PASSTHROUGH_WRAPPERS: ReadonlySet<string> = new Set<ZodExportName>([
  '_default',
  'catch',
  'default',
  'nonoptional',
  'nullable',
  'nullish',
  'optional',
]);

/** Passthrough wrappers that can return a value their argument never produced. */
const BYPASSING_WRAPPERS: ReadonlySet<string> = new Set<ZodExportName>([
  '_default',
  'catch',
  'default',
]);

type Immutability = 'immutable' | 'readonly' | 'unknown';

/**
 * Builds the `create` function for the `no-unnecessary-readonly` rule.
 *
 * Handles both API spellings with the same logic:
 * the chained `.readonly()` method (`zod`) is found via `collectZodSchemaConstraints`,
 * and the `z.readonly(inner)` wrapper (`zod/mini`) via the schema root's factory.
 * A `readonly` is reported when the schema it wraps is already immutable —
 * its base type is a primitive/scalar (`ZOD_IMMUTABLE_SCHEMA_TYPES`, looked up through passthrough wrappers such as `optional`) or it is itself already `readonly`.
 */
export function buildNoUnnecessaryReadonlyCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const {
      createSchemaVisitor,
      detectZodSchemaRootNode,
      collectZodChainMethods,
      collectZodSchemaConstraints,
      getZodChainFactory,
      restoresZodMetadata,
    } = scope.createTracker({ kind: 'value' });

    /** Immutability of the schema `node` builds, up to `endIndex` of its chain. */
    function classify(node: TSESTree.Node | undefined, endIndex?: number): Immutability {
      if (node?.type !== AST_NODE_TYPES.CallExpression) {
        return 'unknown';
      }
      const meta = detectZodSchemaRootNode(node);
      if (!meta) {
        return 'unknown';
      }
      const { schemaType } = meta;
      const chain = collectZodChainMethods(node);
      const factory = getZodChainFactory(node);
      // After a property access (`z.string().pipe(x).out.readonly()`) the factory says nothing about the chain.
      if (chain.length > 0 && !factory) {
        return 'unknown';
      }

      const precedingNames = chain.slice(1, endIndex).map((it) => it.name);

      if (precedingNames.some((name) => ZOD_TYPE_CHANGING_METHODS.includes(name))) {
        return 'unknown';
      }
      const constraints = collectZodSchemaConstraints(node);
      const rewriteIndexes = new Set([
        ...getOpaqueCheckChainIndexes(chain, constraints),
        ...constraints.filter((it) => mayRewriteZodValue(it.name)).map((it) => it.chainIndex),
      ]);
      // `default` and `catch` skip the inner `readonly`, and a rewrite replaces what it froze.
      const bypassAt = precedingNames.findLastIndex(
        (name, index) => BYPASSING_WRAPPERS.has(name) || rewriteIndexes.has(index + 1),
      );
      if (
        precedingNames.lastIndexOf('readonly') > bypassAt ||
        (schemaType === 'readonly' && bypassAt === -1)
      ) {
        return 'readonly';
      }
      if (ZOD_IMMUTABLE_SCHEMA_TYPES.includes(schemaType)) {
        return 'immutable';
      }
      if (PASSTHROUGH_WRAPPERS.has(schemaType)) {
        // A passthrough wrapper is as immutable as its first argument.
        const inner = classify(factory?.node.arguments.at(0));
        return inner === 'readonly' && (bypassAt !== -1 || BYPASSING_WRAPPERS.has(schemaType))
          ? 'unknown'
          : inner;
      }
      return 'unknown';
    }

    return createSchemaVisitor({
      onSchema(node, zodSchemaMeta): void {
        const methods = collectZodChainMethods(node);
        const { sourceCode } = context;
        const report = (
          call: TSESTree.CallExpression,
          restoresMetadata: boolean,
          remove: ReportFixFunction,
        ): void => {
          context.report({
            node: call,
            messageId: 'unnecessaryReadonly',
            suggest: [
              {
                messageId: 'removeReadonly',
                fix: (fixer): ReturnType<ReportFixFunction> =>
                  restoresMetadata || readsZodSchemaKind(sourceCode, call) ? null : remove(fixer),
              },
            ],
          });
        };

        // Wrapper form: `z.readonly(inner)` (`zod/mini`).
        if (zodSchemaMeta.schemaType === 'readonly') {
          const wrapperCall = getZodChainFactory(node)?.node;
          const inner =
            wrapperCall?.arguments.length === 1 ? wrapperCall.arguments.at(0) : undefined;
          if (wrapperCall && classify(inner) !== 'unknown') {
            report(
              wrapperCall,
              inner?.type === AST_NODE_TYPES.CallExpression && restoresZodMetadata(inner),
              (fixer) => buildZodWrapperUnwrapFix({ fixer, sourceCode, wrapperCall }),
            );
          }
        }

        // Chained form: `schema.readonly()` (`zod`).
        for (const constraint of collectZodSchemaConstraints(node)) {
          if (
            constraint.origin === 'chained' &&
            constraint.name === 'readonly' &&
            classify(node, constraint.chainIndex) !== 'unknown'
          ) {
            report(constraint.node, restoresZodMetadata(node, constraint.chainIndex), (fixer) =>
              buildZodConstraintsRemoveFix({
                fixer,
                methods,
                constraints: [constraint],
                sourceCode,
              }),
            );
          }
        }
      },
    });
  };
}
