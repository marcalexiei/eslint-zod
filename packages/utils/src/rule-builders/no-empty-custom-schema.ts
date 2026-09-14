import type { TSESLint } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

export function buildNoEmptyCustomSchemaCreate(
  scope: ZodImportScope,
): (context: Readonly<TSESLint.RuleContext<'noEmptyCustomSchema', []>>) => TSESLint.RuleListener {
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
