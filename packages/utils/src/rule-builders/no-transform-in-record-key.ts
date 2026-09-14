import type { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'noTransformInRecordKey';

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
): (context: Readonly<TSESLint.RuleContext<MessageIds, []>>) => TSESLint.RuleListener {
  return function create(context) {
    const { createSchemaVisitor, detectZodSchemaRootNode, collectZodSchemaConstraints } =
      scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: 'record',
      onSchema(node): void {
        const keySchema = node.arguments.at(0);

        if (keySchema?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        // The factory itself can be the transform; the constraint list starts after it.
        const factory = detectZodSchemaRootNode(keySchema);
        const reportNode =
          factory && transformNames.includes(factory.schemaType)
            ? keySchema
            : collectZodSchemaConstraints(keySchema).find((constraint) =>
                transformNames.includes(constraint.name),
              )?.node;

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
