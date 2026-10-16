import type { ZodMiniMethodName } from '@eslint-zod/tooling/zod-api';
import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoDuplicateSchemaMethodsCreate } from '@eslint-zod/utils/rule-builders/no-duplicate-schema-methods';

import { createZodMiniPluginRule } from '../meta.js';

/**
 * Methods excluded from duplicate-call detection because they are intentionally
 * called more than once in a single schema chain in the `zod/mini` API.
 *
 * - `check` / `with` — each call registers additional `$ZodCheck` validators (primary
 *   composition mechanism in `zod/mini`; deliberately chainable)
 * - `register` — each call registers the schema in a different registry
 *
 * Note: `refine`, `superRefine`, `transform`, `pipe`, `union` and `intersection` are standalone
 * functions in `zod/mini`, not chain methods, so they never appear as
 * duplicates in a method chain.
 */
const EXCLUDED_METHODS = [
  'check',
  'register',
  'with',
] as const satisfies ReadonlyArray<ZodMiniMethodName>;

export const noDuplicateSchemaMethods = createZodMiniPluginRule({
  name: 'no-duplicate-schema-methods',
  meta: {
    hasSuggestions: false,
    type: 'problem',
    docs: {
      description: 'Disallow calling the same schema method more than once in a single chain',
    },
    messages: {
      noDuplicateSchemaMethod:
        'Method `.{{method}}()` is called more than once in this schema chain.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoDuplicateSchemaMethodsCreate(zodMiniImportScope, EXCLUDED_METHODS),
});
