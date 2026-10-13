import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { buildZodChainRemoveMethodFix } from './build-zod-chain-remove-method-fix.js';
import type { RuleFixer } from './rule-types.js';

function makeNodeWithRange(
  start: number,
  end: number,
  receiverStart = start,
): TSESTree.CallExpression {
  return {
    range: [start, end],
    callee: {
      type: AST_NODE_TYPES.MemberExpression,
      range: [start, end],
      object: { range: [receiverStart, end] },
    },
  } as unknown as TSESTree.CallExpression;
}

function makeFixer(): {
  fixer: RuleFixer;
  calls: { removeRange?: [number, number] };
} {
  const calls: { removeRange?: [number, number] } = {};
  const fixer = {
    removeRange(range: [number, number]) {
      calls.removeRange = range;
      return { range };
    },
  } as unknown as RuleFixer;
  return { fixer, calls };
}

describe('buildZodChainRemoveMethodFix', () => {
  it('returns null when the receiver is parenthesized: (z.number()).finite()', () => {
    const { fixer } = makeFixer();
    const methods = [
      { name: 'number', node: makeNodeWithRange(1, 11) },
      { name: 'finite', node: makeNodeWithRange(0, 21, 1) },
    ];
    expect(buildZodChainRemoveMethodFix({ fixer, methods, removeIndex: 1 })).toBeNull();
  });

  it('returns null when a comment sits in the removed text: z.number() /* c */ .finite()', () => {
    const { fixer, calls } = makeFixer();
    const methods = [
      { name: 'number', node: makeNodeWithRange(0, 10) },
      { name: 'finite', node: makeNodeWithRange(0, 28) },
    ];
    const sourceCode = { getAllComments: () => [{ range: [11, 18] }] } as never;

    expect(buildZodChainRemoveMethodFix({ fixer, methods, removeIndex: 1, sourceCode })).toBeNull();
    expect(calls.removeRange).toBeUndefined();
  });

  it('removes the method when the comment sits outside the removed text', () => {
    const { fixer, calls } = makeFixer();
    const methods = [
      { name: 'number', node: makeNodeWithRange(0, 10) },
      { name: 'finite', node: makeNodeWithRange(0, 19) },
    ];
    const sourceCode = { getAllComments: () => [{ range: [21, 28] }] } as never;

    buildZodChainRemoveMethodFix({ fixer, methods, removeIndex: 1, sourceCode });

    expect(calls.removeRange).toStrictEqual([10, 19]);
  });

  it('returns null when removeIndex < 1', () => {
    const { fixer } = makeFixer();
    const methods = [{ name: 'number', node: makeNodeWithRange(0, 10) }];
    expect(buildZodChainRemoveMethodFix({ fixer, methods, removeIndex: 0 })).toBeNull();
  });

  it('returns null when removeIndex is negative', () => {
    const { fixer } = makeFixer();
    const methods = [{ name: 'number', node: makeNodeWithRange(0, 10) }];
    expect(buildZodChainRemoveMethodFix({ fixer, methods, removeIndex: -1 })).toBeNull();
  });

  it('returns null when the target node has no range', () => {
    const { fixer } = makeFixer();
    const methods = [
      { name: 'number', node: makeNodeWithRange(0, 10) },
      { name: 'finite', node: {} as unknown as TSESTree.CallExpression },
    ];
    expect(buildZodChainRemoveMethodFix({ fixer, methods, removeIndex: 1 })).toBeNull();
  });

  it('removes a trailing method: z.number().min(0).finite()', () => {
    // ranges: z.number() = [0,10], z.number().min(0) = [0,18], z.number().min(0).finite() = [0,27]
    const { fixer, calls } = makeFixer();
    const methods = [
      { name: 'number', node: makeNodeWithRange(0, 10) },
      { name: 'min', node: makeNodeWithRange(0, 18) },
      { name: 'finite', node: makeNodeWithRange(0, 27) },
    ];
    buildZodChainRemoveMethodFix({ fixer, methods, removeIndex: 2 });
    // removes from end of methods[1] to end of methods[2]
    expect(calls.removeRange).toStrictEqual([18, 27]);
  });

  it('removes a middle method', () => {
    const { fixer, calls } = makeFixer();
    const methods = [
      { name: 'number', node: makeNodeWithRange(0, 10) },
      { name: 'min', node: makeNodeWithRange(0, 18) },
      { name: 'finite', node: makeNodeWithRange(0, 27) },
    ];
    buildZodChainRemoveMethodFix({ fixer, methods, removeIndex: 1 });
    expect(calls.removeRange).toStrictEqual([10, 18]);
  });
});
