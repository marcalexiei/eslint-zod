import { ZOD_BIGINT_SUBTYPE_NAMES, ZOD_NUMBER_SUBTYPE_NAMES } from './zod-numeric-subtype-names.js';
import { ZOD_STRING_FORMAT_NAMES } from './zod-string-format-names.js';

/**
 * Zod schema factories whose parsed output is already immutable, so wrapping
 * them in `readonly` has no effect on the inferred type (and no runtime
 * effect: freezing a primitive is a no-op).
 *
 * Covers primitives/scalars, number sub-types, and the top-level string
 * formats (they all parse to `string`). Container factories (`object`,
 * `array`, `record`, `map`, `set`, `tuple`, …) are intentionally absent —
 * `readonly` is meaningful there.
 */
export const ZOD_IMMUTABLE_SCHEMA_TYPES = Object.freeze([
  // primitives / scalars
  'bigint',
  'boolean',
  'date',
  'enum',
  'literal',
  'nan',
  'nativeEnum',
  'null',
  'number',
  'string',
  'stringbool',
  'symbol',
  'templateLiteral',
  'undefined',
  'void',

  // number and bigint sub-types — spread for the same reason as the string formats below
  ...ZOD_NUMBER_SUBTYPE_NAMES,
  ...ZOD_BIGINT_SUBTYPE_NAMES,

  // top-level string formats (all parse to `string`) — spread rather than
  // hand-copied, so a new format cannot be added to one table and forgotten
  // in the other
  ...ZOD_STRING_FORMAT_NAMES,

  // `iso` covers member factories such as `z.iso.date()`
  'iso',
]);
