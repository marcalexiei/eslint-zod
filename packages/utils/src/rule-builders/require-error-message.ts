import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'requireErrorMessage' | 'preferError' | 'removeMessage';

export function buildRequireErrorMessageCreate(
  scope: ZodImportScope,
): (context: Readonly<TSESLint.RuleContext<MessageIds, []>>) => TSESLint.RuleListener {
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
            if (
              property.type === AST_NODE_TYPES.Property &&
              property.key.type === AST_NODE_TYPES.Identifier
            ) {
              if (property.key.name === 'error') {
                errorPropertyNode = property;
              }

              if (property.key.name === 'message') {
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

                return fixer.removeRange([messagePropertyNode.range[0], end]);
              },
            });
            continue;
          }

          if (messagePropertyNode && !errorPropertyNode) {
            context.report({
              messageId: 'preferError',
              node: params,
              fix(fixer) {
                return fixer.replaceTextRange(messagePropertyNode.key.range, 'error');
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
