import { zodImportScope } from '@eslint-zod/utils';
import { buildDeprecatedSchemaPropertyCreate } from '@eslint-zod/utils/rule-patterns/deprecated-schema-property';

import { createZodPluginRule } from '../meta.js';

export const noNumberSchemaWithIsInt = createZodPluginRule({
  name: 'no-number-schema-with-is-int',
  meta: {
    type: 'problem',
    // Note: `fixable` is intentionally omitted. There is no safe automatic fix
    // because converting `schema.isInt` to checking the `format` property requires
    // understanding the runtime context and intended behavior.
    docs: {
      description:
        'Disallow using deprecated `isInt` on a Zod number schema; check the `format` property instead.',
    },
    messages: {
      useFormat:
        '`isInt` is deprecated. Check the `format` property on the number schema instead (or compare to `"int"` or `"float"`).',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildDeprecatedSchemaPropertyCreate({
    scope: zodImportScope,
    schemaType: 'number',
    propertyName: 'isInt',
    messageId: 'useFormat',
  }),
});
