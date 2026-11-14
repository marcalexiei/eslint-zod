import { describe, expect, it } from 'vitest';

import { buildZodChainRemoveMethodFix } from './build-zod-chain-remove-method-fix.js';
import { trackChain } from './spec-helpers.js';

/** The fixed code, or `null` when there is no fix. */
function remove(code: string, removeIndex: number): string | null {
  const { sourceCode, methods, applyFix } = trackChain(code);
  return applyFix((fixer) =>
    buildZodChainRemoveMethodFix({ fixer, methods, removeIndex, sourceCode }),
  );
}

describe('buildZodChainRemoveMethodFix', () => {
  it.each([
    ['z.number().min(0).finite()', 2, 'z.number().min(0)'],
    ['z.number().min(0).finite()', 1, 'z.number().finite()'],
    ['z.number().finite() /* c */', 1, 'z.number() /* c */'],
  ])('removes from %s the call at %i', (code, removeIndex, expected) => {
    expect(remove(code, removeIndex)).toBe(expected);
  });

  it.each([
    ['the factory', 'z.number().finite()', 0],
    ['a negative index', 'z.number().finite()', -1],
    ['an index past the chain', 'z.number()', 1],
    ['a parenthesized receiver', '(z.number()).finite()', 1],
    ['a comment in the removed text', 'z.number() /* c */ .finite()', 1],
  ])('returns null for %s: %s', (_, code, removeIndex) => {
    expect(remove(code, removeIndex)).toBeNull();
  });
});
