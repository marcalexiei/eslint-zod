import { zodImportScope } from '@eslint-zod/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { createZodPluginRule } from '../meta.js';

export const preferMeta = createZodPluginRule({
  name: 'prefer-meta',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Enforce usage of `.meta()` over `.describe()`',
    },
    messages: {
      preferMeta:
        'The `.describe()` method still exists for compatibility with Zod 3, but `.meta()` is now the recommended approach.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = zodImportScope.createTracker({
      kind: 'value',
    });

    return createSchemaVisitor({
      onSchema(node): void {
        const describe = collectZodChainMethods(node).find((it) => it.name === 'describe');

        if (!describe) {
          return;
        }

        const { member } = describe;
        const describeArg = describe.node.arguments.at(0);

        context.report({
          node,
          messageId: 'preferMeta',
          fix(fixer) {
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
