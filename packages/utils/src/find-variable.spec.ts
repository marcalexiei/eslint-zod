import { describe, expect, it } from 'vitest';

import { findVariable } from './find-variable.js';
import type { Scope, ScopeVariable } from './rule-types.js';

function variable(name: string): ScopeVariable {
  return { name, defs: [], references: [] };
}

function scope(variables: Array<ScopeVariable>, upper: Scope | null = null): Scope {
  return { set: new Map(variables.map((item) => [item.name, item])), upper };
}

describe('findVariable', () => {
  const outer = variable('outer');
  const shadowedOuter = variable('shared');
  const shadowedInner = variable('shared');
  const inner = scope([shadowedInner], scope([outer, shadowedOuter]));

  it('finds a variable declared in the scope itself', () => {
    expect(findVariable(inner, 'shared')).toBe(shadowedInner);
  });

  it('walks outward to an enclosing scope', () => {
    expect(findVariable(inner, 'outer')).toBe(outer);
  });

  it('is null when nothing declares the name', () => {
    expect(findVariable(inner, 'missing')).toBeNull();
    expect(findVariable(null, 'outer')).toBeNull();
  });
});
