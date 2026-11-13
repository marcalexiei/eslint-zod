import { getZodSchemaFactoryName } from '@eslint-zod/utils';
import type { ZodSchemaMeta } from '@eslint-zod/utils';
import type { ZodExportName } from '@eslint-zod/zod-api';

/** Number factories that accept only safe integers, so `.int()` and `.safe()` add nothing to them. */
export const INTEGER_NUMBER_FACTORIES = [
  'int',
  'int32',
  'uint32',
] as const satisfies ReadonlyArray<ZodExportName>;

/** Number factories that accept fractions, so `.int()` or `.safe()` on them is `z.int()`. */
export const NON_INTEGER_NUMBER_FACTORIES = [
  'number',
  'float32',
  'float64',
] as const satisfies ReadonlyArray<ZodExportName>;

/** Every factory building a `ZodNumber`, each of which chains the deprecated number methods. */
export const NUMBER_FACTORIES: ReadonlyArray<string> = [
  ...NON_INTEGER_NUMBER_FACTORIES,
  ...INTEGER_NUMBER_FACTORIES,
];

/** Whether a detected chain builds a `ZodNumber`, `z.coerce.number()` included. */
export function isNumberSchema(meta: ZodSchemaMeta): boolean {
  const factory = getZodSchemaFactoryName(meta);
  return factory !== null && NUMBER_FACTORIES.includes(factory);
}
