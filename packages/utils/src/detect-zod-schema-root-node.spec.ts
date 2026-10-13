import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { detectZodSchemaRootNode, isZodSchemaOfType } from './detect-zod-schema-root-node.js';
import type { ZodImports } from './detect-zod-schema-root-node.js';

// --- minimal AST mock helpers ---

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
    computed: false,
  } as unknown as TSESTree.MemberExpression;
}

function makeComputedME(
  object: TSESTree.Expression,
  property: TSESTree.Expression,
): TSESTree.MemberExpression {
  return {
    type: AST_NODE_TYPES.MemberExpression,
    object,
    property,
    computed: true,
  } as unknown as TSESTree.MemberExpression;
}

function makeLiteral(value: string | null): TSESTree.Literal {
  return {
    type: AST_NODE_TYPES.Literal,
    value,
  } as unknown as TSESTree.Literal;
}

function makeTemplateLiteral(
  cooked: string,
  expressions: Array<TSESTree.Expression> = [],
): TSESTree.TemplateLiteral {
  return {
    type: AST_NODE_TYPES.TemplateLiteral,
    expressions,
    quasis: [{ type: AST_NODE_TYPES.TemplateElement, value: { cooked, raw: cooked } }],
  } as unknown as TSESTree.TemplateLiteral;
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

/** Sets node.parent to a non-call, non-member parent so it passes isOutermostCallExpression. */
function setOutermostParent(node: TSESTree.CallExpression): void {
  (node as unknown as Record<string, unknown>).parent = {
    type: AST_NODE_TYPES.ExpressionStatement,
  };
}

const namespaces = new Set(['z']);
const named = new Map<string, string>([
  ['string', 'string'],
  ['number', 'number'],
  ['array', 'array'],
]);
const imports: ZodImports = { namespaces, named };

describe('detectZodSchemaRootNode', () => {
  it('returns null for non-CallExpression nodes', () => {
    const node = makeIdent('z') as unknown as TSESTree.Node;
    expect(detectZodSchemaRootNode(node, imports)).toBeNull();
  });

  it('returns null when the call is not the outermost in a chain', () => {
    // z.number() is not outermost because z.number().min(1) chains on top of it
    const numberCall = makeCall(makeME(makeIdent('z'), 'number'));
    const minCall = makeCall(makeME(numberCall, 'min'));
    // numberCall's parent is the MemberExpression z.number().min
    const minME = minCall.callee as TSESTree.MemberExpression;
    (numberCall as unknown as Record<string, unknown>).parent = minME;
    (minME as unknown as Record<string, unknown>).parent = minCall;

    expect(detectZodSchemaRootNode(numberCall, imports)).toBeNull();
  });

  it('detects a call followed only by a property access: z.string().shape', () => {
    const stringCall = makeCall(makeME(makeIdent('z'), 'string'));
    const shapeME = makeME(stringCall, 'shape');
    (stringCall as unknown as Record<string, unknown>).parent = shapeME;
    (shapeME as unknown as Record<string, unknown>).parent = { type: 'ExpressionStatement' };

    expect(detectZodSchemaRootNode(stringCall, imports)?.schemaType).toBe('string');
  });

  it('returns null for calls not in namespaces or named imports', () => {
    const call = makeCall(makeME(makeIdent('notZod'), 'string'));
    setOutermostParent(call);
    expect(detectZodSchemaRootNode(call, imports)).toBeNull();
  });

  it('detects namespace style: z.string()', () => {
    const call = makeCall(makeME(makeIdent('z'), 'string'));
    setOutermostParent(call);

    const result = detectZodSchemaRootNode(call, imports);

    expect(result).not.toBeNull();
    expect(result?.schemaDecl).toBe('namespace');
    expect(result?.schemaType).toBe('string');
    expect(result?.methods).toStrictEqual(['string']);
  });

  it('detects namespace style with chain: z.number().min(1)', () => {
    const numberCall = makeCall(makeME(makeIdent('z'), 'number'));
    const minCall = makeCall(makeME(numberCall, 'min'), [
      { type: AST_NODE_TYPES.Literal, value: 1 } as unknown as TSESTree.Literal,
    ]);
    setOutermostParent(minCall);

    const result = detectZodSchemaRootNode(minCall, imports);

    expect(result?.schemaDecl).toBe('namespace');
    expect(result?.schemaType).toBe('number');
    expect(result?.methods).toStrictEqual(['number', 'min']);
  });

  it('detects named import style: string()', () => {
    const call = makeCall(makeIdent('string'));
    setOutermostParent(call);

    const result = detectZodSchemaRootNode(call, imports);

    expect(result?.schemaDecl).toBe('named');
    expect(result?.schemaType).toBe('string');
    expect(result?.methods).toStrictEqual([]);
  });

  it('detects named import chain: string().optional()', () => {
    const stringCall = makeCall(makeIdent('string'));
    const optCall = makeCall(makeME(stringCall, 'optional'));
    setOutermostParent(optCall);

    const result = detectZodSchemaRootNode(optCall, imports);

    expect(result?.schemaDecl).toBe('named');
    expect(result?.schemaType).toBe('string');
    expect(result?.methods).toStrictEqual(['optional']);
  });

  it('resolves aliased named import to original name: nativeEnum as zodNativeEnum', () => {
    const aliased: ZodImports = { namespaces, named: new Map([['zodNativeEnum', 'nativeEnum']]) };
    const call = makeCall(makeIdent('zodNativeEnum'));
    setOutermostParent(call);

    const result = detectZodSchemaRootNode(call, aliased);

    expect(result?.schemaDecl).toBe('named');
    expect(result?.schemaType).toBe('nativeEnum');
    expect(result?.methods).toStrictEqual([]);
  });

  it('returns null when the call is the callee of another call: z.custom()()', () => {
    const customCall = makeCall(makeME(makeIdent('z'), 'custom'));
    const outerCall = makeCall(customCall);
    (customCall as unknown as Record<string, unknown>).parent = outerCall;

    expect(detectZodSchemaRootNode(customCall, imports)).toBeNull();
  });

  describe('computed property access', () => {
    it("resolves a string literal property: z['string']()", () => {
      const call = makeCall(makeComputedME(makeIdent('z'), makeLiteral('string')));
      setOutermostParent(call);

      const result = detectZodSchemaRootNode(call, imports);

      expect(result?.schemaDecl).toBe('namespace');
      expect(result?.schemaType).toBe('string');
    });

    it('resolves a simple template literal property: z[`string`]()', () => {
      const call = makeCall(makeComputedME(makeIdent('z'), makeTemplateLiteral('string')));
      setOutermostParent(call);

      const result = detectZodSchemaRootNode(call, imports);

      expect(result?.schemaDecl).toBe('namespace');
      expect(result?.schemaType).toBe('string');
    });

    it('returns null for a template literal with interpolations', () => {
      const call = makeCall(
        makeComputedME(makeIdent('z'), makeTemplateLiteral('str', [makeIdent('x')])),
      );
      setOutermostParent(call);

      expect(detectZodSchemaRootNode(call, imports)).toBeNull();
    });

    it('returns null for a null literal property: z[null]()', () => {
      const call = makeCall(makeComputedME(makeIdent('z'), makeLiteral(null)));
      setOutermostParent(call);

      expect(detectZodSchemaRootNode(call, imports)).toBeNull();
    });

    it('returns null for a non-static property: z[a + b]()', () => {
      const binary = {
        type: AST_NODE_TYPES.BinaryExpression,
        operator: '+',
        left: makeIdent('a'),
        right: makeIdent('b'),
      } as unknown as TSESTree.Expression;
      const call = makeCall(makeComputedME(makeIdent('z'), binary));
      setOutermostParent(call);

      expect(detectZodSchemaRootNode(call, imports)).toBeNull();
    });

    it('returns null when the leftmost node is not an identifier: (a + b).string()', () => {
      const binary = {
        type: AST_NODE_TYPES.BinaryExpression,
        operator: '+',
        left: makeIdent('a'),
        right: makeIdent('b'),
      } as unknown as TSESTree.Expression;
      const call = makeCall(makeME(binary, 'string'));
      setOutermostParent(call);

      expect(detectZodSchemaRootNode(call, imports)).toBeNull();
    });
  });
});

describe('isZodSchemaOfType', () => {
  it('returns false for non-CallExpression', () => {
    expect(isZodSchemaOfType(makeIdent('z'), 'number', imports)).toBe(false);
  });

  it('returns true for z.number()', () => {
    const call = makeCall(makeME(makeIdent('z'), 'number'));
    expect(isZodSchemaOfType(call, 'number', imports)).toBe(true);
  });

  it('returns true for z.number().min(1) (inner call)', () => {
    const numberCall = makeCall(makeME(makeIdent('z'), 'number'));
    expect(isZodSchemaOfType(numberCall, 'number', imports)).toBe(true);
  });

  it('returns false when the factory is a different schema type', () => {
    const call = makeCall(makeME(makeIdent('z'), 'string'));
    expect(isZodSchemaOfType(call, 'number', imports)).toBe(false);
  });

  it('matches any schema type, not just number', () => {
    const call = makeCall(makeME(makeIdent('z'), 'string'));
    expect(isZodSchemaOfType(call, 'string', imports)).toBe(true);
  });

  it('returns true for named import number()', () => {
    const call = makeCall(makeIdent('number'));
    expect(isZodSchemaOfType(call, 'number', imports)).toBe(true);
  });
});
