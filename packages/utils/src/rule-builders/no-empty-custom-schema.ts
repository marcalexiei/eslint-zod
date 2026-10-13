import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

export function buildNoEmptyCustomSchemaCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<'noEmptyCustomSchema'>>) => RuleListener {
  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: 'custom',
      onSchema(node): void {
        // Find the actual custom() call node in the chain
        const chainMethods = collectZodChainMethods(node);
        const customCallNode = chainMethods.find((method) => method.name === 'custom')?.node;

        if (customCallNode?.arguments.length === 0) {
          context.report({
            node: customCallNode,
            messageId: 'noEmptyCustomSchema',
          });
        }
      },
    });
  };
}
