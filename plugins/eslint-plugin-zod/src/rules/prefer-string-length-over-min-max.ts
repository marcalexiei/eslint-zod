import { zodImportScope } from '@eslint-zod/utils';
import { buildCollapseEqualBoundsCreate } from '@eslint-zod/utils/rule-patterns/collapse-equal-bounds';

import { createZodPluginRule } from '../meta.js';

export const preferStringLengthOverMinMax = createZodPluginRule({
  name: 'prefer-string-length-over-min-max',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Prefer `.length(n)` over `.min(n).max(n)` with the same value on a string schema',
    },
    messages: {
      preferStringLength:
        'Use `.length(n)` instead of `.min(n)` and `.max(n)` with the same value.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildCollapseEqualBoundsCreate({
    scope: zodImportScope,
    baseTypes: ['string'],
    domain: 'length',
    messageId: 'preferStringLength',
  }),
});
