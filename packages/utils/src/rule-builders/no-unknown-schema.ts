import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

export function buildNoUnknownSchemaCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<'noZUnknown'>>) => RuleListener {
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
