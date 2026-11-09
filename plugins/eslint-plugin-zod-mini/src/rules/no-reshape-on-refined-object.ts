import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoReshapeOnRefinedObjectCreate } from '@eslint-zod/utils/rule-builders/no-reshape-on-refined-object';

import { createZodMiniPluginRule } from '../meta.js';

export const noReshapeOnRefinedObject = createZodMiniPluginRule({
  name: 'no-reshape-on-refined-object',
  meta: {
    hasSuggestions: true,
    type: 'problem',
    docs: {
      description: 'Disallow reshaping an object schema after a check, which throws at runtime',
    },
    messages: {
      reshapeRefined:
        '`z.{{method}}()` throws on an object schema that has checks. Reshape the object before adding checks.',
      reshapeRefinedInCall:
        'This call throws: inside it, `z.{{method}}()` reshapes an object schema that has checks.',
      overwriteRefined:
        '`z.extend()` throws when it overwrites a key (`{{key}}`) of an object schema that has checks.',
      useSafeExtend: 'Use `z.safeExtend()` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoReshapeOnRefinedObjectCreate(zodMiniImportScope),
});
