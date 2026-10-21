import type { ZodMethodName } from '@eslint-zod/tooling/zod-api';

/**
 * Zod check names that mutate the validated value instead of just asserting on it.
 * Used in `zod` as chained methods on a schema; used in `zod-mini` as standalone
 * `$ZodCheck` calls passed to `.check(...)`.
 * `slugify` exists in `zod` only.
 */
export const ZOD_MUTATING_CHECK_NAMES: ReadonlyArray<string> = Object.freeze<
  ReadonlyArray<ZodMethodName>
>(['normalize', 'overwrite', 'slugify', 'toLowerCase', 'toUpperCase', 'trim']);
