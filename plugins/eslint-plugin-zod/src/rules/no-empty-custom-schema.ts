import { zodImportScope } from '@eslint-zod/utils';
import { buildNoEmptyCustomSchemaCreate } from '@eslint-zod/utils/rule-builders/no-empty-custom-schema';

import { createZodPluginRule } from '../meta.js';

export const noEmptyCustomSchema = createZodPluginRule({
  name: 'no-empty-custom-schema',
  meta: {
    hasSuggestions: false,
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of `z.custom()` without arguments',
    },
    messages: {
      noEmptyCustomSchema: 'You should provide a validate function within `z.custom()`',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoEmptyCustomSchemaCreate(zodImportScope),
});
