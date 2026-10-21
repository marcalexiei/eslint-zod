import type { ZodExportName } from '@eslint-zod/tooling/zod-api';

/**
 * Numeric sub-type factory names, shared by every table that reasons about them.
 * Module-local on purpose: an external rule author wants `getZodSchemaBaseType`,
 * not the raw list.
 */
export const ZOD_NUMBER_SUBTYPE_NAMES: ReadonlyArray<string> = Object.freeze<
  ReadonlyArray<ZodExportName>
>(['int', 'int32', 'uint32', 'float32', 'float64']);

export const ZOD_BIGINT_SUBTYPE_NAMES: ReadonlyArray<string> = Object.freeze<
  ReadonlyArray<ZodExportName>
>(['int64', 'uint64']);
