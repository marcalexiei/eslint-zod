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
        const refines = collectZodChainMethods(node).filter(
          (it) => it.name === 'refine' || it.name === 'custom',
        );

        if (refines.length === 0) {
          return;
        }

        // Check each refine/custom method in the chain
        for (const refine of refines) {
          const refineNode = refine.node;

          // A valid error message requires 2 arguments; otherwise, it's missing
          if (refineNode.arguments.length < 2) {
            context.report({
              messageId: 'requireErrorMessage',
              node: refineNode,
            });
            continue;
          }

          const [, params] = refineNode.arguments;

          // Since the user passes a string, an error message is always included
          if (params.type === AST_NODE_TYPES.Literal) {
            continue;
          }

          // If the param isn't an object expression we bail the detection
          if (params.type !== AST_NODE_TYPES.ObjectExpression) {
            continue;
          }

          // If user is providing an object we search for error and message
          let errorPropertyNode: TSESTree.Property | undefined;
          let messagePropertyNode: TSESTree.Property | undefined;
          for (const property of params.properties) {
            if (property.type === AST_NODE_TYPES.Property) {
              const keyName = getStaticPropertyName(property);

              if (keyName === 'error') {
                errorPropertyNode = property;
              }

              if (keyName === 'message') {
                messagePropertyNode = property;
              }

              if (errorPropertyNode && messagePropertyNode) {
                break;
              }
            }
          }

          if (errorPropertyNode && messagePropertyNode) {
            context.report({
              messageId: 'removeMessage',
              node: messagePropertyNode,
              fix(fixer) {
                const { sourceCode } = context;
                const nextToken = sourceCode.getTokenAfter(messagePropertyNode);
                let [, end] = messagePropertyNode.range;

                // If there's a comma after the property, include it
                if (nextToken?.value === ',') {
                  end = nextToken.range[1];
                }

                const removal: TSESTree.Range = [messagePropertyNode.range[0], end];
                return hasCommentInRange(sourceCode, removal) ? null : fixer.removeRange(removal);
              },
            });
            continue;
          }

          if (messagePropertyNode && !errorPropertyNode) {
            context.report({
              messageId: 'preferError',
              node: params,
              fix(fixer) {
                // Renaming the key of a shorthand would rename the variable it reads.
                if (messagePropertyNode.shorthand) {
                  return fixer.insertTextBefore(messagePropertyNode, 'error: ');
                }
                // Inside brackets (`['message']`) a bare name would be a reference.
                return fixer.replaceText(
                  messagePropertyNode.key,
                  messagePropertyNode.computed ? "'error'" : 'error',
                );
              },
            });
            continue;
          }

          if (!errorPropertyNode) {
            context.report({
              messageId: 'requireErrorMessage',
              node: params,
            });
          }
        }
      },
    });
  };
}
