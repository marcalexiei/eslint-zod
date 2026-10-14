import { zodImportScope } from '@eslint-zod/utils';
import { buildPreferTupleOverArrayLengthCreate } from '@eslint-zod/utils/rule-builders/prefer-tuple-over-array-length';

import { createZodPluginRule } from '../meta.js';

export const preferTupleOverArrayLength = createZodPluginRule({
  name: 'prefer-tuple-over-array-length',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Prefer `z.tuple()` over a length-constrained `z.array()` so the length is preserved in the inferred type.',
    },
    messages: {
      preferTuple:
        'Prefer `z.tuple()` over a length-constrained `z.array()` so the length is preserved in the inferred type.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildPreferTupleOverArrayLengthCreate(zodImportScope),
});
