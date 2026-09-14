import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoFunctionScopedSchemaCreate } from '@eslint-zod/utils/rule-builders/no-function-scoped-schema';

import { createZodMiniPluginRule } from '../utils/create-plugin-rule.js';

export const noFunctionScopedSchema = createZodMiniPluginRule({
  name: 'no-function-scoped-schema',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow constructing a Zod Mini schema inside a function body',
    },
    messages: {
      functionScopedSchema:
        'This schema is constructed inside a function and rebuilt on every call. Declare it once at module scope instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoFunctionScopedSchemaCreate(zodMiniImportScope),
});
