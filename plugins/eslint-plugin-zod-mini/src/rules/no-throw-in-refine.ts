import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoThrowInRefineCreate } from '@eslint-zod/utils/rule-builders/no-throw-in-refine';

import { createZodMiniPluginRule } from '../meta.js';

export const noThrowInRefine = createZodMiniPluginRule({
  name: 'no-throw-in-refine',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow throwing errors directly inside Zod Mini refine callbacks',
    },
    messages: {
      noThrowInRefine: 'Do not throw errors directly inside a z.refine callback.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoThrowInRefineCreate(zodMiniImportScope),
});
