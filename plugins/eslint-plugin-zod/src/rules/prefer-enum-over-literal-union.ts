import { zodImportScope } from '@eslint-zod/utils';
import { buildPreferEnumOverLiteralUnionCreate } from '@eslint-zod/utils/rule-builders/prefer-enum-over-literal-union';

import { createZodPluginRule } from '../meta.js';

export const preferEnumOverLiteralUnion = createZodPluginRule({
  name: 'prefer-enum-over-literal-union',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Prefer `z.enum()` over `z.union()` when all members are string literals.',
    },
    messages: {
      useEnum: 'Replace this union of string literals with `z.enum()`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildPreferEnumOverLiteralUnionCreate(zodImportScope),
});
