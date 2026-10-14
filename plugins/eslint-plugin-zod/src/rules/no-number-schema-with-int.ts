import { zodImportScope } from '@eslint-zod/utils';
import { buildPreferTopLevelFactoryCreate } from '@eslint-zod/utils/rule-patterns/prefer-top-level-factory';

import { createZodPluginRule } from '../meta.js';

export const noNumberSchemaWithInt = createZodPluginRule({
  name: 'no-number-schema-with-int',
  meta: {
    fixable: 'code',
    type: 'problem',
    docs: {
      description: 'Disallow usage of `z.number().int()` as it is considered legacy',
    },
    messages: {
      removeNumber: '`z.number().int()` is considered legacy. Use `z.int()` instead.',
    },
    schema: [],
  },
  defaultOptions: [],

  create: buildPreferTopLevelFactoryCreate({
    scope: zodImportScope,
    factoryName: 'number',
    replacements: [{ sourceMethodName: 'int', replacementMethodName: 'int' }],
    messageId: 'removeNumber',
  }),
});
