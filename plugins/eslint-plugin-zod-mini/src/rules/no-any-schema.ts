import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoAnySchemaCreate } from '@eslint-zod/utils/rule-builders/no-any-schema';

import { createZodMiniPluginRule } from '../meta.js';

export const noAnySchema = createZodMiniPluginRule({
  name: 'no-any-schema',
  meta: {
    hasSuggestions: true,
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of `z.any()` in Zod Mini schemas',
    },
    messages: {
      noZAny: 'Using `z.any()` is not allowed. Please use a more specific schema.',
      useUnknown: 'Replace `z.any()` with `z.unknown()`',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoAnySchemaCreate(zodMiniImportScope),
});
