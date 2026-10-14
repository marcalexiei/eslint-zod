import { zodImportScope } from '@eslint-zod/utils';
import { buildNoUnnecessaryReadonlyCreate } from '@eslint-zod/utils/rule-builders/no-unnecessary-readonly';

import { createZodPluginRule } from '../meta.js';

export const noUnnecessaryReadonly = createZodPluginRule({
  name: 'no-unnecessary-readonly',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Disallow `.readonly()` on schemas whose output is already immutable',
    },
    messages: {
      unnecessaryReadonly: '`readonly` has no effect on an already-immutable schema; remove it.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoUnnecessaryReadonlyCreate(zodImportScope),
});
