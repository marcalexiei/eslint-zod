import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { buildZodConstraintsRemoveFix } from '../build-zod-constraints-remove-fix.js';
import { buildZodWrapperUnwrapFix } from '../build-zod-wrapper-unwrap-fix.js';
import { ZOD_IMMUTABLE_SCHEMA_TYPES } from '../zod-immutable-schema-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'unnecessaryReadonly';

/**
 * Chained methods that change the schema's output type,
 * making the immutability of the factory's output irrelevant for what `readonly` ultimately wraps (e.g. `z.string().transform(s => [s]).readonly()`).
 */
const TYPE_CHANGING_METHODS = ['and', 'array', 'or', 'pipe', 'preprocess', 'transform'];

/**
 * Wrapper factories whose output immutability equals their first argument's (e.g. `z.optional(z.string())` is as immutable as `z.string()`).
 */
const PASSTHROUGH_WRAPPERS = [
  '_default',
  'catch',
  'default',
  'nonoptional',
  'nullable',
  'nullish',
  'optional',
];

type Immutability = 'immutable' | 'readonly' | 'unknown';

type ChainItems = Array<{ name: string; node: TSESTree.CallExpression }>;

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
): (context: Readonly<TSESLint.RuleContext<MessageIds, []>>) => TSESLint.RuleListener {
  return function create(context) {
    const {
      createSchemaVisitor,
      detectZodSchemaRootNode,
      collectZodChainMethods,
      collectZodSchemaConstraints,
    } = scope.createTracker({ kind: 'value' });

    /** Immutability of the schema produced by `chain[0..endIndex)`. */
    function classifyChain(schemaType: string, chain: ChainItems, endIndex: number): Immutability {
      const precedingNames = chain.slice(1, endIndex).map((it) => it.name);

      if (precedingNames.some((name) => TYPE_CHANGING_METHODS.includes(name))) {
        return 'unknown';
      }
      if (precedingNames.includes('readonly') || schemaType === 'readonly') {
        return 'readonly';
      }
      if (ZOD_IMMUTABLE_SCHEMA_TYPES.includes(schemaType)) {
        return 'immutable';
      }
      if (PASSTHROUGH_WRAPPERS.includes(schemaType)) {
        // A passthrough wrapper is as immutable as its first argument.
        const argument = chain.at(0)?.node.arguments.at(0);
        if (argument?.type !== AST_NODE_TYPES.CallExpression) {
          return 'unknown';
        }
        const argumentMeta = detectZodSchemaRootNode(argument);
        if (!argumentMeta) {
          return 'unknown';
        }
        const argumentChain = collectZodChainMethods(argument);
        return classifyChain(argumentMeta.schemaType, argumentChain, argumentChain.length);
      }
      return 'unknown';
    }

    /** Immutability of an arbitrary expression (e.g. a wrapper argument). */
    function classifyExpression(node: TSESTree.Node | undefined): Immutability {
      if (node?.type !== AST_NODE_TYPES.CallExpression) {
        return 'unknown';
      }

      const meta = detectZodSchemaRootNode(node);
      if (!meta) {
        return 'unknown';
      }

      const chain = collectZodChainMethods(node);
      return classifyChain(meta.schemaType, chain, chain.length);
    }

    return createSchemaVisitor({
      onSchema(node, zodSchemaMeta): void {
        const methods = collectZodChainMethods(node);

        // Wrapper form: `z.readonly(inner)` (`zod/mini`).
        if (zodSchemaMeta.schemaType === 'readonly') {
          const wrapperCall = methods.at(0)?.node;
          const inner =
            wrapperCall?.arguments.length === 1 ? wrapperCall.arguments.at(0) : undefined;
          const immutability = classifyExpression(inner);

          if (wrapperCall && immutability !== 'unknown') {
            context.report({
              node: wrapperCall,
              messageId: 'unnecessaryReadonly',
              fix: (fixer) =>
                buildZodWrapperUnwrapFix({ fixer, sourceCode: context.sourceCode, wrapperCall }),
            });
          }
        }

        // Chained form: `schema.readonly()` (`zod`).
        const readonlyConstraints = collectZodSchemaConstraints(node).filter(
          (it) => it.origin === 'chained' && it.name === 'readonly',
        );

        for (const constraint of readonlyConstraints) {
          const immutability = classifyChain(
            zodSchemaMeta.schemaType,
            methods,
            constraint.chainIndex,
          );

          if (immutability !== 'unknown') {
            context.report({
              node: constraint.node,
              messageId: 'unnecessaryReadonly',
              fix: (fixer) =>
                buildZodConstraintsRemoveFix({ fixer, methods, constraints: [constraint] }),
            });
          }
        }
      },
    });
  };
}
