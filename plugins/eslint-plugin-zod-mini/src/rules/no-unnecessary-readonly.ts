import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoUnnecessaryReadonlyCreate } from '@eslint-zod/utils/rule-builders/no-unnecessary-readonly';

import { createZodMiniPluginRule } from '../meta.js';

export const noUnnecessaryReadonly = createZodMiniPluginRule({
  name: 'no-unnecessary-readonly',
  meta: {
    type: 'suggestion',
    hasSuggestions: true,
    docs: {
      description: 'Disallow `z.readonly()` on schemas whose output is already immutable',
    },
    messages: {
      unnecessaryReadonly: '`readonly` does not change the output of an already-immutable schema.',
      removeReadonly: 'Remove `readonly` (generated JSON Schema may lose `readOnly`).',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoUnnecessaryReadonlyCreate(zodMiniImportScope),
});
