import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoUnknownSchemaCreate } from '@eslint-zod/utils/rule-builders/no-unknown-schema';

import { createZodMiniPluginRule } from '../meta.js';

export const noUnknownSchema = createZodMiniPluginRule({
  name: 'no-unknown-schema',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of `z.unknown()` in Zod Mini schemas',
    },
    messages: {
      noZUnknown: 'Using `z.unknown()` is not allowed. Please use a more specific schema.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoUnknownSchemaCreate(zodMiniImportScope),
});
