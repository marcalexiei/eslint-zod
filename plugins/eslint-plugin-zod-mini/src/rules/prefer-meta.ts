import { zodMiniImportScope } from '@eslint-zod/utils';
import type { TSESTree } from '@typescript-eslint/utils';

import { createZodMiniPluginRule } from '../utils/create-plugin-rule.js';

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
    const { createSchemaVisitor } = zodMiniImportScope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: 'describe',
      onSchema(node, zodSchemaMeta) {
        context.report({
          node,
          messageId: 'preferMeta',
          fix(fixer) {
            if (zodSchemaMeta.schemaDecl === 'named') {
              return null;
            }

            // A namespace schema is detected only when its factory is a member of the namespace,
            // so this call is always `<ns>.<factory>(…)`.
            const callee = node.callee as TSESTree.MemberExpression;

            // …but the key may be computed (`z['describe'](…)`), which detection still resolves.
            // The property is then the string literal, so renaming it would emit `z[meta](…)`.
            if (callee.computed) {
              return null;
            }

            const [describeArg] = node.arguments;

            return [
              fixer.replaceText(callee.property, 'meta'),
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
