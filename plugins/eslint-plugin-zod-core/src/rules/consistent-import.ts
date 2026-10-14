import { zodCoreImportScope } from '@eslint-zod/utils';
import { buildConsistentImportCreate } from '@eslint-zod/utils/rule-builders/consistent-import';

import { createZodPluginRule } from '../meta.js';

export const consistentImport = createZodPluginRule({
  name: 'consistent-import',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce a consistent import style for Zod core',
    },
    fixable: 'code',
    messages: {
      changeImportSyntax: 'Use a {{syntax}} import for Zod core.',
      removeDuplicate: 'Remove duplicate Zod core import; Zod core is already imported.',
      convertUsage: 'Update Zod core usage to match the {{syntax}} import syntax.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          syntax: {
            description: 'Specifies the import syntax to use for Zod core.',
            type: 'string',
            // `named` means `import { z }`, and `zod/v4/core` has no `z` export.
            enum: ['namespace'],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ syntax: 'namespace' }],
  create: buildConsistentImportCreate<'namespace'>(zodCoreImportScope),
});
