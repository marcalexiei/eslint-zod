import { zodImportScope } from '@eslint-zod/utils';
import { buildNoNativeEnumCreate } from '@eslint-zod/utils/rule-builders/no-native-enum';

import { createZodPluginRule } from '../meta.js';

export const noNativeEnum = createZodPluginRule({
  name: 'no-native-enum',
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Disallow deprecated `z.nativeEnum()` in favor of `z.enum()`.',
    },
    messages: {
      useEnum: '`z.nativeEnum()` is deprecated in Zod 4. Use `z.enum()` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoNativeEnumCreate(zodImportScope),
});
