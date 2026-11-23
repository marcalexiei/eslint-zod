import { zodImportScope } from '@eslint-zod/utils';
import { buildNoDuplicateSchemaMethodsCreate } from '@eslint-zod/utils/rule-builders/no-duplicate-schema-methods';
import type { ZodMethodName } from '@eslint-zod/zod-api';

import { createZodPluginRule } from '../meta.js';

/**
 * Methods excluded from duplicate-call detection because they are intentionally
 * called more than once in a single schema chain in the `zod` (full) API.
 *
 * - `brand` — each call intersects another brand
 * - `endsWith` / `includes` / `startsWith` / `regex` — each call adds an
 *   independent string constraint; calling one twice with different values
 *   is common (e.g. matching against multiple patterns)
 * - `extend` / `safeExtend` / `merge` / `omit` / `pick` — each call reshapes the object again
 * - `meta` — each call merges more metadata
 * - `multipleOf` / `step` — two divisors constrain independently
 * - `overwrite` — each call applies an independent transformation
 * - `refine` / `superRefine` — each call adds an independent refinement
 * - `register` — each call registers the schema in a different registry
 *
 * Type-changing methods need no entry:
 * each starts a new chain segment, which the builder handles before reading this list.
 * Neither do `check` / `with`: the builder compares their arguments, never the calls.
 * `partial`, `exactPartial`, `required`, `exclude` and `extract` repeat only with the same argument.
 */
const EXCLUDED_METHODS = [
  'brand',
  'endsWith',
  'extend',
  'includes',
  'merge',
  'meta',
  'multipleOf',
  'omit',
  'overwrite',
  'pick',
  'refine',
  'regex',
  'register',
  'safeExtend',
  'startsWith',
  'step',
  'superRefine',
] as const satisfies ReadonlyArray<ZodMethodName>;

export const noDuplicateSchemaMethods = createZodPluginRule({
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
  create: buildNoDuplicateSchemaMethodsCreate(zodImportScope, EXCLUDED_METHODS),
});
