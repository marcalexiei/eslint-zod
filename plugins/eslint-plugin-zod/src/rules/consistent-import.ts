import { zodImportScope } from '@eslint-zod/utils';
import { buildConsistentImportCreate } from '@eslint-zod/utils/rule-builders/consistent-import';
import type { ImportSyntax } from '@eslint-zod/utils/rule-builders/consistent-import';

import { createZodPluginRule } from '../meta.js';

const SYNTAXES = ['namespace', 'named', 'default'] as const satisfies ReadonlyArray<ImportSyntax>;

export const consistentImport = createZodPluginRule({
  name: 'consistent-import',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce a consistent import style for Zod',
    },
    fixable: 'code',
    messages: {
      changeImportSyntax: 'Use a {{syntax}} import for Zod.',
      removeDuplicate: 'Remove duplicate Zod import; Zod is already imported.',
      convertUsage: 'Update Zod usage to match the {{syntax}} import syntax.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          syntax: {
            description: 'Specifies the import syntax to use for Zod.',
            type: 'string',
            enum: [...SYNTAXES],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ syntax: 'namespace' }],
  create: buildConsistentImportCreate(zodImportScope),
});
