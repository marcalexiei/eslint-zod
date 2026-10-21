import type { ZodExportName } from '@eslint-zod/zod-api';

/**
 * Top-level Zod string-format factory names — the checks/factories that all
 * parse to `string` (`z.email()`, `z.uuid()`, `z.ipv4()`, …).
 *
 * Single source of truth: `getZodSchemaBaseType` maps each to the `string`
 * base type, and rules that reason about formats (e.g. `no-conflicting-checks`)
 * build their descriptor tables from it. The `iso.*` member formats
 * (`z.iso.date()`, …) are intentionally NOT here — their factory resolves to
 * the `iso` namespace, and their check names are dotted.
 */
export const ZOD_STRING_FORMAT_NAMES: ReadonlyArray<string> = Object.freeze<
  ReadonlyArray<ZodExportName>
>([
  'base64',
  'base64url',
  'cidrv4',
  'cidrv6',
  'creditCard',
  'cuid',
  'cuid2',
  'e164',
  'email',
  'emoji',
  'guid',
  'hash',
  'hex',
  'hostname',
  'httpUrl',
  'ipv4',
  'ipv6',
  'jwt',
  'ksuid',
  'mac',
  'nanoid',
  'ulid',
  'url',
  'uuid',
  'uuidv4',
  'uuidv6',
  'uuidv7',
  'xid',
]);
