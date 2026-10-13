import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { hasParenthesizedReceiver } from './has-parenthesized-receiver.js';

function member(start: number, objectStart: number): TSESTree.MemberExpression {
  return { range: [start, 20], object: { range: [objectStart, 10] } } as TSESTree.MemberExpression;
}

describe('hasParenthesizedReceiver', () => {
  it('is false when the member starts where its object does: z.string().min', () => {
    expect(hasParenthesizedReceiver(member(0, 0))).toBe(false);
  });

  it('is true when a parenthesis precedes the object: (z.string()).min', () => {
    expect(hasParenthesizedReceiver(member(0, 1))).toBe(true);
  });
});
