import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildCollapseEqualBoundsCreate } from '@eslint-zod/utils/rule-patterns/collapse-equal-bounds';

import { createZodMiniPluginRule } from '../meta.js';

export const preferStringLengthOverMinMax = createZodMiniPluginRule({
  name: 'prefer-string-length-over-min-max',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Prefer `z.length(n)` over `z.minLength(n)` and `z.maxLength(n)` with the same value on a string schema',
    },
    messages: {
      preferStringLength:
        'Use `z.length(n)` instead of `z.minLength(n)` and `z.maxLength(n)` with the same value.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildCollapseEqualBoundsCreate({
    scope: zodMiniImportScope,
    baseTypes: ['string'],
    domain: 'length',
    messageId: 'preferStringLength',
  }),
});
