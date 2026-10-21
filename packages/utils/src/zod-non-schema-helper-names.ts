import type { ZodExportName } from '@eslint-zod/tooling/zod-api';

import type { ZodSchemaMeta } from './detect-zod-schema-root-node.js';
import { ZOD_NON_SCHEMA_PRODUCING_METHODS } from './zod-non-schema-producing-methods.js';
import { isZodSchemaFactoryName } from './zod-schema-factory-names.js';

/** The helpers that exist only at the top level: registries, locales and the global config. */
const CONFIG_AND_REGISTRY_NAMES: ReadonlyArray<ZodExportName> = [
  'config',
  'globalRegistry',
  'locales',
  'registry',
];

/**
 * Top-level `z` exports whose call yields something other than a schema:
 * a JSON Schema document, a registry, a locale, the global config,
 * a parse result, a formatted error.
 * Spreads {@link ZOD_NON_SCHEMA_PRODUCING_METHODS} — `zod/mini` exposes its parse and
 * error-formatting names at the top level too (`z.parse(schema, input)`) — minus the
 * names that are also factories, since `z.codec(a, b)` does build a schema.
 */
export const ZOD_NON_SCHEMA_HELPER_NAMES: ReadonlyArray<string> = Object.freeze([
  ...CONFIG_AND_REGISTRY_NAMES,
  // `toJSONSchema` and the parse helpers come with the method list
  ...ZOD_NON_SCHEMA_PRODUCING_METHODS.filter((name) => !isZodSchemaFactoryName(name)),
]);

const HELPER_NAMES = new Set<string>(ZOD_NON_SCHEMA_HELPER_NAMES);

/**
 * True when a detected chain starts at a helper that does not build a schema.
 * Weaker than the complement of `isZodSchemaFactoryCall`: a standalone check
 * (`z.minLength(1)`) is not a factory, but it is still part of a schema expression.
 * Use this when a rule must skip the helpers and keep seeing everything else.
 */
export function isZodNonSchemaHelperCall(meta: ZodSchemaMeta): boolean {
  return HELPER_NAMES.has(meta.schemaType);
}
