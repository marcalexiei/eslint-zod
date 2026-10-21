import type { ZodExportName } from '@eslint-zod/tooling/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { isZodFactoryChainItem } from '../is-zod-factory-chain-item.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'noTransformInRecordKey';

const RECORD_FACTORY_NAMES: ReadonlyArray<ZodExportName> = [
  'record',
  'partialRecord',
  'looseRecord',
];

/**
 * Builds the `create` function for the `no-transform-in-record-key` rule.
 *
 * Takes the names that count as a transform for the plugin's API style and matches them against a `z.record()` key schema —
 * both its factory (`z.record(z.transform(fn), …)`) and its constraints,
 * which cover chained methods in `zod` and `.check(...)` arguments in `zod/mini`.
 */
export function buildNoTransformInRecordKeyCreate(
  scope: ZodImportScope,
  transformNames: ReadonlyArray<string>,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const {
      createSchemaVisitor,
      detectZodSchemaRootNode,
      collectZodChainMethods,
      collectZodSchemaConstraints,
    } = scope.createTracker({ kind: 'value' });

    function findTransform(schema: TSESTree.CallExpression): TSESTree.Node | undefined {
      // The factory itself can be the transform; the constraint list starts after it.
      const factory = detectZodSchemaRootNode(schema);
      if (factory && transformNames.includes(factory.schemaType)) {
        return schema;
      }

      const constraint = collectZodSchemaConstraints(schema).find((it) =>
        transformNames.includes(it.name),
      );
      if (constraint) {
        return constraint.node;
      }

      // `z.pipe(z.string(), z.transform(fn))`: the transform is one of the piped schemas.
      if (factory?.schemaType === 'pipe') {
        for (const argument of schema.arguments) {
          const found =
            argument.type === AST_NODE_TYPES.CallExpression ? findTransform(argument) : undefined;
          if (found) {
            return found;
          }
        }
      }

      return undefined;
    }

    return createSchemaVisitor({
      schemaType: RECORD_FACTORY_NAMES,
      onSchema(node): void {
        // `node` is the outermost call, which is not the `record()` one once something is chained on it.
        const head = collectZodChainMethods(node).at(0);
        // After a property access (`z.record(k, v).keyType.or(…)`) the chain is not the record's.
        if (head && !isZodFactoryChainItem(head)) {
          return;
        }
        const recordCall = head?.node ?? node;
        const keySchema = recordCall.arguments.at(0);

        if (keySchema?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const reportNode = findTransform(keySchema);

        if (reportNode) {
          context.report({
            node: reportNode,
            messageId: 'noTransformInRecordKey',
          });
        }
      },
    });
  };
}
