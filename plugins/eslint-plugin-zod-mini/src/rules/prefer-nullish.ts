import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildPreferNullishCreate } from '@eslint-zod/utils/rule-builders/prefer-nullish';

import { createZodMiniPluginRule } from '../meta.js';

export const preferNullish = createZodMiniPluginRule({
  name: 'prefer-nullish',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Enforce `z.nullish()` instead of combining `z.optional()` and `z.nullable()`',
    },
    messages: {
      preferNullish:
        'Combining `z.optional()` and `z.nullable()` is redundant. Use `z.nullish()` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildPreferNullishCreate(zodMiniImportScope),
});
