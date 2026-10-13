import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { hasCommentInRange } from '../has-comment-in-range.js';
import { hasParenthesizedReceiver } from '../has-parenthesized-receiver.js';
import type { RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'missingTypeParameter' | 'removeBrandFunction';

export function buildRequireBrandTypeParameterCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      onSchema(node): void {
        const methods = collectZodChainMethods(node);

        const brandMethod = methods.find((it) => it.name === 'brand');

        if (!brandMethod) {
          return;
        }

        const brandNode = brandMethod.node;

        const { typeArguments } = brandNode;

        // `.brand('id')` infers the brand from its argument.
        if ((typeArguments && typeArguments.params.length > 0) || brandNode.arguments.length > 0) {
          return;
        }

        const brandCalleeNode = brandNode.callee;

        // A `brand` called bare or on the namespace is a factory, not the `.brand()` method.
        if (
          brandCalleeNode.type !== AST_NODE_TYPES.MemberExpression ||
          brandCalleeNode.object.type === AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        const removal: TSESTree.Range = [brandCalleeNode.object.range[1], brandNode.range[1]];

        context.report({
          messageId: 'missingTypeParameter',
          node: brandCalleeNode.property,
          // Cutting at the receiver's end would leave a closing parenthesis behind, or drop a comment.
          suggest:
            hasParenthesizedReceiver(brandCalleeNode) ||
            hasCommentInRange(context.sourceCode, removal)
              ? []
              : [
                  {
                    messageId: 'removeBrandFunction',
                    fix(fixer): RuleFix {
                      return fixer.removeRange(removal);
                    },
                  },
                ],
        });
      },
    });
  };
}
