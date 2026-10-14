import { zodImportScope } from '@eslint-zod/utils';
import { buildDeprecatedSchemaPropertyCreate } from '@eslint-zod/utils/rule-patterns/deprecated-schema-property';

import { createZodPluginRule } from '../meta.js';

export const noNumberSchemaWithIsFinite = createZodPluginRule({
  name: 'no-number-schema-with-is-finite',
  meta: {
    type: 'problem',
    // Note: `fixable` is intentionally omitted. There is no safe automatic fix
    // because `isFinite` is a deprecated property access that always returns true
    // in v4+. Automatically removing it could change code semantics.
    docs: {
      description:
        'Disallow using deprecated `isFinite` on a Zod number schema; in v4+ it is always `true`.',
    },
    messages: {
      deprecated:
        '`isFinite` is deprecated. Number schemas no longer accept infinite values, so this is always `true` for `z.number()`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildDeprecatedSchemaPropertyCreate({
    scope: zodImportScope,
    schemaType: 'number',
    propertyName: 'isFinite',
    messageId: 'deprecated',
  }),
});
