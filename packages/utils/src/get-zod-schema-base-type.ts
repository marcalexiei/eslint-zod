import type { ZodExportName } from '@eslint-zod/tooling/zod-api';

import { ZOD_BIGINT_SUBTYPE_NAMES, ZOD_NUMBER_SUBTYPE_NAMES } from './zod-numeric-subtype-names.js';
import { ZOD_STRING_FORMAT_NAMES } from './zod-string-format-names.js';

/**
 * Category of values a schema factory parses to.
 * Used by rules that reason about which checks apply to a schema (e.g. `no-conflicting-checks`).
 */
export type ZodSchemaBaseType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'date'
  | 'array'
  | 'object'
  | 'set'
  | 'map'
  | 'literal'
  | 'any'
  | 'unknown'
  | 'never';

/** The factories mapped one by one; the format and numeric sub-type tables are spread below. */
const FACTORY_BASE_TYPES: ReadonlyArray<readonly [ZodExportName, ZodSchemaBaseType]> = [
  ['string', 'string'],
  // the `iso` namespace stands for its member factories (`z.iso.date()`)
  ['iso', 'string'],
  ['number', 'number'],
  ['bigint', 'bigint'],

  // booleans — `stringbool` parses a string INPUT but outputs a boolean,
  // and checks run against the output
  ['boolean', 'boolean'],
  ['stringbool', 'boolean'],

  ['date', 'date'],
  ['array', 'array'],
  ['object', 'object'],
  ['strictObject', 'object'],
  ['looseObject', 'object'],
  ['set', 'set'],
  ['map', 'map'],
  ['literal', 'literal'],
  ['any', 'any'],
  ['unknown', 'unknown'],
  ['never', 'never'],
];

const BASE_TYPES = new Map<string, ZodSchemaBaseType>([
  ...FACTORY_BASE_TYPES,
  // every top-level format factory parses to `string`, every numeric sub-type to its family
  ...ZOD_STRING_FORMAT_NAMES.map((name): [string, ZodSchemaBaseType] => [name, 'string']),
  ...ZOD_NUMBER_SUBTYPE_NAMES.map((name): [string, ZodSchemaBaseType] => [name, 'number']),
  ...ZOD_BIGINT_SUBTYPE_NAMES.map((name): [string, ZodSchemaBaseType] => [name, 'bigint']),
]);

/** Every name {@link getZodSchemaBaseType} maps, including the `iso` namespace. */
export const ZOD_BASE_TYPE_NAMES = Object.freeze([...BASE_TYPES.keys()]);

/**
 * Maps a schema factory name (the `schemaType` of `detectZodSchemaRootNode`) to its base type category,
 * or `null` for factories the caller should not reason about (`union`, `tuple`, `enum`, `custom`, wrappers, …).
 */
export function getZodSchemaBaseType(schemaType: string): ZodSchemaBaseType | null {
  return BASE_TYPES.get(schemaType) ?? null;
}
