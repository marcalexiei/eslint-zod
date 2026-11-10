import { zodImportScope } from '@eslint-zod/utils';
import { buildNoReshapeOnRefinedObjectCreate } from '@eslint-zod/utils/rule-builders/no-reshape-on-refined-object';

import { createZodPluginRule } from '../meta.js';

export const noReshapeOnRefinedObject = createZodPluginRule({
  name: 'no-reshape-on-refined-object',
  meta: {
    hasSuggestions: true,
    type: 'problem',
    docs: {
      description:
        'Disallow reshaping an object schema after a refinement, which throws at runtime',
    },
    messages: {
      reshapeRefined:
        '`{{method}}()` throws on an object schema that has refinements. Reshape the object before refining it.',
      reshapeRefinedInCall:
        'This call throws: inside it, `{{method}}()` reshapes an object schema that has refinements.',
      overwriteRefined:
        '`{{method}}()` throws when it overwrites a key (`{{key}}`) of an object schema that has refinements.',
      useSafeExtend: 'Use `.safeExtend()` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoReshapeOnRefinedObjectCreate(zodImportScope),
});
