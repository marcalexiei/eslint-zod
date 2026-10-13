import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { buildZodConstraintsRemoveFix } from './build-zod-constraints-remove-fix.js';
import type {
  ZodChainedConstraint,
  ZodCheckArgumentConstraint,
} from './collect-zod-schema-constraints.js';
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
  removedRanges: Array<[number, number]>;
} {
  const removedRanges: Array<[number, number]> = [];
  const fixer = {
    removeRange(range: [number, number]) {
      removedRanges.push(range);
      return { range };
    },
  } as unknown as RuleFixer;
  return { fixer, removedRanges };
}

function makeChained(chainIndex: number, node: TSESTree.CallExpression): ZodChainedConstraint {
  return { name: 'min', node, origin: 'chained', chainIndex };
}

function makeCheckArgument(opts: {
  chainIndex: number;
  checkNode: TSESTree.CallExpression;
  argumentIndex: number;
  argumentCount: number;
}): ZodCheckArgumentConstraint {
  return {
    name: 'minLength',
    node: makeNodeWithRange(0, 0),
    origin: 'check-argument',
    ...opts,
  };
}

describe('buildZodConstraintsRemoveFix', () => {
  it('removes a chained constraint as a chain method', () => {
    // ranges: z.array(x) = [0,10], z.array(x).min(2) = [0,18]
    const methods = [
      { name: 'array', node: makeNodeWithRange(0, 10) },
      { name: 'min', node: makeNodeWithRange(0, 18) },
    ];
    const { fixer, removedRanges } = makeFixer();

    const fixes = buildZodConstraintsRemoveFix({
      fixer,
      methods,
      constraints: [makeChained(1, methods[1].node)],
    });

    expect(fixes).toHaveLength(1);
    expect(removedRanges).toStrictEqual([[10, 18]]);
  });

  it('removes a whole `.check(...)` call when every argument is targeted', () => {
    // ranges: z.array(x) = [0,10], z.array(x).check(a, b) = [0,30]
    const methods = [
      { name: 'array', node: makeNodeWithRange(0, 10) },
      { name: 'check', node: makeNodeWithRange(0, 30) },
    ];
    const { fixer, removedRanges } = makeFixer();

    const fixes = buildZodConstraintsRemoveFix({
      fixer,
      methods,
      constraints: [
        makeCheckArgument({
          chainIndex: 1,
          checkNode: methods[1].node,
          argumentIndex: 0,
          argumentCount: 2,
        }),
        makeCheckArgument({
          chainIndex: 1,
          checkNode: methods[1].node,
          argumentIndex: 1,
          argumentCount: 2,
        }),
      ],
    });

    expect(fixes).toHaveLength(1);
    expect(removedRanges).toStrictEqual([[10, 30]]);
  });

  it('returns null when removing a `.check(...)` would orphan a sibling argument', () => {
    const methods = [
      { name: 'array', node: makeNodeWithRange(0, 10) },
      { name: 'check', node: makeNodeWithRange(0, 30) },
    ];
    const { fixer } = makeFixer();

    const fixes = buildZodConstraintsRemoveFix({
      fixer,
      methods,
      // only 1 of the 2 check arguments is targeted
      constraints: [
        makeCheckArgument({
          chainIndex: 1,
          checkNode: methods[1].node,
          argumentIndex: 0,
          argumentCount: 2,
        }),
      ],
    });

    expect(fixes).toBeNull();
  });

  it('combines chained and check-argument removals across the chain', () => {
    // Abstract chain exercising both origins at once (real code never mixes
    // API styles; the fixer just makes no assumption either way).
    // ranges: z.array(x) = [0,10], .min(2) = [0,18], .check(a) = [0,30]
    const methods = [
      { name: 'array', node: makeNodeWithRange(0, 10) },
      { name: 'min', node: makeNodeWithRange(0, 18) },
      { name: 'check', node: makeNodeWithRange(0, 30) },
    ];
    const { fixer, removedRanges } = makeFixer();

    const fixes = buildZodConstraintsRemoveFix({
      fixer,
      methods,
      constraints: [
        makeChained(1, methods[1].node),
        makeCheckArgument({
          chainIndex: 2,
          checkNode: methods[2].node,
          argumentIndex: 0,
          argumentCount: 1,
        }),
      ],
    });

    expect(fixes).toHaveLength(2);
    expect(removedRanges).toStrictEqual([
      [10, 18],
      [18, 30],
    ]);
  });

  it('returns null when a chained constraint cannot be removed (factory position)', () => {
    const methods = [{ name: 'array', node: makeNodeWithRange(0, 10) }];
    const { fixer } = makeFixer();

    const fixes = buildZodConstraintsRemoveFix({
      fixer,
      methods,
      constraints: [makeChained(0, methods[0].node)],
    });

    expect(fixes).toBeNull();
  });

  it('returns null when the `.check(...)` call itself sits in factory position', () => {
    // Not reachable from a real chain — `.check()` always follows a factory —
    // but it pins the null-propagation contract of the chain-removal helper.
    const checkNode = makeNodeWithRange(0, 20);
    const methods = [{ name: 'check', node: checkNode }];
    const { fixer } = makeFixer();

    const fixes = buildZodConstraintsRemoveFix({
      fixer,
      methods,
      constraints: [
        makeCheckArgument({ chainIndex: 0, checkNode, argumentIndex: 0, argumentCount: 1 }),
      ],
    });

    expect(fixes).toBeNull();
  });
});
