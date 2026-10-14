import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildConsistentImportSourceCreate } from '@eslint-zod/utils/rule-builders/consistent-import-source';

import { createZodMiniPluginRule } from '../meta.js';

export const consistentImportSource = createZodMiniPluginRule({
  name: 'consistent-import-source',
  meta: {
    hasSuggestions: true,
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent source from Zod Mini imports',
    },
    messages: {
      sourceNotAllowed: '"{{source}}" is not allowed. Available values are: {{sources}}',
      replaceSource: 'Replace "{{invalid}}" with "{{valid}}"',
    },
    schema: [
      {
        type: 'object',
        properties: {
          sources: {
            type: 'array',
            description: 'An array of allowed Zod import sources.',
            items: {
              type: 'string',
              enum: [...zodMiniImportScope.sources],
            },
            minItems: 1,
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ sources: ['zod/mini'] }],
  create: buildConsistentImportSourceCreate(zodMiniImportScope),
});
