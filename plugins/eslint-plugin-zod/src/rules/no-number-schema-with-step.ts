import { zodImportScope } from '@eslint-zod/utils';

import { createZodPluginRule } from '../meta.js';

export const noNumberSchemaWithStep = createZodPluginRule({
  name: 'no-number-schema-with-step',
  meta: {
    fixable: 'code',
    type: 'problem',
    docs: {
      description: 'Disallow deprecated `z.number().step()`. Use `.multipleOf()` instead.',
    },
    messages: {
      useMultipleOf: '`.step()` is deprecated. Use `.multipleOf()` with the same argument instead.',
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
        const step = findZodChainedMethod(node, zodSchemaMeta, 'step');
        if (step === null) {
          return;
        }

        context.report({
          node,
          messageId: 'useMultipleOf',
          fix(fixer) {
            // A computed factory (`z['number']().step(5)`) is reported without a fix.
            return step.member ? fixer.replaceText(step.member.property, 'multipleOf') : null;
          },
        });
      },
    });
  },
});
