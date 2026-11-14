import { describe, expect, it } from 'vitest';

import { buildZodChainReplacementFix } from './build-zod-chain-replacement-fix.js';
import { track, trackChain } from './spec-helpers.js';

/** The fixed code, or `null` when there is no fix. */
function replace(code: string, toIndex: number, toMethodName: string): string | null {
  const { sourceCode, methods, applyFix } = trackChain(code);
  return applyFix((fixer) =>
    buildZodChainReplacementFix({ sourceCode, fixer, methods, toIndex, toMethodName }),
  );
}

describe('buildZodChainReplacementFix', () => {
  it.each([
    ['z.number().int()', 'z.int()'],
    ['z.number().min(1).int()', 'z.int().min(1)'],
    ['z.number().min(1).max(5).int()', 'z.int().min(1).max(5)'],
    ["z.string().email('Invalid email')", "z.email('Invalid email')"],
  ])('rewrites %s up to its last call', (code, expected) => {
    const { methods } = trackChain(code);
    const last = methods.length - 1;
    expect(replace(code, last, methods[last].name)).toBe(expected);
  });

  it('keeps the calls past toIndex: z.number().int().optional()', () => {
    expect(replace('z.number().int().optional()', 1, 'int')).toBe('z.int().optional()');
  });

  it.each([
    ['toIndex is past the chain', 'z.number()', 1],
    ['a comment sits inside the rewritten range', 'z.number() /* c */ .int()', 1],
    ['a receiver is parenthesized', '(z.number()).int()', 1],
    ['an in-between receiver is parenthesized', '(z.number().min(1)).int()', 2],
  ])('returns null when %s: %s', (_, code, toIndex) => {
    expect(replace(code, toIndex, 'int')).toBeNull();
  });

  it('returns null for an empty chain', () => {
    const { sourceCode, applyFix } = track('');
    expect(
      applyFix((fixer) =>
        buildZodChainReplacementFix({
          sourceCode,
          fixer,
          methods: [],
          toIndex: 1,
          toMethodName: 'int',
        }),
      ),
    ).toBeNull();
  });
});
