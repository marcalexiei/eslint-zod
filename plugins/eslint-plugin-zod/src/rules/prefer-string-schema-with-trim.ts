import { zodImportScope } from '@eslint-zod/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { createZodPluginRule } from '../meta.js';
import { isRecordKeySchema } from '../utils/is-record-key-schema.js';

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
    const { createSchemaVisitor, collectZodChainMethods, isZodSchemaOfType } =
      zodImportScope.createTracker({
        kind: 'value',
      });

    return createSchemaVisitor({
      schemaType: 'string',
      onSchema(node, zodSchemaMeta): void {
        if (isRecordKeySchema(node, isZodSchemaOfType)) {
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
            // Empty for a computed factory (`z['string']()`), which detection still resolves,
            // and resumed at a later call after a property access (`z.string().safeParse(x).data.at(0)`) —
            // report it, just without a fix.
            const factoryCall = methods.at(0);
            if (
              zodSchemaMeta.schemaDecl === 'named' ||
              factoryCall?.member?.object.type !== AST_NODE_TYPES.Identifier
            ) {
              return null;
            }

            return fixer.insertTextAfter(factoryCall.node, '.trim()');
          },
        });
      },
    });
  },
});
