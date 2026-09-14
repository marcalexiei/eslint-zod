import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'missingTypeParameter' | 'removeBrandFunction';

export function buildRequireBrandTypeParameterCreate(
  scope: ZodImportScope,
): (context: Readonly<TSESLint.RuleContext<MessageIds, []>>) => TSESLint.RuleListener {
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

        if (typeArguments && typeArguments.params.length > 0) {
          return;
        }

        const brandCalleeNode = brandNode.callee as TSESTree.MemberExpression;

        context.report({
          messageId: 'missingTypeParameter',
          node: brandCalleeNode.property,
          suggest: [
            {
              messageId: 'removeBrandFunction',
              fix(fixer): TSESLint.RuleFix {
                return fixer.removeRange([brandCalleeNode.object.range[1], brandNode.range[1]]);
              },
            },
          ],
        });
      },
    });
  };
}
