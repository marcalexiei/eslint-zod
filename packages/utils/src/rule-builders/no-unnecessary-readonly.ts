import type { ZodExportName } from '@eslint-zod/tooling/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { buildZodConstraintsRemoveFix } from '../build-zod-constraints-remove-fix.js';
import { buildZodWrapperUnwrapFix } from '../build-zod-wrapper-unwrap-fix.js';
import { isZodFactoryChainItem } from '../is-zod-factory-chain-item.js';
import { readsZodSchemaProperty } from '../reads-zod-schema-property.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodChainItem } from '../track-zod-schema-imports.js';
import { ZOD_IMMUTABLE_SCHEMA_TYPES } from '../zod-immutable-schema-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { ZOD_TYPE_CHANGING_METHODS } from '../zod-type-changing-methods.js';

type MessageIds = 'unnecessaryReadonly';

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

type Immutability = 'immutable' | 'readonly' | 'unknown';

type ChainItems = Array<ZodChainItem>;

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
    } = scope.createTracker({ kind: 'value' });

    /** Immutability of the schema produced by `chain[0..endIndex)`. */
    function classifyChain(schemaType: string, chain: ChainItems, endIndex: number): Immutability {
      // After a property access (`z.string().pipe(x).out.readonly()`) the factory says nothing about the chain.
      const head = chain.at(0);
      if (head && !isZodFactoryChainItem(head)) {
        return 'unknown';
      }

      const precedingNames = chain.slice(1, endIndex).map((it) => it.name);

      if (precedingNames.some((name) => ZOD_TYPE_CHANGING_METHODS.includes(name))) {
        return 'unknown';
      }
      if (precedingNames.includes('readonly') || schemaType === 'readonly') {
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
        // `….def.innerType` exists on the readonly schema only, so its removal is not offered there.
        const isFixable = !readsZodSchemaProperty(node, zodSchemaMeta);

        // Wrapper form: `z.readonly(inner)` (`zod/mini`).
        if (zodSchemaMeta.schemaType === 'readonly') {
          const head = methods.at(0);
          const wrapperCall = head && isZodFactoryChainItem(head) ? head.node : undefined;
          const inner =
            wrapperCall?.arguments.length === 1 ? wrapperCall.arguments.at(0) : undefined;
          const immutability = classifyExpression(inner);

          if (wrapperCall && immutability !== 'unknown') {
            context.report({
              node: wrapperCall,
              messageId: 'unnecessaryReadonly',
              fix: (fixer) =>
                isFixable
                  ? buildZodWrapperUnwrapFix({ fixer, sourceCode: context.sourceCode, wrapperCall })
                  : null,
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
                isFixable
                  ? buildZodConstraintsRemoveFix({
                      fixer,
                      methods,
                      constraints: [constraint],
                      sourceCode: context.sourceCode,
                    })
                  : null,
            });
          }
        }
      },
    });
  };
}
