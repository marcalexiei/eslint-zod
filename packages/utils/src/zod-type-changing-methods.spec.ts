import { describe, expect, it } from 'vitest';

import { ZOD_TYPE_CHANGING_METHODS } from './zod-type-changing-methods.js';

describe('ZOD_TYPE_CHANGING_METHODS', () => {
  it('is frozen', () => {
    expect(Object.isFrozen(ZOD_TYPE_CHANGING_METHODS)).toBe(true);
  });

  it('lists the chained methods that rebuild the schema around another type', () => {
    expect(ZOD_TYPE_CHANGING_METHODS).toStrictEqual([
      'and',
      'array',
      'or',
      'pipe',
      'preprocess',
      'transform',
    ]);
  });
});
