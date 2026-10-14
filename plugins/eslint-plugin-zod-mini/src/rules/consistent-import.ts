import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildConsistentImportCreate } from '@eslint-zod/utils/rule-builders/consistent-import';
import type { ImportSyntax } from '@eslint-zod/utils/rule-builders/consistent-import';

import { createZodMiniPluginRule } from '../meta.js';

const SYNTAXES = ['namespace', 'named'] as const satisfies ReadonlyArray<ImportSyntax>;

export const consistentImport = createZodMiniPluginRule({
  name: 'consistent-import',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce a consistent import style for Zod Mini',
    },
    fixable: 'code',
    messages: {
      changeImportSyntax: 'Use a {{syntax}} import for Zod Mini.',
      removeDuplicate: 'Remove duplicate Zod Mini import; Zod Mini is already imported.',
      convertUsage: 'Update Zod Mini usage to match the {{syntax}} import syntax.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          syntax: {
            description: 'Specifies the import syntax to use for Zod Mini.',
            type: 'string',
            enum: [...SYNTAXES],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ syntax: 'namespace' }],
  create: buildConsistentImportCreate(zodMiniImportScope),
});
