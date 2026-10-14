import { zodImportScope } from '@eslint-zod/utils';
import { buildNoUnknownSchemaCreate } from '@eslint-zod/utils/rule-builders/no-unknown-schema';

import { createZodPluginRule } from '../meta.js';

export const noUnknownSchema = createZodPluginRule({
  name: 'no-unknown-schema',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of `z.unknown()` in Zod schemas',
    },
    messages: {
      noZUnknown: 'Using `z.unknown()` is not allowed. Please use a more specific schema.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoUnknownSchemaCreate(zodImportScope),
});
