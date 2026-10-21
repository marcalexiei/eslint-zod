import { ZOD_MUTATING_CHECK_NAMES, zodImportScope } from '@eslint-zod/utils';
import { buildNoTransformInRecordKeyCreate } from '@eslint-zod/utils/rule-builders/no-transform-in-record-key';
import type { ZodMethodName } from '@eslint-zod/zod-api';

import { createZodPluginRule } from '../meta.js';

const TRANSFORM_METHODS = [...ZOD_MUTATING_CHECK_NAMES, 'transform' satisfies ZodMethodName];

export const noTransformInRecordKey = createZodPluginRule({
  name: 'no-transform-in-record-key',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow transforms in z.record() key schemas, which can cause silent key mutations and data loss through key collisions',
    },
    messages: {
      noTransformInRecordKey:
        'Transforms in z.record() key schemas cause silent key mutation and potential data loss. Use validators like .min() instead of transforms like .trim() or .toLowerCase()',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoTransformInRecordKeyCreate(zodImportScope, TRANSFORM_METHODS),
});
