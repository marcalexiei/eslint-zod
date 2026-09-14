import {
  buildZodChainRemoveMethodFix,
  getZodChainedMethodNames,
  zodImportScope,
} from '@eslint-zod/utils';

import { createZodPluginRule } from '../utils/create-plugin-rule.js';

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
    const { createSchemaVisitor, collectZodChainMethods } = zodImportScope.createTracker({
      kind: 'value',
    });

    return createSchemaVisitor({
      schemaType: 'number',
      onSchema(node, zodSchemaMeta): void {
        // Detect on the names alone: they exclude the factory,
        // so an aliased named import (`import { number as finite }`) is not mistaken for a `.finite()` call,
        // and a computed factory (`z['number']().finite()`) is still caught even though the chain walker cannot name it.
        if (!getZodChainedMethodNames(zodSchemaMeta).includes('finite')) {
          return;
        }

        const methods = collectZodChainMethods(node);
        // Skip index 0 — that item is the `number()` factory itself.
        const finiteIndex = methods.findIndex((m, index) => index > 0 && m.name === 'finite');

        context.report({
          node,
          messageId: 'removeFinite',
          fix(fixer) {
            // A computed factory leaves `finiteIndex` at -1 — unfixable.
            if (finiteIndex === -1) {
              return null;
            }

            return buildZodChainRemoveMethodFix({
              fixer,
              methods,
              removeIndex: finiteIndex,
            });
          },
        });
      },
    });
  },
});
