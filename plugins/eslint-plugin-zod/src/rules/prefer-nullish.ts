import { zodImportScope } from '@eslint-zod/utils';
import { buildPreferNullishCreate } from '@eslint-zod/utils/rule-builders/prefer-nullish';

import { createZodPluginRule } from '../meta.js';

export const preferNullish = createZodPluginRule({
  name: 'prefer-nullish',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Enforce `.nullish()` instead of combining `.optional()` and `.nullable()`',
    },
    messages: {
      preferNullish:
        'Combining `.optional()` and `.nullable()` is redundant. Use `.nullish()` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildPreferNullishCreate(zodImportScope),
});
