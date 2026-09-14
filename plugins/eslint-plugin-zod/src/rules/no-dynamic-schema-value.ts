import { zodImportScope } from '@eslint-zod/utils';
import { buildNoDynamicSchemaValueCreate } from '@eslint-zod/utils/rule-builders/no-dynamic-schema-value';

import { createZodPluginRule } from '../utils/create-plugin-rule.js';

export const noDynamicSchemaValue = createZodPluginRule({
  name: 'no-dynamic-schema-value',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow non-static values passed as arguments in a Zod schema expression',
    },
    messages: {
      dynamicValue:
        'This value must be a literal or an imported binding to be hoistable by tools like `zod-compiler`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoDynamicSchemaValueCreate(zodImportScope),
});
