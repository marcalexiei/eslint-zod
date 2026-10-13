import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { readIntegerLiteralValue } from './read-integer-literal-value.js';

function makeLiteral(value: unknown): TSESTree.Node {
  return { type: AST_NODE_TYPES.Literal, value } as unknown as TSESTree.Node;
}

describe('readIntegerLiteralValue', () => {
  it('reads a positive integer literal', () => {
    expect(readIntegerLiteralValue(makeLiteral(3))).toBe(3);
  });

  it('reads zero', () => {
    expect(readIntegerLiteralValue(makeLiteral(0))).toBe(0);
  });

  it('returns null for a negative number', () => {
    expect(readIntegerLiteralValue(makeLiteral(-1))).toBeNull();
  });

  it('returns null for a fractional number', () => {
    expect(readIntegerLiteralValue(makeLiteral(1.5))).toBeNull();
  });

  it('returns null for a non-numeric literal', () => {
    expect(readIntegerLiteralValue(makeLiteral('3'))).toBeNull();
  });

  it('returns null for a non-literal node', () => {
    const identifier = { type: AST_NODE_TYPES.Identifier, name: 'n' } as unknown as TSESTree.Node;
    expect(readIntegerLiteralValue(identifier)).toBeNull();
  });

  it('returns null for a missing node', () => {
    expect(readIntegerLiteralValue(null)).toBeNull();
  });
});
