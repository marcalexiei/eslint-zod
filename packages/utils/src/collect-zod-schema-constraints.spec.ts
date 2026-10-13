import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { collectZodSchemaConstraints } from './collect-zod-schema-constraints.js';
import type { ZodSchemaMeta } from './detect-zod-schema-root-node.js';
import type { ZodChainMember } from './track-zod-schema-imports.js';

// --- minimal AST mock helpers ---

function makeIdent(name: string): TSESTree.Identifier {
  return {
    type: AST_NODE_TYPES.Identifier,
    name,
  } as unknown as TSESTree.Identifier;
}

function makeCall(
  calleeName: string,
  args: Array<TSESTree.CallExpressionArgument> = [],
): TSESTree.CallExpression {
  return {
    type: AST_NODE_TYPES.CallExpression,
    callee: makeIdent(calleeName),
    arguments: args,
  } as unknown as TSESTree.CallExpression;
}

/**
 * Fake detector: recognizes every mock call whose callee name starts with a
 * lowercase letter except the ones listed in `unknownNames`, mirroring how the
 * real detector only recognizes imported zod names.
 */
function makeDetector(
  unknownNames: Array<string> = [],
): (node: TSESTree.Node) => ZodSchemaMeta | null {
  return (node) => {
    if (node.type !== AST_NODE_TYPES.CallExpression) {
      return null;
    }
    const { callee } = node;
    if (callee.type !== AST_NODE_TYPES.Identifier || unknownNames.includes(callee.name)) {
      return null;
    }
    return {
      schemaDecl: 'namespace',
      schemaType: callee.name,
      methods: [callee.name],
      node,
    };
  };
}

function makeChainItem(
  name: string,
  args: Array<TSESTree.CallExpressionArgument> = [],
): { name: string; node: TSESTree.CallExpression } {
  return { name, node: makeCall(name, args) };
}

// --- tests ---

describe('collectZodSchemaConstraints', () => {
  it('returns an empty list for a bare factory call', () => {
    const methods = [makeChainItem('string')];

    const constraints = collectZodSchemaConstraints({
      methods,
      detectZodSchemaRootNode: makeDetector(),
    });

    expect(constraints).toStrictEqual([]);
  });

  it('collects chained methods after the factory as chained constraints', () => {
    // z.string().min(2).max(5)
    const methods = [makeChainItem('string'), makeChainItem('min'), makeChainItem('max')];

    const constraints = collectZodSchemaConstraints({
      methods,
      detectZodSchemaRootNode: makeDetector(),
    });

    expect(constraints).toStrictEqual([
      { name: 'min', node: methods[1].node, origin: 'chained', chainIndex: 1 },
      { name: 'max', node: methods[2].node, origin: 'chained', chainIndex: 2 },
    ]);
  });

  it('keeps the first call of a chain resumed after a property access', () => {
    // z.object({ a: z.string() }).shape.a.trim().min(2) — the walk starts at `.trim()`
    const afterProperty = {
      object: {
        type: AST_NODE_TYPES.MemberExpression,
        object: { type: AST_NODE_TYPES.CallExpression },
      },
    } as unknown as ZodChainMember;
    const methods = [{ ...makeChainItem('trim'), member: afterProperty }, makeChainItem('min')];

    const constraints = collectZodSchemaConstraints({
      methods,
      detectZodSchemaRootNode: makeDetector(),
    });

    expect(constraints.map((constraint) => [constraint.name, constraint.chainIndex])).toStrictEqual(
      [
        ['trim', 0],
        ['min', 1],
      ],
    );
  });

  it('expands `.check(...)` arguments into check-argument constraints', () => {
    // z.string().check(z.minLength(2), z.maxLength(5))
    const minLength = makeCall('minLength');
    const maxLength = makeCall('maxLength');
    const methods = [makeChainItem('string'), makeChainItem('check', [minLength, maxLength])];

    const constraints = collectZodSchemaConstraints({
      methods,
      detectZodSchemaRootNode: makeDetector(),
    });

    expect(constraints).toStrictEqual([
      {
        name: 'minLength',
        node: minLength,
        origin: 'check-argument',
        chainIndex: 1,
        checkNode: methods[1].node,
        argumentIndex: 0,
        argumentCount: 2,
      },
      {
        name: 'maxLength',
        node: maxLength,
        origin: 'check-argument',
        chainIndex: 1,
        checkNode: methods[1].node,
        argumentIndex: 1,
        argumentCount: 2,
      },
    ]);
  });

  it('expands `.with(...)` arguments like `.check(...)`', () => {
    // z.string().with(z.minLength(2))
    const minLength = makeCall('minLength');
    const methods = [makeChainItem('string'), makeChainItem('with', [minLength])];

    const constraints = collectZodSchemaConstraints({
      methods,
      detectZodSchemaRootNode: makeDetector(),
    });

    expect(constraints.map((c) => [c.name, c.origin])).toStrictEqual([
      ['minLength', 'check-argument'],
    ]);
  });

  it('handles multiple `.check(...)` calls and chained constraints in one chain', () => {
    // Abstract chain exercising both origins at once. NOTE: real code never
    // mixes API styles (chained = zod, `.check(...)` = zod/mini); the
    // collector just makes no assumption either way.
    const maxLength = makeCall('maxLength');
    const length = makeCall('length');
    const methods = [
      makeChainItem('array'),
      makeChainItem('min'),
      makeChainItem('check', [maxLength]),
      makeChainItem('check', [length]),
    ];

    const constraints = collectZodSchemaConstraints({
      methods,
      detectZodSchemaRootNode: makeDetector(),
    });

    expect(constraints).toHaveLength(3);
    expect(constraints[0]).toMatchObject({ name: 'min', origin: 'chained', chainIndex: 1 });
    expect(constraints[1]).toMatchObject({
      name: 'maxLength',
      origin: 'check-argument',
      chainIndex: 2,
      argumentCount: 1,
    });
    expect(constraints[2]).toMatchObject({
      name: 'length',
      origin: 'check-argument',
      chainIndex: 3,
      argumentCount: 1,
    });
  });

  it('skips unrecognized `.check(...)` arguments but counts them in argumentCount', () => {
    // z.string().check(someCustomCheck(), z.minLength(2), identifierArg)
    const custom = makeCall('someCustomCheck');
    const minLength = makeCall('minLength');
    const identifierArg = makeIdent('identifierArg');
    const methods = [
      makeChainItem('string'),
      makeChainItem('check', [custom, minLength, identifierArg]),
    ];

    const constraints = collectZodSchemaConstraints({
      methods,
      detectZodSchemaRootNode: makeDetector(['someCustomCheck']),
    });

    expect(constraints).toStrictEqual([
      {
        name: 'minLength',
        node: minLength,
        origin: 'check-argument',
        chainIndex: 1,
        checkNode: methods[1].node,
        argumentIndex: 1,
        argumentCount: 3,
      },
    ]);
  });

  it('does not report the `.check(...)` call itself as a chained constraint', () => {
    const methods = [makeChainItem('string'), makeChainItem('check', [])];

    const constraints = collectZodSchemaConstraints({
      methods,
      detectZodSchemaRootNode: makeDetector(),
    });

    expect(constraints).toStrictEqual([]);
  });
});
