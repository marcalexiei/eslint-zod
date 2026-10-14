import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoUnnecessaryReadonlyCreate } from '@eslint-zod/utils/rule-builders/no-unnecessary-readonly';

import { createZodMiniPluginRule } from '../meta.js';

export const noUnnecessaryReadonly = createZodMiniPluginRule({
  name: 'no-unnecessary-readonly',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Disallow `z.readonly()` on schemas whose output is already immutable',
    },
    messages: {
      unnecessaryReadonly: '`readonly` has no effect on an already-immutable schema; remove it.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoUnnecessaryReadonlyCreate(zodMiniImportScope),
});
