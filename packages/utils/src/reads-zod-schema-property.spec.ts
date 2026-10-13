import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import type { ZodSchemaMeta } from './detect-zod-schema-root-node.js';
import { readsZodSchemaProperty } from './reads-zod-schema-property.js';

function meta(methods: Array<string>): ZodSchemaMeta {
  return { schemaDecl: 'namespace', schemaType: methods[0], methods };
}

/** A call whose parent is a member expression reading a property from it. */
function callWithPropertyRead(): TSESTree.CallExpression {
  const node = { type: AST_NODE_TYPES.CallExpression } as TSESTree.CallExpression;
  node.parent = { type: AST_NODE_TYPES.MemberExpression, object: node } as TSESTree.Node;
  return node;
}

describe('readsZodSchemaProperty', () => {
  it('is true for a property read from a schema: z.array(x).length(2).element', () => {
    expect(readsZodSchemaProperty(callWithPropertyRead(), meta(['array', 'length']))).toBe(true);
  });

  it('is false for a property read from a parse result: z.string().safeParse(x).success', () => {
    expect(readsZodSchemaProperty(callWithPropertyRead(), meta(['string', 'safeParse']))).toBe(
      false,
    );
  });

  it('is false when nothing is read from the call', () => {
    const node = { type: AST_NODE_TYPES.CallExpression } as TSESTree.CallExpression;
    node.parent = { type: AST_NODE_TYPES.ExpressionStatement } as TSESTree.Node;
    expect(readsZodSchemaProperty(node, meta(['array', 'length']))).toBe(false);
  });

  it('is true for a bare named-import factory: string().def', () => {
    const named: ZodSchemaMeta = { schemaDecl: 'named', schemaType: 'string', methods: [] };
    expect(readsZodSchemaProperty(callWithPropertyRead(), named)).toBe(true);
  });
});
