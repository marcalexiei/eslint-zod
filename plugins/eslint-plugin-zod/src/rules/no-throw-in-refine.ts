import { zodImportScope } from '@eslint-zod/utils';
import { buildNoThrowInRefineCreate } from '@eslint-zod/utils/rule-builders/no-throw-in-refine';

import { createZodPluginRule } from '../meta.js';

export const noThrowInRefine = createZodPluginRule({
  name: 'no-throw-in-refine',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow throwing errors directly inside Zod refine callbacks',
    },
    messages: {
      noThrowInRefine: 'Do not throw errors directly inside a z.refine callback.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoThrowInRefineCreate(zodImportScope),
});
