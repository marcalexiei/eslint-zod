import { zodMiniImportScope } from '@eslint-zod/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { createZodMiniPluginRule } from '../meta.js';

export const preferMeta = createZodMiniPluginRule({
  name: 'prefer-meta',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Enforce usage of `z.meta()` over `z.describe()`',
    },
    messages: {
      preferMeta:
        'The `z.describe()` function still exists for compatibility with Zod 3, but `z.meta()` is now the recommended approach.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = zodMiniImportScope.createTracker({
      kind: 'value',
    });

    return createSchemaVisitor({
      schemaType: 'describe',
      onSchema(node) {
        // The `describe` call itself: `node` is the outermost call, which differs once something is chained on it.
        // Empty for a computed factory (`z['describe'](…)`), which detection still resolves.
        const describe = collectZodChainMethods(node).at(0);

        context.report({
          node,
          messageId: 'preferMeta',
          fix(fixer) {
            const member = describe?.member;
            const describeArg = describe?.node.arguments.at(0);

            // A named import (`describe('…')`) has no property to rename,
            // and a missing or spread argument has no single value to wrap.
            if (!member || !describeArg || describeArg.type === AST_NODE_TYPES.SpreadElement) {
              return null;
            }

            return [
              fixer.replaceText(member.property, 'meta'),
              fixer.replaceText(
                describeArg,
                `{ description: ${context.sourceCode.getText(describeArg)} }`,
              ),
            ];
          },
        });
      },
    });
  },
});
