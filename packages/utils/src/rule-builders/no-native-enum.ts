import type { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'useEnum';

/**
 * Builds the `create` function for the `no-native-enum` rule.
 *
 * `nativeEnum` is a plain namespace factory in both `zod` and `zod/mini`,
 * so the same detection and rename fix serve both plugins unchanged.
 */
export function buildNoNativeEnumCreate(
  scope: ZodImportScope,
): (context: Readonly<TSESLint.RuleContext<MessageIds, []>>) => TSESLint.RuleListener {
  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: 'nativeEnum',
      onSchema(node): void {
        // Empty for a computed factory (`z['nativeEnum'](Foo)`), which detection still resolves —
        // report it, just without a fix.
        const rootMethodNode = collectZodChainMethods(node).at(0)?.node;

        context.report({
          node,
          messageId: 'useEnum',
          fix(fixer) {
            // For named imports (e.g., `nativeEnum(Color)`),
            // we cannot safely auto-fix because replacing the entire chain would require access to the namespace prefix.
            // Report the error without a fix in this case.
            if (rootMethodNode?.callee.type !== AST_NODE_TYPES.MemberExpression) {
              return null;
            }

            return fixer.replaceText(rootMethodNode.callee.property, 'enum');
          },
        });
      },
    });
  };
}
