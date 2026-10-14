import { zodImportScope } from '@eslint-zod/utils';
import { buildPreferDedicatedFactoryCreate } from '@eslint-zod/utils/rule-patterns/prefer-dedicated-factory';

import { createZodPluginRule } from '../meta.js';
import { OBJECT_CATCHALL_METHODS } from '../utils/object-catchall-methods.js';

export const preferStrictObject = createZodPluginRule({
  name: 'prefer-strict-object',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Prefer `z.strictObject()` over `z.object().strict()`',
    },
    messages: {
      preferStrictObject: 'Use `z.strictObject()` instead of `.strict()`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildPreferDedicatedFactoryCreate({
    scope: zodImportScope,
    factoryName: 'object',
    modifierMethods: ['strict'],
    replacementFactoryName: 'strictObject',
    overridingMethods: OBJECT_CATCHALL_METHODS,
    messageId: 'preferStrictObject',
  }),
});
