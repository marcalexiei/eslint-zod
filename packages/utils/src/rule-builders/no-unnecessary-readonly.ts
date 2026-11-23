import type { ZodExportName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { buildZodConstraintsRemoveFix } from '../build-zod-constraints-remove-fix.js';
import { buildZodWrapperUnwrapFix } from '../build-zod-wrapper-unwrap-fix.js';
import { getOpaqueCheckChainIndexes, mayRewriteZodValue } from '../has-opaque-zod-check.js';
import { readsZodSchemaKind } from '../reads-zod-schema-kind.js';
import type { RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import { ZOD_IMMUTABLE_SCHEMA_TYPES } from '../zod-immutable-schema-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { restoresZodMetadata } from '../zod-metadata.js';
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
      isZodFactoryChainItem,
      getZodChainFactory,
    } = scope.createTracker({ kind: 'value' });

    /** Immutability of the schema `node` builds, up to `endIndex` of its chain. */
    function classifyChain(
      node: TSESTree.CallExpression,
      schemaType: string,
      endIndex?: number,
    ): Immutability {
      const chain = collectZodChainMethods(node);
      // After a property access (`z.string().pipe(x).out.readonly()`) the factory says nothing about the chain.
      const head = chain.at(0);
      if (head && !isZodFactoryChainItem(head)) {
        return 'unknown';
      }

      const precedingNames = chain.slice(1, endIndex).map((it) => it.name);

      if (precedingNames.some((name) => ZOD_TYPE_CHANGING_METHODS.includes(name))) {
        return 'unknown';
      }
      const constraints = collectZodSchemaConstraints(node);
      const opaqueIndexes = getOpaqueCheckChainIndexes(chain, constraints);
      // `default` and `catch` skip the inner `readonly`, and a rewrite replaces what it froze.
      const bypassAt = precedingNames.findLastIndex(
        (name, index) =>
          BYPASSING_WRAPPERS.has(name) ||
          opaqueIndexes.includes(index + 1) ||
          constraints.some((it) => it.chainIndex === index + 1 && mayRewriteZodValue(it.name)),
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
        const argument = chain.at(0)?.node.arguments.at(0);
        if (argument?.type !== AST_NODE_TYPES.CallExpression) {
          return 'unknown';
        }
        const argumentMeta = detectZodSchemaRootNode(argument);
        if (!argumentMeta) {
          return 'unknown';
        }
        const inner = classifyChain(argument, argumentMeta.schemaType);
        return inner === 'readonly' && (bypassAt !== -1 || BYPASSING_WRAPPERS.has(schemaType))
          ? 'unknown'
          : inner;
      }
      return 'unknown';
    }

    /** Immutability of an arbitrary expression (e.g. a wrapper argument). */
    function classifyExpression(node: TSESTree.Node | undefined): Immutability {
      if (node?.type !== AST_NODE_TYPES.CallExpression) {
        return 'unknown';
      }

      const meta = detectZodSchemaRootNode(node);
      return meta ? classifyChain(node, meta.schemaType) : 'unknown';
    }

    return createSchemaVisitor({
      onSchema(node, zodSchemaMeta): void {
        const methods = collectZodChainMethods(node);
        const { sourceCode } = context;
        const constraints = collectZodSchemaConstraints(node);

        // Wrapper form: `z.readonly(inner)` (`zod/mini`).
        if (zodSchemaMeta.schemaType === 'readonly') {
          const wrapperCall = getZodChainFactory(node)?.node;
          const inner =
            wrapperCall?.arguments.length === 1 ? wrapperCall.arguments.at(0) : undefined;
          const immutability = classifyExpression(inner);

          if (wrapperCall && immutability !== 'unknown') {
            context.report({
              node: wrapperCall,
              messageId: 'unnecessaryReadonly',
              suggest: [
                {
                  messageId: 'removeReadonly',
                  fix: (fixer): RuleFix | null =>
                    readsZodSchemaKind(sourceCode, wrapperCall) ||
                    (inner?.type === AST_NODE_TYPES.CallExpression &&
                      restoresZodMetadata(
                        collectZodChainMethods(inner),
                        collectZodSchemaConstraints(inner),
                        collectZodChainMethods(inner).length,
                      ))
                      ? null
                      : buildZodWrapperUnwrapFix({ fixer, sourceCode, wrapperCall }),
                },
              ],
            });
          }
        }

        // Chained form: `schema.readonly()` (`zod`).
        const readonlyConstraints = constraints.filter(
          (it) => it.origin === 'chained' && it.name === 'readonly',
        );

        for (const constraint of readonlyConstraints) {
          const immutability = classifyChain(node, zodSchemaMeta.schemaType, constraint.chainIndex);

          if (immutability !== 'unknown') {
            context.report({
              node: constraint.node,
              messageId: 'unnecessaryReadonly',
              suggest: [
                {
                  messageId: 'removeReadonly',
                  fix: (fixer): Array<RuleFix> | null =>
                    readsZodSchemaKind(sourceCode, constraint.node) ||
                    restoresZodMetadata(methods, constraints, constraint.chainIndex)
                      ? null
                      : buildZodConstraintsRemoveFix({
                          fixer,
                          methods,
                          constraints: [constraint],
                          sourceCode,
                        }),
                },
              ],
            });
          }
        }
      },
    });
  };
}
