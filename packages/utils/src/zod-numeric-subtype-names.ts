/**
 * Numeric sub-type factory names, shared by every table that reasons about them.
 * Module-local on purpose: an external rule author wants `getZodSchemaBaseType`,
 * not the raw list.
 */
export const ZOD_NUMBER_SUBTYPE_NAMES = Object.freeze([
  'int',
  'int32',
  'uint32',
  'float32',
  'float64',
] as const);

export const ZOD_BIGINT_SUBTYPE_NAMES = Object.freeze(['int64', 'uint64'] as const);
