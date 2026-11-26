import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoDuplicateSchemaMethodsCreate } from '@eslint-zod/utils/rule-builders/no-duplicate-schema-methods';
import type { ZodExportName, ZodMiniMethodName } from '@eslint-zod/zod-api';

import { createZodMiniPluginRule } from '../meta.js';

/**
 * Methods excluded from duplicate-call detection because they are intentionally
 * called more than once in a single schema chain in the `zod/mini` API.
 *
 * - `brand` — each call intersects another brand
 * - `register` — each call registers the schema in a different registry
 *
 * `check` / `with` need no entry: the builder compares their arguments, never the calls.
 *
 * Note: `refine`, `superRefine`, `transform`, `pipe`, `union` and `intersection` are standalone
 * functions in `zod/mini`, not chain methods, so they never appear as
 * duplicates in a method chain.
 */
const EXCLUDED_METHODS = ['brand', 'register'] as const satisfies ReadonlyArray<ZodMiniMethodName>;

/** `.check(...)` arguments whose second application is redundant. */
const COMPARED_CHECK_ARGUMENTS: ReadonlyArray<ZodExportName> = [
  'describe',
  'normalize',
  'toLowerCase',
  'toUpperCase',
  'trim',
];

export const noDuplicateSchemaMethods = createZodMiniPluginRule({
  name: 'no-duplicate-schema-methods',
  meta: {
    hasSuggestions: false,
    type: 'problem',
    docs: {
      description: 'Disallow calling the same schema method more than once in a single chain',
    },
    messages: {
      noDuplicateSchemaMethod: '`{{method}}()` is applied more than once in this schema chain.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoDuplicateSchemaMethodsCreate(
    zodMiniImportScope,
    EXCLUDED_METHODS,
    COMPARED_CHECK_ARGUMENTS,
  ),
});
