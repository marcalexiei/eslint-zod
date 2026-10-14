import { zodImportScope } from '@eslint-zod/utils';
import { buildNoPromiseSchemaCreate } from '@eslint-zod/utils/rule-builders/no-promise-schema';

import { createZodPluginRule } from '../meta.js';

export const noPromiseSchema = createZodPluginRule({
  name: 'no-promise-schema',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow deprecated `z.promise()` schemas.',
    },
    messages: {
      noPromiseSchema:
        '`z.promise()` is deprecated in Zod 4. Await the value before parsing it instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoPromiseSchemaCreate(zodImportScope),
});
