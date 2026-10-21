import type { ZodExportName, ZodIsoMemberName, ZodMethodName } from '@eslint-zod/zod-api';

/**
 * Deprecated `z.string().<format>()` methods and the top-level factory that
 * replaces each of them.
 *
 * Zod 4 promoted every string format to a top-level factory (`z.email()`,
 * `z.uuid()`, …) and deprecated the chained spelling. The four date/time
 * formats moved under the `iso` namespace instead, so their replacement is a
 * dotted member name (`date` → `iso.date`).
 *
 * Single source of truth for both readings of that mapping: the migration
 * (`prefer-top-level-string-formats` rewrites source → replacement) and the
 * canonicalization (`no-conflicting-checks` compares a chained format against
 * a top-level one, so both must reduce to the same name).
 *
 * @see {@link ZOD_STRING_FORMAT_NAMES} for the top-level factory names, which
 * additionally cover formats that never had a chained spelling.
 */
export const ZOD_STRING_FORMAT_METHODS = Object.freeze([
  { sourceMethodName: 'base64', replacementMethodName: 'base64' },
  { sourceMethodName: 'base64url', replacementMethodName: 'base64url' },
  { sourceMethodName: 'cidrv4', replacementMethodName: 'cidrv4' },
  { sourceMethodName: 'cidrv6', replacementMethodName: 'cidrv6' },
  { sourceMethodName: 'cuid', replacementMethodName: 'cuid' },
  { sourceMethodName: 'cuid2', replacementMethodName: 'cuid2' },
  { sourceMethodName: 'date', replacementMethodName: 'iso.date' },
  { sourceMethodName: 'datetime', replacementMethodName: 'iso.datetime' },
  { sourceMethodName: 'duration', replacementMethodName: 'iso.duration' },
  { sourceMethodName: 'e164', replacementMethodName: 'e164' },
  { sourceMethodName: 'email', replacementMethodName: 'email' },
  { sourceMethodName: 'emoji', replacementMethodName: 'emoji' },
  { sourceMethodName: 'guid', replacementMethodName: 'guid' },
  { sourceMethodName: 'ipv4', replacementMethodName: 'ipv4' },
  { sourceMethodName: 'ipv6', replacementMethodName: 'ipv6' },
  { sourceMethodName: 'jwt', replacementMethodName: 'jwt' },
  { sourceMethodName: 'ksuid', replacementMethodName: 'ksuid' },
  { sourceMethodName: 'nanoid', replacementMethodName: 'nanoid' },
  { sourceMethodName: 'time', replacementMethodName: 'iso.time' },
  { sourceMethodName: 'ulid', replacementMethodName: 'ulid' },
  { sourceMethodName: 'url', replacementMethodName: 'url' },
  { sourceMethodName: 'uuid', replacementMethodName: 'uuid' },
  { sourceMethodName: 'uuidv4', replacementMethodName: 'uuidv4' },
  { sourceMethodName: 'uuidv6', replacementMethodName: 'uuidv6' },
  { sourceMethodName: 'uuidv7', replacementMethodName: 'uuidv7' },
  { sourceMethodName: 'xid', replacementMethodName: 'xid' },
] as const satisfies ReadonlyArray<{
  sourceMethodName: ZodMethodName;
  replacementMethodName: ZodExportName | ZodIsoMemberName;
}>);

/** Name of a deprecated `z.string().<format>()` method. */
export type ZodStringFormatMethodName =
  (typeof ZOD_STRING_FORMAT_METHODS)[number]['sourceMethodName'];
