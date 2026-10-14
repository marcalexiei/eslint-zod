import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildCollapseEqualBoundsCreate } from '@eslint-zod/utils/rule-patterns/collapse-equal-bounds';

import { createZodMiniPluginRule } from '../meta.js';

export const preferMapSetSizeOverMinMax = createZodMiniPluginRule({
  name: 'prefer-map-set-size-over-min-max',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Prefer `z.size(n)` over `z.minSize(n)` and `z.maxSize(n)` with the same value on a set or map schema',
    },
    messages: {
      preferMapSetSize:
        'Use `z.size(n)` instead of `z.minSize(n)` and `z.maxSize(n)` with the same value.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildCollapseEqualBoundsCreate({
    scope: zodMiniImportScope,
    baseTypes: ['set', 'map'],
    domain: 'size',
    messageId: 'preferMapSetSize',
  }),
});
