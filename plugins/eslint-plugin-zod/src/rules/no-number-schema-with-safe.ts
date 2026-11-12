import { zodImportScope } from '@eslint-zod/utils';
import { buildPreferTopLevelFactoryCreate } from '@eslint-zod/utils/rule-patterns/prefer-top-level-factory';

import { createZodPluginRule } from '../meta.js';
import {
  INTEGER_NUMBER_FACTORIES,
  NON_INTEGER_NUMBER_FACTORIES,
} from '../utils/number-factories.js';

export const noNumberSchemaWithSafe = createZodPluginRule({
  name: 'no-number-schema-with-safe',
  meta: {
    fixable: 'code',
    type: 'problem',
    docs: {
      description:
        'Disallow deprecated `z.number().safe()`. Use `z.int()`; `.safe()` is now identical to `.int()`.',
    },
    messages: {
      useInt:
        '`.safe()` is deprecated; it is identical to `.int()`. Use `z.int()` (or the equivalent) instead of chaining `.safe()` on `z.{{factory}}()`.',
      removeSafe:
        '`.safe()` is deprecated, and `z.{{factory}}()` accepts only safe integers already. Remove this call.',
    },
    schema: [],
  },
  defaultOptions: [],

  create: buildPreferTopLevelFactoryCreate({
    scope: zodImportScope,
    factoryName: NON_INTEGER_NUMBER_FACTORIES,
    replacements: [{ sourceMethodName: 'safe', replacementMethodName: 'int' }],
    messageId: 'useInt',
    redundant: { factoryNames: INTEGER_NUMBER_FACTORIES, messageId: 'removeSafe' },
  }),
});
