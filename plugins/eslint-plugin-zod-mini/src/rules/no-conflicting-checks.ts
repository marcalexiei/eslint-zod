import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoConflictingChecksCreate } from '@eslint-zod/utils/rule-builders/no-conflicting-checks';

import { createZodMiniPluginRule } from '../meta.js';

export const noConflictingChecks = createZodMiniPluginRule({
  name: 'no-conflicting-checks',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow check combinations that can never match, are redundant, or do not apply to the schema type',
    },
    messages: {
      impossibleCase: 'This schema can never match: `{{first}}` conflicts with `{{second}}`.',
      redundantCheck: '`{{redundant}}` is redundant: `{{by}}` already implies it.',
      confusingCombination: 'Combining `{{first}}` and `{{second}}` is almost certainly a mistake.',
      pointlessCheck: '`{{check}}` is pointless here: {{reason}}.',
      inapplicableCheck:
        '`{{check}}` does not apply to a `{{baseType}}` schema: it will silently no-op or reject every value.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          checkImpossibleCases: {
            description: 'Report provably unsatisfiable combinations — the schema can never match',
            type: 'boolean',
          },
          checkConfusingCases: {
            description: 'Report technically valid but almost certainly mistaken combinations',
            type: 'boolean',
          },
          checkInapplicableChecks: {
            description: "Report checks that don't apply to the schema's base type",
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    { checkImpossibleCases: true, checkConfusingCases: true, checkInapplicableChecks: true },
  ],
  create: buildNoConflictingChecksCreate(zodMiniImportScope),
});
