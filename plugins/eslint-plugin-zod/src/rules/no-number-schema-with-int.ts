import { zodImportScope } from '@eslint-zod/utils';
import { buildPreferTopLevelFactoryCreate } from '@eslint-zod/utils/rule-patterns/prefer-top-level-factory';

import { createZodPluginRule } from '../meta.js';
import {
  INTEGER_NUMBER_FACTORIES,
  NON_INTEGER_NUMBER_FACTORIES,
} from '../utils/number-factories.js';

export const noNumberSchemaWithInt = createZodPluginRule({
  name: 'no-number-schema-with-int',
  meta: {
    fixable: 'code',
    type: 'problem',
    docs: {
      description: 'Disallow usage of `z.number().int()` as it is considered legacy',
    },
    messages: {
      removeNumber: '`z.{{factory}}().int()` is considered legacy. Use `z.int()` instead.',
      redundantInt: '`z.{{factory}}()` accepts only integers already. Remove this `.int()` call.',
    },
    schema: [],
  },
  defaultOptions: [],

  create: buildPreferTopLevelFactoryCreate({
    scope: zodImportScope,
    factoryName: NON_INTEGER_NUMBER_FACTORIES,
    replacements: [{ sourceMethodName: 'int', replacementMethodName: 'int' }],
    messageId: 'removeNumber',
    redundant: { factoryNames: INTEGER_NUMBER_FACTORIES, messageId: 'redundantInt' },
  }),
});
