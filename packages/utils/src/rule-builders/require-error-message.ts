import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { getStaticPropertyName } from '../get-static-property-name.js';
import { hasCommentInRange } from '../has-comment-in-range.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'requireErrorMessage' | 'preferError' | 'removeMessage';

export function buildRequireErrorMessageCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      onSchema(node): void {
        for (const { name, node: call } of collectZodChainMethods(node)) {
          if (name !== 'refine' && name !== 'custom') {
            continue;
          }
          const params = call.arguments.at(1);
          if (!params) {
            context.report({ messageId: 'requireErrorMessage', node: call });
            continue;
          }
          // A string is the message itself; anything else but an object literal is not analyzed.
          if (params.type !== AST_NODE_TYPES.ObjectExpression) {
            continue;
          }

          const findProperty = (key: string): TSESTree.Property | undefined =>
            params.properties.findLast(
              (property): property is TSESTree.Property =>
                property.type === AST_NODE_TYPES.Property &&
                getStaticPropertyName(property) === key,
            );
          const error = findProperty('error');
          const message = findProperty('message');

          if (error && message) {
            context.report({
              messageId: 'removeMessage',
              node: message,
              fix(fixer) {
                const { sourceCode } = context;
                const comma = sourceCode.getTokenAfter(message);
                const removal: TSESTree.Range = [
                  message.range[0],
                  comma?.value === ',' ? comma.range[1] : message.range[1],
                ];
                return hasCommentInRange(sourceCode, removal) ? null : fixer.removeRange(removal);
              },
            });
          } else if (message) {
            context.report({
              messageId: 'preferError',
              node: params,
              fix(fixer) {
                // Renaming the key of a shorthand would rename the variable it reads.
                if (message.shorthand) {
                  return fixer.insertTextBefore(message, 'error: ');
                }
                // Inside brackets (`['message']`) a bare name would be a reference.
                return fixer.replaceText(message.key, message.computed ? "'error'" : 'error');
              },
            });
          } else if (!error) {
            context.report({ messageId: 'requireErrorMessage', node: params });
          }
        }
      },
    });
  };
}
