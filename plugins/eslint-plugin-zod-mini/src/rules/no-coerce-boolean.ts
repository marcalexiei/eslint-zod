import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoCoerceBooleanCreate } from '@eslint-zod/utils/rule-builders/no-coerce-boolean';

import { createZodMiniPluginRule } from '../meta.js';

export const noCoerceBoolean = createZodMiniPluginRule({
  name: 'no-coerce-boolean',
  meta: {
    type: 'problem',
    hasSuggestions: true,
    docs: {
      description:
        'Disallow `z.coerce.boolean()` because it treats any non-empty string as `true`.',
    },
    messages: {
      noCoerceBoolean:
        '`z.coerce.boolean()` uses `Boolean()`, so any non-empty string (including `"false"`) becomes `true`. Use `z.stringbool()` or an explicit string transform such as `z.pipe(z.string(), z.transform((v) => v === "true"))` instead.',
      useStringbool: 'Replace `z.coerce.boolean()` with `z.stringbool()`',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoCoerceBooleanCreate(zodMiniImportScope),
});
