import type { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'noZAny' | 'useUnknown';

export function buildNoAnySchemaCreate(
  scope: ZodImportScope,
): (context: Readonly<TSESLint.RuleContext<MessageIds, []>>) => TSESLint.RuleListener {
  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: 'any',
      onSchema(node): void {
        const { callee } = node;

        if (callee.type === AST_NODE_TYPES.Identifier) {
          context.report({
            node,
            messageId: 'noZAny',
          });
          return;
        }

        if (callee.type === AST_NODE_TYPES.MemberExpression) {
          // The chain is empty when the factory is not a plain member access (e.g. `z['any']()`),
          // and its callee is a bare identifier for a named import (`any().optional()`).
          // Neither can be renamed, so both fall through to the plain report below.
          const schemaMethodCallee = collectZodChainMethods(node).at(0)?.node.callee;

          if (
            schemaMethodCallee?.type === AST_NODE_TYPES.MemberExpression &&
            schemaMethodCallee.property.type === AST_NODE_TYPES.Identifier
          ) {
            context.report({
              node,
              messageId: 'noZAny',
              suggest: [
                {
                  messageId: 'useUnknown',
                  fix(fixer): TSESLint.RuleFix {
                    return fixer.replaceText(schemaMethodCallee.property, 'unknown');
                  },
                },
              ],
            });
            return;
          }

          context.report({
            node,
            messageId: 'noZAny',
          });
        }
      },
    });
  };
}
