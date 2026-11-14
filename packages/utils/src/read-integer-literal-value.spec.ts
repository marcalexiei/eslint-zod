import { parseCode } from '@eslint-zod/tooling/vitest/parse-code';
import { describe, expect, it } from 'vitest';

import { readIntegerLiteralValue } from './read-integer-literal-value.js';

const read = (code: string): number | null =>
  readIntegerLiteralValue(parseCode(code).find('ExpressionStatement > *'));

describe('readIntegerLiteralValue', () => {
  it.each([
    ['3', 3],
    ['0', 0],
    ['-1', null],
    ['1.5', null],
    ["'3'", null],
    ['n', null],
  ])('reads %s as %s', (code, expected) => {
    expect(read(code)).toBe(expected);
  });

  it('returns null for a missing node', () => {
    expect(readIntegerLiteralValue(null)).toBeNull();
  });
});
