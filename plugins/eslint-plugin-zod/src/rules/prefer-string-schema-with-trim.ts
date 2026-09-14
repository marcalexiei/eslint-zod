import { findParentSchemaMatchingCondition, zodImportScope } from '@eslint-zod/utils';

import { createZodPluginRule } from '../utils/create-plugin-rule.js';

export const preferStringSchemaWithTrim = createZodPluginRule({
  name: 'prefer-string-schema-with-trim',
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Enforce `z.string().trim()` to prevent accidental leading/trailing whitespace',
    },
    messages: {
      addTrim: '`z.string()` schemas should use `.trim()`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = zodImportScope.createTracker({
      kind: 'value',
    });

    return createSchemaVisitor({
      schemaType: 'string',
      onSchema(node, zodSchemaMeta): void {
        // Skip if this string schema is the key schema of z.record() because transforms on record keys cause data loss
        // https://github.com/marcalexiei/eslint-zod/issues/242
        if (
          findParentSchemaMatchingCondition(node, {
            schemaName: 'record',
            condition: (callParent) =>
              callParent.arguments.length > 0 && callParent.arguments[0] === node,
          })
        ) {
          return;
        }

        const methods = collectZodChainMethods(node);

        if (methods.some((it) => it.name === 'trim')) {
          return;
        }

        context.report({
          node,
          messageId: 'addTrim',
          fix(fixer) {
            // Empty for a computed factory (`z['string']()`), which detection still resolves —
            // report it, just without a fix.
            const factoryCall = methods.at(0);
            if (zodSchemaMeta.schemaDecl === 'named' || !factoryCall) {
              return null;
            }

            return fixer.insertTextAfter(factoryCall.node, '.trim()');
          },
        });
      },
    });
  },
});
