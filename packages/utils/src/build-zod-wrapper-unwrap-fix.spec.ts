import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { buildZodWrapperUnwrapFix } from './build-zod-wrapper-unwrap-fix.js';
import { track } from './spec-helpers.js';

/** The fixed code, or `null` when there is no fix. */
function unwrap(code: string): string | null {
  const { find, applyFix, sourceCode } = track(code);
  const wrapperCall = find<TSESTree.CallExpression>(
    'CallExpression[callee.property.name=/^(readonly|nullable)$/]',
  );
  return applyFix((fixer) => buildZodWrapperUnwrapFix({ fixer, sourceCode, wrapperCall }));
}

describe('buildZodWrapperUnwrapFix', () => {
  it.each([
    ['z.readonly(z.string())', 'z.string()'],
    ['z.readonly(z.string()).check(z.minLength(1))', 'z.string().check(z.minLength(1))'],
    ['z.readonly(schema)', 'schema'],
    ['z.readonly(schemas.name)', 'schemas.name'],
  ])('unwraps %s', (code, expected) => {
    expect(unwrap(code)).toBe(expected);
  });

  it('keeps any expression when the wrapper is itself an argument: z.optional(z.nullable(a ? b : c))', () => {
    expect(unwrap('z.optional(z.nullable(a ? b : c))')).toBe('z.optional(a ? b : c)');
  });

  it.each([
    ['a sequence argument, whose parentheses would be lost', 'z.optional(z.nullable((a, b)))'],
    ['an argument that could need parentheses', 'z.readonly(a ? b : c)'],
    ['a comment before the argument', 'z.readonly(/* c */ z.string())'],
    ['a comment after the argument', 'z.readonly(z.string() /* c */)'],
    ['no arguments', 'z.readonly()'],
    ['more than one argument', 'z.readonly(a, b)'],
    ['a spread argument', 'z.readonly(...args)'],
  ])('returns null for %s: %s', (_, code) => {
    expect(unwrap(code)).toBeNull();
  });
});
