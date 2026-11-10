import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { getBindingInitializer } from './get-binding-initializer.js';
import type { ScopeDefinition, ScopeReference, ScopeVariable } from './rule-types.js';

const init = { type: AST_NODE_TYPES.Literal, value: 1 } as unknown as TSESTree.Expression;

function reference(write: { init?: boolean } | null): ScopeReference {
  return {
    identifier: { type: AST_NODE_TYPES.Identifier, name: 'value' } as TSESTree.Identifier,
    init: write?.init,
    isRead: () => !write,
    isWrite: () => Boolean(write),
  };
}

function variable({
  type = 'Variable',
  id = AST_NODE_TYPES.Identifier,
  defs = 1,
  references = [reference({ init: true }), reference(null)],
}: {
  type?: 'Variable' | 'Parameter';
  id?: AST_NODE_TYPES.Identifier | AST_NODE_TYPES.ObjectPattern;
  defs?: number;
  references?: Array<ScopeReference>;
} = {}): ScopeVariable {
  const definition = { type, node: { id: { type: id }, init } } as unknown as ScopeDefinition;
  return { name: 'value', defs: Array.from({ length: defs }, () => definition), references };
}

describe('getBindingInitializer', () => {
  it('returns the initializer of a binding that is never reassigned', () => {
    expect(getBindingInitializer(variable())).toBe(init);
  });

  it('is null for a reassigned, re-declared, destructured or non-variable binding', () => {
    const reassigned = variable({ references: [reference({ init: true }), reference({})] });
    expect(getBindingInitializer(reassigned)).toBeNull();
    expect(getBindingInitializer(variable({ defs: 2 }))).toBeNull();
    expect(getBindingInitializer(variable({ id: AST_NODE_TYPES.ObjectPattern }))).toBeNull();
    expect(getBindingInitializer(variable({ type: 'Parameter' }))).toBeNull();
    expect(getBindingInitializer(null)).toBeNull();
  });
});
