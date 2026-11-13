import type { ZodSchemaMeta } from './detect-zod-schema-root-node.js';
import { getZodChainedMethodNames } from './get-zod-chained-method-names.js';

/**
 * The factory a detected chain builds its schema with: `schemaType`, except that `coerce.<name>()` gives `<name>`,
 * since it builds the same schema (`z.coerce.number()` is a `ZodNumber`).
 * `iso` is left alone: `z.iso.date()` is a string format, not `z.date()`.
 * `null` for a bare `z.coerce` member chain with nothing called on it.
 */
export function getZodSchemaFactoryName(meta: ZodSchemaMeta): string | null {
  if (meta.schemaType !== 'coerce') {
    return meta.schemaType;
  }
  return getZodChainedMethodNames(meta).at(0) ?? null;
}
