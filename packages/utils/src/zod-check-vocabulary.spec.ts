import { describe, expect, it } from 'vitest';

import type { ZodSchemaConstraint } from './collect-zod-schema-constraints.js';
import { trackChain } from './spec-helpers.js';
import { canonicalizeZodConstraintName, getZodCheckDescriptor } from './zod-check-vocabulary.js';
import { ZOD_IMMUTABLE_SCHEMA_TYPES } from './zod-immutable-schema-types.js';
import { zodMiniImportScope } from './zod-import-scope.js';
import { ZOD_MUTATING_CHECK_NAMES } from './zod-mutating-check-names.js';
import { ZOD_NON_SCHEMA_PRODUCING_METHODS } from './zod-non-schema-producing-methods.js';
import { ZOD_STRING_FORMAT_METHODS } from './zod-string-format-methods.js';
import { ZOD_STRING_FORMAT_NAMES } from './zod-string-format-names.js';

/** The first constraint of a `zod` chain. */
function chained(code: string): ZodSchemaConstraint {
  const { tracker, call } = trackChain(code);
  return tracker.collectZodSchemaConstraints(call)[0];
}

/** The constraint a `zod/mini` check adds to `z.string()`. */
function checkArgument(check: string): ZodSchemaConstraint {
  const { tracker, call } = trackChain(`z.string().check(${check})`, zodMiniImportScope);
  return tracker.collectZodSchemaConstraints(call)[0];
}

describe('canonicalizeZodConstraintName', () => {
  it.each([
    ['z.string().min(1)', 'string', 'minLength'],
    ['z.array(z.string()).min(1)', 'array', 'minLength'],
    ['z.number().min(1)', 'number', 'gte'],
    ['z.bigint().min(BigInt(1))', 'bigint', 'gte'],
    ['z.date().min(new Date())', 'date', 'gte'],
    ['z.set(z.string()).min(1)', 'set', 'minSize'],
    ['z.map(z.string(), z.number()).max(1)', 'map', 'maxSize'],
  ] as const)('resolves %s on a %s to `%s`', (code, baseType, canonical) => {
    expect(canonicalizeZodConstraintName(chained(code), baseType)).toBe(canonical);
  });

  it.each([
    ['z.number().step(2)', 'number', 'multipleOf'],
    ['z.string().date()', 'string', 'iso.date'],
    ['z.string().datetime()', 'string', 'iso.datetime'],
  ] as const)('maps the deprecated %s to `%s`', (code, baseType, canonical) => {
    expect(canonicalizeZodConstraintName(chained(code), baseType)).toBe(canonical);
  });

  it('canonicalizes every chained string format to its top-level factory', () => {
    for (const { sourceMethodName, replacementMethodName } of ZOD_STRING_FORMAT_METHODS) {
      expect(
        canonicalizeZodConstraintName(chained(`z.string().${sourceMethodName}()`), 'string'),
      ).toBe(replacementMethodName);
    }
  });

  it.each([
    ['z.minLength(1)', 'string', 'minLength'],
    ['z.minimum(1)', 'number', 'gte'],
    ['z.maximum(1)', 'number', 'lte'],
    ['z.iso.datetime()', 'string', 'iso.datetime'],
  ] as const)('resolves the check %s to `%s`', (check, baseType, canonical) => {
    expect(canonicalizeZodConstraintName(checkArgument(check), baseType)).toBe(canonical);
  });

  it('returns null for a check it does not model', () => {
    expect(canonicalizeZodConstraintName(chained('z.string().brand()'), 'string')).toBeNull();
    // A base type with no chained bounds.
    expect(canonicalizeZodConstraintName(chained('z.string().min(1)'), 'boolean')).toBeNull();
    // Computed, so the ISO format cannot be read.
    expect(
      canonicalizeZodConstraintName(checkArgument("z.iso['datetime']()"), 'string'),
    ).toBeNull();
  });
});

describe('getZodCheckDescriptor', () => {
  it('describes bounds with their domain and inclusivity', () => {
    expect(getZodCheckDescriptor('minLength')?.bound).toEqual({
      kind: 'lower',
      domain: 'length',
      inclusive: true,
    });
    expect(getZodCheckDescriptor('gt')?.bound).toEqual({
      kind: 'lower',
      domain: 'value',
      inclusive: false,
    });
    expect(getZodCheckDescriptor('positive')?.bound?.fixedValue).toBe(0);
  });

  it('returns null for names the vocabulary does not model', () => {
    expect(getZodCheckDescriptor('brand')).toBeNull();
  });

  it('describes every canonical string format as a string format check', () => {
    const canonicalFormats = ZOD_STRING_FORMAT_METHODS.map(
      ({ replacementMethodName }) => replacementMethodName,
    );

    for (const name of [...ZOD_STRING_FORMAT_NAMES, ...canonicalFormats]) {
      expect(getZodCheckDescriptor(name)).toEqual({ appliesTo: ['string'], format: true });
    }
  });
});

describe('vocabulary tables are frozen', () => {
  it.each([
    ['ZOD_IMMUTABLE_SCHEMA_TYPES', ZOD_IMMUTABLE_SCHEMA_TYPES],
    ['ZOD_MUTATING_CHECK_NAMES', ZOD_MUTATING_CHECK_NAMES],
    ['ZOD_NON_SCHEMA_PRODUCING_METHODS', ZOD_NON_SCHEMA_PRODUCING_METHODS],
    ['ZOD_STRING_FORMAT_NAMES', ZOD_STRING_FORMAT_NAMES],
    ['ZOD_STRING_FORMAT_METHODS', ZOD_STRING_FORMAT_METHODS],
  ])('%s cannot be mutated at runtime', (_name, table) => {
    expect(Object.isFrozen(table)).toBe(true);
    expect(() => (table as Array<unknown>).push('injected')).toThrow(TypeError);
  });
});

describe('vocabulary tables agree with each other', () => {
  it('replaces each chained format with a known top-level factory or an `iso.*` member', () => {
    for (const { replacementMethodName } of ZOD_STRING_FORMAT_METHODS) {
      if (replacementMethodName.startsWith('iso.')) {
        continue;
      }
      expect(ZOD_STRING_FORMAT_NAMES).toContain(replacementMethodName);
    }
  });

  it('treats every top-level string format as an immutable schema type', () => {
    // They all parse to `string`. A hand-copied list once dropped `mac`.
    for (const formatName of ZOD_STRING_FORMAT_NAMES) {
      expect(ZOD_IMMUTABLE_SCHEMA_TYPES).toContain(formatName);
    }
  });
});
