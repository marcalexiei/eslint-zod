import type { ZodExportName } from '@eslint-zod/tooling/zod-api';
import { ZOD_MUTATING_CHECK_NAMES, zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoTransformInRecordKeyCreate } from '@eslint-zod/utils/rule-builders/no-transform-in-record-key';

import { createZodMiniPluginRule } from '../meta.js';

const TRANSFORM_NAMES = [...ZOD_MUTATING_CHECK_NAMES, 'transform' satisfies ZodExportName];

export const noTransformInRecordKey = createZodMiniPluginRule({
  name: 'no-transform-in-record-key',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow transforms in z.record() key schemas, which can cause silent key mutations and data loss through key collisions',
    },
    messages: {
      noTransformInRecordKey:
        'Transforms in z.record() key schemas cause silent key mutation and potential data loss. Use validators like z.minLength() instead of mutating checks like z.trim() or z.toLowerCase().',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoTransformInRecordKeyCreate(zodMiniImportScope, TRANSFORM_NAMES),
});
