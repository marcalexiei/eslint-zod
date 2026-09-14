import type { TSESLint } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

export function buildNoDuplicateSchemaMethodsCreate(
  scope: ZodImportScope,
  excludedMethods: ReadonlyArray<string>,
): (
  context: Readonly<TSESLint.RuleContext<'noDuplicateSchemaMethod', []>>,
) => TSESLint.RuleListener {
  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      onSchema(node): void {
        const chainMethods = collectZodChainMethods(node);
        const seen = new Set<string>();

        for (const method of chainMethods) {
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
