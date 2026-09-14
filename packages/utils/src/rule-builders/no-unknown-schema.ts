import type { TSESLint } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

export function buildNoUnknownSchemaCreate(
  scope: ZodImportScope,
): (context: Readonly<TSESLint.RuleContext<'noZUnknown', []>>) => TSESLint.RuleListener {
  return function create(context) {
    const { createSchemaVisitor } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: 'unknown',
      onSchema(node): void {
        context.report({
          node,
          messageId: 'noZUnknown',
        });
      },
    });
  };
}
