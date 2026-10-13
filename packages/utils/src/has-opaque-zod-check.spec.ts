import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import type { ZodSchemaConstraint } from './collect-zod-schema-constraints.js';
import { hasOpaqueZodCheck } from './has-opaque-zod-check.js';

function method(name: string, argumentCount = 1): { name: string; node: TSESTree.CallExpression } {
  return {
    name,
    node: { arguments: Array.from({ length: argumentCount }) } as TSESTree.CallExpression,
  };
}

function constraint(name: string, chainIndex: number): ZodSchemaConstraint {
  return { name, chainIndex } as ZodSchemaConstraint;
}

describe('hasOpaqueZodCheck', () => {
  it('is false when every check argument is a recognized zod call', () => {
    // z.string().check(z.minLength(3), z.maxLength(3))
    const constraints = [constraint('minLength', 1), constraint('maxLength', 1)];
    const methods = [method('string', 0), method('check', 2)];

    expect(hasOpaqueZodCheck({ methods, constraints, fromChainIndex: 1, toChainIndex: 1 })).toBe(
      false,
    );
  });

  it('is true when a check argument is not a zod call: .check(z.minLength(3), trimIt)', () => {
    const constraints = [constraint('minLength', 1)];
    const methods = [method('string', 0), method('check', 2)];

    expect(hasOpaqueZodCheck({ methods, constraints, fromChainIndex: 1, toChainIndex: 1 })).toBe(
      true,
    );
  });

  it('is true for a callback check: .check(z.minLength(3), z.check(fn))', () => {
    const constraints = [constraint('minLength', 1), constraint('check', 1)];
    const methods = [method('string', 0), method('check', 2)];

    expect(hasOpaqueZodCheck({ methods, constraints, fromChainIndex: 1, toChainIndex: 1 })).toBe(
      true,
    );
  });

  it('ignores a check outside the range', () => {
    // z.string().min(3).max(3).check(fn)
    const constraints = [constraint('min', 1), constraint('max', 2)];
    const methods = [method('string', 0), method('min'), method('max'), method('check')];

    expect(hasOpaqueZodCheck({ methods, constraints, fromChainIndex: 1, toChainIndex: 2 })).toBe(
      false,
    );
  });
});
