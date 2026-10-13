import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import type { ZodSchemaConstraint } from './collect-zod-schema-constraints.js';
import { canonicalizeZodConstraintName, getZodCheckDescriptor } from './zod-check-vocabulary.js';
import { ZOD_IMMUTABLE_SCHEMA_TYPES } from './zod-immutable-schema-types.js';
import { ZOD_MUTATING_CHECK_NAMES } from './zod-mutating-check-names.js';
import { ZOD_NON_SCHEMA_PRODUCING_METHODS } from './zod-non-schema-producing-methods.js';
import { ZOD_STRING_FORMAT_METHODS } from './zod-string-format-methods.js';
import { ZOD_STRING_FORMAT_NAMES } from './zod-string-format-names.js';

function chained(name: string): ZodSchemaConstraint {
  return {
    name,
    origin: 'chained',
    chainIndex: 1,
    node: { arguments: [] } as unknown as TSESTree.CallExpression,
  };
}

function checkArgument(name: string, memberName?: string): ZodSchemaConstraint {
  const callee = memberName
    ? {
        type: AST_NODE_TYPES.MemberExpression,
        property: { type: AST_NODE_TYPES.Identifier, name: memberName },
      }
    : { type: AST_NODE_TYPES.Identifier, name };

  return {
    name,
    origin: 'check-argument',
    chainIndex: 1,
    argumentIndex: 0,
    argumentCount: 1,
    checkNode: {} as TSESTree.CallExpression,
    node: { callee, arguments: [] } as unknown as TSESTree.CallExpression,
  };
}

describe('canonicalizeZodConstraintName', () => {
  it.each([
    ['min', 'string', 'minLength'],
    ['min', 'array', 'minLength'],
    ['min', 'number', 'gte'],
    ['min', 'bigint', 'gte'],
    ['min', 'date', 'gte'],
    ['min', 'set', 'minSize'],
    ['max', 'map', 'maxSize'],
  ] as const)('resolves chained `%s` on a %s to `%s`', (name, baseType, canonical) => {
    expect(canonicalizeZodConstraintName(chained(name), baseType)).toBe(canonical);
  });

  it('maps deprecated chained spellings to their replacement', () => {
    expect(canonicalizeZodConstraintName(chained('step'), 'number')).toBe('multipleOf');
    expect(canonicalizeZodConstraintName(chained('date'), 'string')).toBe('iso.date');
    expect(canonicalizeZodConstraintName(chained('datetime'), 'string')).toBe('iso.datetime');
  });

  it('canonicalizes every chained string format to its top-level factory', () => {
    for (const { sourceMethodName, replacementMethodName } of ZOD_STRING_FORMAT_METHODS) {
      expect(canonicalizeZodConstraintName(chained(sourceMethodName), 'string')).toBe(
        replacementMethodName,
      );
    }
  });

  it('passes `.check(...)` arguments through, resolving `iso` members', () => {
    expect(canonicalizeZodConstraintName(checkArgument('minLength'), 'string')).toBe('minLength');
    expect(canonicalizeZodConstraintName(checkArgument('minimum'), 'number')).toBe('gte');
    expect(canonicalizeZodConstraintName(checkArgument('maximum'), 'number')).toBe('lte');
    expect(canonicalizeZodConstraintName(checkArgument('iso', 'datetime'), 'string')).toBe(
      'iso.datetime',
    );
  });

  it('returns null for an unmodelled spelling or an unreadable `iso` member', () => {
    expect(canonicalizeZodConstraintName(chained('brand'), 'string')).toBeNull();
    expect(canonicalizeZodConstraintName(chained('min'), 'boolean')).toBeNull();

    const computedIso: ZodSchemaConstraint = {
      ...checkArgument('iso'),
      node: {
        callee: { type: AST_NODE_TYPES.Identifier, name: 'iso' },
        arguments: [],
      } as unknown as TSESTree.CallExpression,
    };
    expect(canonicalizeZodConstraintName(computedIso, 'string')).toBeNull();
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
    // All of them parse to `string`, so `.readonly()` is a no-op on each.
    // Asserted as a set relation rather than by eye: the immutable table used
    // to hand-copy this list and had already dropped `mac`.
    for (const formatName of ZOD_STRING_FORMAT_NAMES) {
      expect(ZOD_IMMUTABLE_SCHEMA_TYPES).toContain(formatName);
    }
  });
});
