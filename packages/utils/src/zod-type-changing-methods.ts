import type { ZodMethodName } from '@eslint-zod/zod-api';

const TYPE_CHANGING_METHODS = [
  'and',
  'array',
  'or',
  'pipe',
  'transform',
] as const satisfies ReadonlyArray<ZodMethodName>;

/** One of {@link ZOD_TYPE_CHANGING_METHODS}. */
export type ZodTypeChangingMethod = (typeof TYPE_CHANGING_METHODS)[number];

/**
 * Chained methods that produce a schema of a different type than the one they are called on.
 * Constraints written after one of them apply to that new schema,
 * so a rule reasoning about a chain must not carry earlier checks past them
 * (`z.string().min(1).array().min(1)` bounds a string, then an array).
 */
export const ZOD_TYPE_CHANGING_METHODS: ReadonlyArray<string> =
  Object.freeze(TYPE_CHANGING_METHODS);
