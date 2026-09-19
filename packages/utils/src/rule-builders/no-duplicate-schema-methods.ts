import type { TSESLint } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';
import { ZOD_TYPE_CHANGING_METHODS } from '../zod-type-changing-methods.js';

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
          // A type-changing method starts a new segment: what follows constrains a different schema.
          if (ZOD_TYPE_CHANGING_METHODS.includes(method.name)) {
            seen.clear();
            continue;
          }

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
