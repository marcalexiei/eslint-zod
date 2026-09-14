import { zodImportScope } from '@eslint-zod/utils';
import { buildPreferValidateCreate } from '@eslint-zod/utils/rule-builders/prefer-validate';

import { createZodPluginRule } from '../utils/create-plugin-rule.js';

export const preferValidate = createZodPluginRule({
  name: 'prefer-validate',
  meta: {
    type: 'suggestion',
    hasSuggestions: true,
    docs: { description: 'Prefer boolean validation when only the success of parsing is used' },
    messages: {
      preferValidate: 'Prefer `{{method}}` when only parse success is used.',
      useValidate: 'Replace success-only parsing with `{{method}}`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildPreferValidateCreate(zodImportScope, 'classic'),
});
