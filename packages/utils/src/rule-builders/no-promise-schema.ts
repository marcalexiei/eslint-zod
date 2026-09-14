import type { TSESLint } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'noPromiseSchema';

/**
 * Builds the `create` function for the `no-promise-schema` rule.
 *
 * `promise` is a plain namespace factory in both `zod` and `zod/mini`,
 * so the same detection serves both plugins unchanged.
 * There is no fix: the migration is to await the value before parsing it,
 * which depends on the surrounding control flow.
 */
export function buildNoPromiseSchemaCreate(
  scope: ZodImportScope,
): (context: Readonly<TSESLint.RuleContext<MessageIds, []>>) => TSESLint.RuleListener {
  return function create(context) {
    const { createSchemaVisitor } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: 'promise',
      onSchema(node): void {
        context.report({
          node,
          messageId: 'noPromiseSchema',
        });
      },
    });
  };
}
