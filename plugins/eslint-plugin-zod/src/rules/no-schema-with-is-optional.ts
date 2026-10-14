import { zodImportScope } from '@eslint-zod/utils';
import { buildDeprecatedSchemaMethodCreate } from '@eslint-zod/utils/rule-patterns/deprecated-schema-method';

import { createZodPluginRule } from '../meta.js';

export const noSchemaWithIsOptional = createZodPluginRule({
  name: 'no-schema-with-is-optional',
  meta: {
    type: 'problem',
    // Note: `fixable` is intentionally omitted. Replacing `.isOptional()` with
    // `safeParse(undefined).success` may require extracting the schema to avoid
    // duplicating expressions or altering runtime behavior.
    docs: {
      description:
        'Disallow deprecated `.isOptional()` on a Zod schema; use `safeParse(undefined).success` instead.',
    },
    messages: {
      useSafeParse:
        '`.isOptional()` is deprecated. Try `schema.safeParse(undefined).success` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildDeprecatedSchemaMethodCreate({
    scope: zodImportScope,
    methodName: 'isOptional',
    messageId: 'useSafeParse',
  }),
});
