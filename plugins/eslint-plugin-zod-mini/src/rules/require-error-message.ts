import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildRequireErrorMessageCreate } from '@eslint-zod/utils/rule-builders/require-error-message';

import { createZodMiniPluginRule } from '../meta.js';

export const requireErrorMessage = createZodMiniPluginRule({
  name: 'require-error-message',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Enforce that custom refinements include an error message',
    },
    messages: {
      requireErrorMessage: 'Custom refinements must include an error message',
      preferError: 'Use the "error" property instead of the deprecated "message" property',
      removeMessage: 'The "message" property is deprecated; use "error"',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildRequireErrorMessageCreate(zodMiniImportScope),
});
