import { buildZodChainRemoveMethodFix, zodImportScope } from '@eslint-zod/utils';

import { createZodPluginRule } from '../meta.js';

export const noNumberSchemaWithFinite = createZodPluginRule({
  name: 'no-number-schema-with-finite',
  meta: {
    fixable: 'code',
    type: 'problem',
    docs: {
      description:
        'Disallow deprecated `z.number().finite()`. In Zod 4+ number schemas do not allow infinite values by default, so it is a no-op.',
    },
    messages: {
      removeFinite:
        '`.finite()` is deprecated. In Zod 4+ `z.number()` does not allow infinite values by default. Remove this call.',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const { createSchemaVisitor, findZodChainedMethod } = zodImportScope.createTracker({
      kind: 'value',
    });

    return createSchemaVisitor({
      schemaType: 'number',
      onSchema(node, zodSchemaMeta): void {
        const finite = findZodChainedMethod(node, zodSchemaMeta, 'finite');
        if (finite === null) {
          return;
        }

        context.report({
          node,
          messageId: 'removeFinite',
          fix(fixer) {
            // A computed factory (`z['number']().finite()`) is reported without a fix.
            if (finite.member === null) {
              return null;
            }

            return buildZodChainRemoveMethodFix({
              fixer,
              methods: finite.methods,
              removeIndex: finite.index,
              sourceCode: context.sourceCode,
            });
          },
        });
      },
    });
  },
});
