import type { ZodExportName } from '@eslint-zod/zod-api';

/** The factories that build an object schema from a shape. */
export const ZOD_OBJECT_METHODS = Object.freeze([
  'object',
  'looseObject',
  'strictObject',
] as const satisfies ReadonlyArray<ZodExportName>);

export type ZodObjectMethod = (typeof ZOD_OBJECT_METHODS)[number];
