import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it, vi } from 'vitest';

import { findParentSchemaMatchingCondition } from './find-parent-schema-matching-condition.js';

function makeIdent(name: string): TSESTree.Identifier {
  return {
    type: AST_NODE_TYPES.Identifier,
    name,
  } as unknown as TSESTree.Identifier;
}

function makeME(object: TSESTree.Expression, propertyName: string): TSESTree.MemberExpression {
  return {
    type: AST_NODE_TYPES.MemberExpression,
    object,
    property: makeIdent(propertyName),
  } as unknown as TSESTree.MemberExpression;
}

function makeCall(
  callee: TSESTree.Expression,
  args: Array<TSESTree.Expression> = [],
): TSESTree.CallExpression {
  return {
    type: AST_NODE_TYPES.CallExpression,
    callee,
    arguments: args,
  } as unknown as TSESTree.CallExpression;
}

function setParent(node: TSESTree.Node, parent: TSESTree.Node): void {
  (node as unknown as Record<string, unknown>).parent = parent;
}

describe('findParentSchemaMatchingCondition', () => {
  it('returns false when there is no parent', () => {
    const stringCall = makeCall(makeME(makeIdent('z'), 'string'));
    // no parent set → while(current.parent) is falsy
    expect(
      findParentSchemaMatchingCondition(stringCall, {
        schemaName: 'record',
        condition: () => true,
      }),
    ).toBe(false);
  });

  it('returns false when no parent matches schemaName', () => {
    const stringCall = makeCall(makeME(makeIdent('z'), 'string'));
    const arrayCall = makeCall(makeME(makeIdent('z'), 'array'), [stringCall]);
    setParent(stringCall, arrayCall);

    expect(
      findParentSchemaMatchingCondition(stringCall, {
        schemaName: 'record',
        condition: () => true,
      }),
    ).toBe(false);
  });

  it('returns true when parent matches schemaName and condition returns true', () => {
    const stringCall = makeCall(makeME(makeIdent('z'), 'string'));
    const recordCall = makeCall(makeME(makeIdent('z'), 'record'), [stringCall]);
    setParent(stringCall, recordCall);

    expect(
      findParentSchemaMatchingCondition(stringCall, {
        schemaName: 'record',
        condition: () => true,
      }),
    ).toBe(true);
  });

  it('returns false when parent matches schemaName but condition returns false', () => {
    const stringCall = makeCall(makeME(makeIdent('z'), 'string'));
    const recordCall = makeCall(makeME(makeIdent('z'), 'record'), [stringCall]);
    setParent(stringCall, recordCall);

    expect(
      findParentSchemaMatchingCondition(stringCall, {
        schemaName: 'record',
        condition: () => false,
      }),
    ).toBe(false);
  });

  it('passes the matching parent CallExpression to the condition', () => {
    const stringCall = makeCall(makeME(makeIdent('z'), 'string'));
    const recordCall = makeCall(makeME(makeIdent('z'), 'record'), [stringCall]);
    setParent(stringCall, recordCall);

    const condition = vi.fn<(node: TSESTree.CallExpression) => boolean>(() => true);
    findParentSchemaMatchingCondition(stringCall, {
      schemaName: 'record',
      condition,
    });

    expect(condition).toHaveBeenCalledWith(recordCall);
  });

  it('finds the matching call when the start node is already its direct argument', () => {
    // z.record(z.string().optional()) starting from the outermost `.optional()`
    // call, which is the argument of z.record() — no chain to walk up.
    const stringCall = makeCall(makeME(makeIdent('z'), 'string'));
    const optME = makeME(stringCall, 'optional');
    const optCall = makeCall(optME);
    const recordCall = makeCall(makeME(makeIdent('z'), 'record'), [optCall]);

    setParent(stringCall, optME);
    setParent(optCall, recordCall);

    expect(
      findParentSchemaMatchingCondition(optCall, {
        schemaName: 'record',
        condition: () => true,
      }),
    ).toBe(true);
  });

  it('traverses through MemberExpression parents to find the matching call', () => {
    // Same tree as above, but starting from the inner `z.string()` call, whose
    // parent is the `.optional` MemberExpression rather than a call. The walker
    // must step through the member expression to reach z.record().
    const stringCall = makeCall(makeME(makeIdent('z'), 'string'));
    const optME = makeME(stringCall, 'optional');
    const optCall = makeCall(optME);
    const recordCall = makeCall(makeME(makeIdent('z'), 'record'), [optCall]);

    setParent(stringCall, optME);
    setParent(optME, optCall);
    setParent(optCall, recordCall);

    expect(
      findParentSchemaMatchingCondition(stringCall, {
        schemaName: 'record',
        condition: () => true,
      }),
    ).toBe(true);
  });

  it('ignores an ancestor call whose method name is not a plain identifier', () => {
    // z['record'](z.string()) — the computed property is not an Identifier, so
    // the ancestor cannot be matched by name.
    const stringCall = makeCall(makeME(makeIdent('z'), 'string'));
    const computedRecordME = {
      type: AST_NODE_TYPES.MemberExpression,
      object: makeIdent('z'),
      property: { type: AST_NODE_TYPES.Literal, value: 'record' },
      computed: true,
    } as unknown as TSESTree.MemberExpression;
    const recordCall = makeCall(computedRecordME, [stringCall]);
    setParent(stringCall, recordCall);

    expect(
      findParentSchemaMatchingCondition(stringCall, {
        schemaName: 'record',
        condition: () => true,
      }),
    ).toBe(false);
  });
});
