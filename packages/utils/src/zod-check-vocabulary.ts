import type { ZodExportName, ZodIsoMemberName, ZodMethodName } from '@eslint-zod/tooling/zod-api';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { ZodSchemaConstraint } from './collect-zod-schema-constraints.js';
import type { ZodSchemaBaseType } from './get-zod-schema-base-type.js';
import { ZOD_STRING_FORMAT_METHODS } from './zod-string-format-methods.js';
import { ZOD_STRING_FORMAT_NAMES } from './zod-string-format-names.js';

/** What a bound constrains: a string/array length, a set/map size, or a value. */
export type ZodCheckDomain = 'length' | 'size' | 'value';

/** The ordering constraint a check imposes, when it imposes one. */
export interface ZodCheckBound {
  kind: 'lower' | 'upper' | 'exact';
  domain: ZodCheckDomain;
  /** Whether the bound includes its value; irrelevant for `exact`. */
  inclusive?: boolean;
  /** Bound value implied by the check itself (e.g. `positive()` = `> 0`). */
  fixedValue?: number;
}

/**
 * What a Zod check means, independently of how it is spelled: which base types
 * accept it and what it constrains. Keyed by canonical name — see
 * {@link canonicalizeZodConstraintName}.
 */
export interface ZodCheckDescriptor {
  /** Base types the check applies to; anything else is a no-op or a mistake. */
  appliesTo: ReadonlyArray<ZodSchemaBaseType>;
  bound?: ZodCheckBound;
  /** A string format assertion (`email`, `uuid`, `iso.date`, …). */
  format?: boolean;
  content?: 'includes' | 'startsWith' | 'endsWith';
  casing?: 'lowercase' | 'uppercase';
  multipleOf?: boolean;
  /** Marks the value as an integer (`int`). */
  intMarker?: boolean;
}

const STRING = ['string'] as const;
const STRING_OR_ARRAY = ['string', 'array'] as const;
const NUMERIC = ['number', 'bigint'] as const;
const COMPARABLE = ['number', 'bigint', 'date'] as const;
const SIZED = ['set', 'map'] as const;

/**
 * The `iso.*` member formats (`z.iso.date()`, …). Their factory resolves to the
 * `iso` namespace, so they are named with a dotted canonical name and are
 * deliberately absent from {@link ZOD_STRING_FORMAT_NAMES}.
 */
const ISO_FORMAT_NAMES = ZOD_STRING_FORMAT_METHODS.map(
  ({ replacementMethodName }) => replacementMethodName,
).filter((name) => name.startsWith('iso.'));

/** A canonical check name: a standalone check, a chained-only spelling (`nonempty`) or an `iso.*` member. */
type CanonicalCheckName = ZodExportName | ZodIsoMemberName | ZodMethodName;

/** The checks with a meaning of their own; the string formats are added below. */
const CHECK_DESCRIPTOR_ENTRIES: ReadonlyArray<readonly [CanonicalCheckName, ZodCheckDescriptor]> = [
  // length
  [
    'minLength',
    { appliesTo: STRING_OR_ARRAY, bound: { kind: 'lower', domain: 'length', inclusive: true } },
  ],
  [
    'maxLength',
    { appliesTo: STRING_OR_ARRAY, bound: { kind: 'upper', domain: 'length', inclusive: true } },
  ],
  ['length', { appliesTo: STRING_OR_ARRAY, bound: { kind: 'exact', domain: 'length' } }],
  [
    'nonempty',
    {
      appliesTo: STRING_OR_ARRAY,
      bound: { kind: 'lower', domain: 'length', inclusive: true, fixedValue: 1 },
    },
  ],
  // size
  ['minSize', { appliesTo: SIZED, bound: { kind: 'lower', domain: 'size', inclusive: true } }],
  ['maxSize', { appliesTo: SIZED, bound: { kind: 'upper', domain: 'size', inclusive: true } }],
  ['size', { appliesTo: SIZED, bound: { kind: 'exact', domain: 'size' } }],
  // value bounds
  ['gt', { appliesTo: COMPARABLE, bound: { kind: 'lower', domain: 'value', inclusive: false } }],
  ['gte', { appliesTo: COMPARABLE, bound: { kind: 'lower', domain: 'value', inclusive: true } }],
  ['lt', { appliesTo: COMPARABLE, bound: { kind: 'upper', domain: 'value', inclusive: false } }],
  ['lte', { appliesTo: COMPARABLE, bound: { kind: 'upper', domain: 'value', inclusive: true } }],
  [
    'positive',
    {
      appliesTo: NUMERIC,
      bound: { kind: 'lower', domain: 'value', inclusive: false, fixedValue: 0 },
    },
  ],
  [
    'negative',
    {
      appliesTo: NUMERIC,
      bound: { kind: 'upper', domain: 'value', inclusive: false, fixedValue: 0 },
    },
  ],
  [
    'nonnegative',
    {
      appliesTo: NUMERIC,
      bound: { kind: 'lower', domain: 'value', inclusive: true, fixedValue: 0 },
    },
  ],
  [
    'nonpositive',
    {
      appliesTo: NUMERIC,
      bound: { kind: 'upper', domain: 'value', inclusive: true, fixedValue: 0 },
    },
  ],
  // numeric shape
  ['multipleOf', { appliesTo: NUMERIC, multipleOf: true }],
  ['int', { appliesTo: ['number'], intMarker: true }],
  // string content / casing / pattern
  ['includes', { appliesTo: STRING, content: 'includes' }],
  ['startsWith', { appliesTo: STRING, content: 'startsWith' }],
  ['endsWith', { appliesTo: STRING, content: 'endsWith' }],
  ['lowercase', { appliesTo: STRING, casing: 'lowercase' }],
  ['uppercase', { appliesTo: STRING, casing: 'uppercase' }],
  ['regex', { appliesTo: STRING }],
];

/**
 * Every known check by canonical name — the standalone `$ZodCheck` vocabulary
 * (`minLength`, `gte`, …) plus the string formats, which behave like checks
 * whether they are written as a factory (`z.uuid()`) or chained on a string.
 */
const CHECK_DESCRIPTORS = new Map<string, ZodCheckDescriptor>([
  ...CHECK_DESCRIPTOR_ENTRIES,
  // string formats — the top-level factories plus the dotted `iso.*` members
  ...[...ZOD_STRING_FORMAT_NAMES, ...ISO_FORMAT_NAMES].map((name): [string, ZodCheckDescriptor] => [
    name,
    { appliesTo: STRING, format: true },
  ]),
]);

/**
 * Chained (`zod`) spellings whose canonical name does not depend on the base
 * type. `step` is the deprecated spelling of `multipleOf`; the rest are spelled
 * the same either way.
 */
const CHAINED_COMMON: ReadonlyArray<readonly [ZodMethodName, CanonicalCheckName]> = [
  ...(
    [
      'gt',
      'gte',
      'lt',
      'lte',
      'positive',
      'negative',
      'nonnegative',
      'nonpositive',
      'multipleOf',
      'int',
      'includes',
      'startsWith',
      'endsWith',
      'lowercase',
      'uppercase',
      'regex',
      'nonempty',
    ] as const
  ).map((name): [ZodMethodName, CanonicalCheckName] => [name, name]),
  ['step', 'multipleOf'],
];

/**
 * Chained string formats (`z.string().email()`, …) reduce to the top-level
 * factory that replaced them, so a chained format and a top-level one compare
 * as the same check.
 */
const CHAINED_STRING_FORMATS: ReadonlyArray<readonly [ZodMethodName, CanonicalCheckName]> =
  ZOD_STRING_FORMAT_METHODS.map(
    ({ sourceMethodName, replacementMethodName }): [ZodMethodName, CanonicalCheckName] => [
      sourceMethodName,
      replacementMethodName,
    ],
  );

/** `.min()` / `.max()` bound a length, a value or a size, and `.length()` / `.size()` pin one. */
const LENGTH_BOUNDS: ReadonlyArray<readonly [ZodMethodName, CanonicalCheckName]> = [
  ['min', 'minLength'],
  ['max', 'maxLength'],
  ['length', 'length'],
];
const VALUE_BOUNDS: ReadonlyArray<readonly [ZodMethodName, CanonicalCheckName]> = [
  ['min', 'gte'],
  ['max', 'lte'],
];
const SIZE_BOUNDS: ReadonlyArray<readonly [ZodMethodName, CanonicalCheckName]> = [
  ['min', 'minSize'],
  ['max', 'maxSize'],
  ['size', 'size'],
];

/**
 * Chained spellings → canonical check names, per base type. `.min()`/`.max()`
 * are type-dependent: length bounds on strings/arrays, value bounds on
 * numbers/bigints/dates, size bounds on sets/maps.
 */
const CHAINED_CANONICAL = new Map<ZodSchemaBaseType, ReadonlyMap<string, string>>([
  ['string', new Map([...CHAINED_COMMON, ...CHAINED_STRING_FORMATS, ...LENGTH_BOUNDS])],
  ['array', new Map([...CHAINED_COMMON, ...LENGTH_BOUNDS])],
  ['number', new Map([...CHAINED_COMMON, ...VALUE_BOUNDS])],
  ['bigint', new Map([...CHAINED_COMMON, ...VALUE_BOUNDS])],
  ['date', new Map([...CHAINED_COMMON, ...VALUE_BOUNDS])],
  ['set', new Map([...CHAINED_COMMON, ...SIZE_BOUNDS])],
  ['map', new Map([...CHAINED_COMMON, ...SIZE_BOUNDS])],
]);

/** `zod/mini` exports these as second names for `gte` and `lte`. */
const CHECK_ARGUMENT_ALIASES: ReadonlyMap<string, string> = new Map<
  ZodExportName,
  CanonicalCheckName
>([
  ['minimum', 'gte'],
  ['maximum', 'lte'],
]);

/**
 * Looks up what a check means by its canonical name (see
 * {@link canonicalizeZodConstraintName}). Returns `null` for names the
 * vocabulary does not model — callers should skip those rather than guess.
 */
export function getZodCheckDescriptor(canonicalName: string): ZodCheckDescriptor | null {
  return CHECK_DESCRIPTORS.get(canonicalName) ?? null;
}

/**
 * Reduces a constraint's source spelling to the canonical check name shared by
 * both API styles, so rule logic can compare `zod`'s `z.string().min(2)` with
 * `zod/mini`'s `z.string().check(z.minLength(2))` as the same constraint.
 *
 * Chained names are type-dependent, hence the `baseType` argument: `.min()` is
 * `minLength` on a string, `gte` on a number and `minSize` on a set.
 * `.check(...)` arguments are already canonical, except the `minimum` / `maximum` aliases
 * and the `iso.*` formats, whose factory resolves to the `iso` namespace and is read from the callee.
 *
 * Returns `null` when the spelling has no canonical form for that base type —
 * an unknown method, or one that does not constrain the value.
 *
 * @example
 * ```ts
 * canonicalizeZodConstraintName(minConstraint, 'string'); // 'minLength'
 * canonicalizeZodConstraintName(minConstraint, 'number'); // 'gte'
 * canonicalizeZodConstraintName(emailConstraint, 'string'); // 'email'
 * ```
 */
export function canonicalizeZodConstraintName(
  constraint: ZodSchemaConstraint,
  baseType: ZodSchemaBaseType,
): string | null {
  if (constraint.origin === 'check-argument') {
    if (constraint.name !== 'iso') {
      return CHECK_ARGUMENT_ALIASES.get(constraint.name) ?? constraint.name;
    }

    // `z.iso.date()` detects as `iso`; read the member name to tell the ISO
    // formats apart.
    const { callee } = constraint.node;
    if (
      callee.type === AST_NODE_TYPES.MemberExpression &&
      callee.property.type === AST_NODE_TYPES.Identifier
    ) {
      return `iso.${callee.property.name}`;
    }

    return null;
  }

  return CHAINED_CANONICAL.get(baseType)?.get(constraint.name) ?? null;
}
