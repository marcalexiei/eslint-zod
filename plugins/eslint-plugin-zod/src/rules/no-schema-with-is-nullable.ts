import { zodImportScope } from '@eslint-zod/utils';
import { buildDeprecatedSchemaMethodCreate } from '@eslint-zod/utils/rule-patterns/deprecated-schema-method';

import { createZodPluginRule } from '../meta.js';

export const noSchemaWithIsNullable = createZodPluginRule({
  name: 'no-schema-with-is-nullable',
  meta: {
    type: 'problem',
    // Note: `fixable` is intentionally omitted. Replacing `.isNullable()` with
    // `safeParse(null).success` may require extracting the schema to avoid
    // duplicating expressions or altering runtime behavior.
    docs: {
      description:
        'Disallow deprecated `.isNullable()` on a Zod schema; use `safeParse(null).success` instead.',
    },
    messages: {
      useSafeParse: '`.isNullable()` is deprecated. Try `schema.safeParse(null).success` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildDeprecatedSchemaMethodCreate({
    scope: zodImportScope,
    methodName: 'isNullable',
    messageId: 'useSafeParse',
  }),
});
