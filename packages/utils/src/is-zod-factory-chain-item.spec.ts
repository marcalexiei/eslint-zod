import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { isZodFactoryChainItem } from './is-zod-factory-chain-item.js';
import type { ZodChainMember } from './track-zod-schema-imports.js';

const identifier = { type: AST_NODE_TYPES.Identifier };
const call = { type: AST_NODE_TYPES.CallExpression };

function memberOf(object: object): ZodChainMember {
  return { type: AST_NODE_TYPES.MemberExpression, object } as ZodChainMember;
}

describe('isZodFactoryChainItem', () => {
  it('is true for a bare named import: string()', () => {
    expect(isZodFactoryChainItem({ member: null })).toBe(true);
  });

  it('is true for a member of the namespace: z.string()', () => {
    expect(isZodFactoryChainItem({ member: memberOf(identifier) })).toBe(true);
  });

  it('is true for a member of a sub-namespace: z.coerce.boolean()', () => {
    expect(isZodFactoryChainItem({ member: memberOf(memberOf(identifier)) })).toBe(true);
  });

  it('is false for a method called on a schema: z.string().min(1)', () => {
    expect(isZodFactoryChainItem({ member: memberOf(call) })).toBe(false);
  });

  it('is false after a property access: z.object({ a: z.string() }).shape.a.optional()', () => {
    expect(isZodFactoryChainItem({ member: memberOf(memberOf(memberOf(call))) })).toBe(false);
  });
});
