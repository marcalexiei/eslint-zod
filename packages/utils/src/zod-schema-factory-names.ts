import { ZOD_BASE_TYPE_NAMES } from './get-zod-schema-base-type.js';

/**
 * Every top-level Zod export whose call evaluates to a schema, across API styles.
 * `iso` and `coerce` are absent: only their members are called.
 * Builds on {@link ZOD_BASE_TYPE_NAMES} rather than restating it.
 */
export const ZOD_SCHEMA_FACTORY_NAMES = Object.freeze([
  // every factory with a base type; `iso` is a namespace, never called itself
  ...ZOD_BASE_TYPE_NAMES.filter((name) => name !== 'iso'),

  // scalars with no base-type mapping
  'nan',
  'null',
  'symbol',
  'undefined',
  'void',

  // string formats with no chained spelling
  'currencyCode',
  'stringFormat',

  // containers
  'file',
  'looseRecord',
  'partialRecord',
  'record',
  'tuple',

  // unions, literals & enums
  'discriminatedUnion',
  'enum',
  'intersection',
  'keyof',
  'nativeEnum',
  'templateLiteral',
  'union',
  'xor',

  // wrappers
  'catch',
  'default',
  'exactOptional',
  'lazy',
  'nonoptional',
  'nullable',
  'nullish',
  'optional',
  'prefault',
  'promise',
  'readonly',
  'success',

  // pipes & transforms
  'codec',
  'invertCodec',
  'pipe',
  'preprocess',
  'transform',

  // object transformers — chained methods in `zod`, standalone in `zod/mini`
  'catchall',
  'exactPartial',
  'extend',
  'merge',
  'omit',
  'partial',
  'pick',
  'required',
  'safeExtend',

  // escape hatches
  'custom',
  'fromJSONSchema',
  'function',
  'instanceof',
  'json',
]);

const FACTORY_NAMES = new Set<string>(ZOD_SCHEMA_FACTORY_NAMES);

/** True when `name` is a top-level Zod factory whose call evaluates to a schema. */
export function isZodSchemaFactoryName(name: string): boolean {
  return FACTORY_NAMES.has(name);
}
