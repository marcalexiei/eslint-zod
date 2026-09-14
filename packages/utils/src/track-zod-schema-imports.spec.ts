import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { describe, expect, it } from 'vitest';

import { zodImportScope, zodMiniImportScope } from './zod-import-scope.js';

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

function mockImportDecl(
  source: string,
  specifiers: Array<TSESTree.ImportClause>,
): TSESTree.ImportDeclaration {
  return {
    type: AST_NODE_TYPES.ImportDeclaration,
    source: { value: source } as TSESTree.StringLiteral,
    specifiers,
  } as unknown as TSESTree.ImportDeclaration;
}

function mockNamespaceSpec(localName: string): TSESTree.ImportNamespaceSpecifier {
  return {
    type: AST_NODE_TYPES.ImportNamespaceSpecifier,
    local: makeIdent(localName),
  } as unknown as TSESTree.ImportNamespaceSpecifier;
}

function mockDefaultSpec(localName: string): TSESTree.ImportDefaultSpecifier {
  return {
    type: AST_NODE_TYPES.ImportDefaultSpecifier,
    local: makeIdent(localName),
  } as unknown as TSESTree.ImportDefaultSpecifier;
}

function mockNamedSpec(localName: string, originalName?: string): TSESTree.ImportSpecifier {
  return {
    type: AST_NODE_TYPES.ImportSpecifier,
    local: makeIdent(localName),
    imported: makeIdent(originalName ?? localName),
  } as unknown as TSESTree.ImportSpecifier;
}

function mockTypeNamedSpec(localName: string): TSESTree.ImportSpecifier {
  return {
    type: AST_NODE_TYPES.ImportSpecifier,
    local: makeIdent(localName),
    imported: makeIdent(localName),
    importKind: 'type',
  } as unknown as TSESTree.ImportSpecifier;
}

/** `import { 'string' as s } from 'zod'` — an arbitrary module namespace name. */
function mockStringLiteralNamedSpec(
  localName: string,
  importedValue: string,
): TSESTree.ImportSpecifier {
  return {
    type: AST_NODE_TYPES.ImportSpecifier,
    local: makeIdent(localName),
    imported: { type: AST_NODE_TYPES.Literal, value: importedValue },
  } as unknown as TSESTree.ImportSpecifier;
}

// --- tests ---

describe('createTracker', () => {
  it('each createTracker() call returns an independent instance', () => {
    const a = zodImportScope.createTracker({ kind: 'value' });
    const b = zodImportScope.createTracker({ kind: 'value' });

    a.importDeclarationListener(mockImportDecl('zod', [mockNamespaceSpec('z')]));

    expect(a.isZodNamespace('z')).toBe(true);
    expect(b.isZodNamespace('z')).toBe(false);
  });
});

describe('importDeclarationListener', () => {
  it('tracks namespace import (import * as z)', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(mockImportDecl('zod', [mockNamespaceSpec('z')]));
    expect(tracker.isZodNamespace('z')).toBe(true);
  });

  it('tracks default import (import z from "zod")', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(mockImportDecl('zod', [mockDefaultSpec('z')]));
    expect(tracker.isZodNamespace('z')).toBe(true);
  });

  it('treats named import of z as a namespace (import { z } from "zod")', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(mockImportDecl('zod', [mockNamedSpec('z', 'z')]));
    expect(tracker.isZodNamespace('z')).toBe(true);
  });

  it('tracks named import (import { string } from "zod")', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(mockImportDecl('zod', [mockNamedSpec('string')]));
    expect(tracker.getNamedImportOriginal('string')).toBe('string');
    expect(tracker.getNamedImportLocal('string')).toBe('string');
  });

  it('tracks aliased named import (import { string as zodString })', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(
      mockImportDecl('zod', [mockNamedSpec('zodString', 'string')]),
    );
    expect(tracker.getNamedImportOriginal('zodString')).toBe('string');
    expect(tracker.getNamedImportLocal('string')).toBe('zodString');
  });

  it('falls back to the local name for a string-literal import name', () => {
    // `import { 'string' as s } from 'zod'` — the imported name is a StringLiteral,
    // which carries no `name`, so the local name is used.
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(
      mockImportDecl('zod', [mockStringLiteralNamedSpec('s', 'string')]),
    );
    expect(tracker.getNamedImportOriginal('s')).toBe('s');
  });

  it('ignores imports from non-zod sources', () => {
    const tracker = zodMiniImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(mockImportDecl('lodash', [mockNamespaceSpec('_')]));
    expect(tracker.isZodNamespace('_')).toBe(false);
  });

  it('respects allowedSource boundary (zod-mini tracker ignores zod imports)', () => {
    const tracker = zodMiniImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(mockImportDecl('zod', [mockNamespaceSpec('z')]));
    expect(tracker.isZodNamespace('z')).toBe(false);
  });

  it('tracks zod-mini namespace import when allowedSource is zod-mini', () => {
    const tracker = zodMiniImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(mockImportDecl('zod/mini', [mockNamespaceSpec('z')]));
    expect(tracker.isZodNamespace('z')).toBe(true);
  });
});

describe('collectZodChainMethods', () => {
  it('collects namespace chain: z.number().min(1)', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });

    const zIdent = makeIdent('z');
    const numberCall = makeCall(makeME(zIdent, 'number'));
    const minCall = makeCall(makeME(numberCall, 'min'), [
      { type: AST_NODE_TYPES.Literal, value: 1 } as unknown as TSESTree.Literal,
    ]);

    const methods = tracker.collectZodChainMethods(minCall);

    expect(methods.map((m) => m.name)).toStrictEqual(['number', 'min']);
    expect(methods[0]?.node).toBe(numberCall);
    expect(methods[1]?.node).toBe(minCall);
  });

  it('collects single named import: string()', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });

    const stringCall = makeCall(makeIdent('string'));
    const methods = tracker.collectZodChainMethods(stringCall);

    expect(methods.map((m) => m.name)).toStrictEqual(['string']);
    expect(methods[0]?.node).toBe(stringCall);
  });

  it('collects named import chain: string().optional()', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });

    const stringCall = makeCall(makeIdent('string'));
    const optCall = makeCall(makeME(stringCall, 'optional'));
    const methods = tracker.collectZodChainMethods(optCall);

    expect(methods.map((m) => m.name)).toStrictEqual(['string', 'optional']);
  });

  describe('unwalkable chains return nothing rather than a partial chain', () => {
    /** `z['string']` — detection resolves the literal key, the walker cannot. */
    function makeComputedME(
      object: TSESTree.Expression,
      propertyName: string,
    ): TSESTree.MemberExpression {
      return {
        type: AST_NODE_TYPES.MemberExpression,
        object,
        property: {
          type: AST_NODE_TYPES.Literal,
          value: propertyName,
        } as unknown as TSESTree.Literal,
        computed: true,
      } as unknown as TSESTree.MemberExpression;
    }

    it("returns [] for a computed factory: z['string']()", () => {
      const tracker = zodImportScope.createTracker({ kind: 'value' });

      const computedCall = makeCall(makeComputedME(makeIdent('z'), 'string'));

      expect(tracker.collectZodChainMethods(computedCall)).toStrictEqual([]);
    });

    it("drops the whole chain, not just the factory: z['string']().transform(f).readonly()", () => {
      const tracker = zodImportScope.createTracker({ kind: 'value' });

      const computedCall = makeCall(makeComputedME(makeIdent('z'), 'string'));
      const transformCall = makeCall(makeME(computedCall, 'transform'));
      const readonlyCall = makeCall(makeME(transformCall, 'readonly'));

      // A partial `['transform', 'readonly']` would no longer start at the factory,
      // silently misaligning every index-based lookup.
      expect(tracker.collectZodChainMethods(readonlyCall)).toStrictEqual([]);
    });

    it('returns [] for a computed member mid-chain: z.string()["min"](1)', () => {
      const tracker = zodImportScope.createTracker({ kind: 'value' });

      const stringCall = makeCall(makeME(makeIdent('z'), 'string'));
      const minCall = makeCall(makeComputedME(stringCall, 'min'));

      expect(tracker.collectZodChainMethods(minCall)).toStrictEqual([]);
    });

    it('returns [] for a computed member with a variable key: z[factory]()', () => {
      const tracker = zodImportScope.createTracker({ kind: 'value' });

      const dynamicCall = makeCall({
        type: AST_NODE_TYPES.MemberExpression,
        object: makeIdent('z'),
        property: makeIdent('factory'),
        computed: true,
      } as unknown as TSESTree.MemberExpression);

      expect(tracker.collectZodChainMethods(dynamicCall)).toStrictEqual([]);
    });
  });
});

describe('createSchemaVisitor', () => {
  /** `z.<factory>()` as an outermost call, ready to feed to the visitor. */
  function makeSchemaCall(factory: string): TSESTree.CallExpression {
    const call = makeCall(makeME(makeIdent('z'), factory));
    (call as unknown as Record<string, unknown>).parent = {
      type: AST_NODE_TYPES.ExpressionStatement,
    };
    return call;
  }

  /** Runs `visitor` over an `import * as z from 'zod'` plus the given calls. */
  function visit(
    visitor: ReturnType<ReturnType<typeof zodImportScope.createTracker>['createSchemaVisitor']>,
    calls: Array<TSESTree.CallExpression>,
  ): void {
    visitor.ImportDeclaration?.(mockImportDecl('zod', [mockNamespaceSpec('z')]));
    for (const call of calls) {
      visitor.CallExpression?.(call);
    }
  }

  it('wires the import listener itself, so detection works without extra setup', () => {
    const seen: Array<string> = [];
    const visitor = zodImportScope.createTracker({ kind: 'value' }).createSchemaVisitor({
      onSchema: (_node, meta) => {
        seen.push(meta.schemaType);
      },
    });

    visit(visitor, [makeSchemaCall('string'), makeSchemaCall('number')]);

    expect(seen).toStrictEqual(['string', 'number']);
  });

  it('filters on a single schemaType', () => {
    const seen: Array<TSESTree.CallExpression> = [];
    const visitor = zodImportScope.createTracker({ kind: 'value' }).createSchemaVisitor({
      schemaType: 'string',
      onSchema: (node) => {
        seen.push(node);
      },
    });

    const stringCall = makeSchemaCall('string');
    visit(visitor, [stringCall, makeSchemaCall('number')]);

    expect(seen).toStrictEqual([stringCall]);
  });

  it('filters on a list of schemaTypes', () => {
    const seen: Array<string> = [];
    const visitor = zodImportScope.createTracker({ kind: 'value' }).createSchemaVisitor({
      schemaType: ['string', 'number'],
      onSchema: (_node, meta) => {
        seen.push(meta.schemaType);
      },
    });

    visit(visitor, [makeSchemaCall('string'), makeSchemaCall('boolean'), makeSchemaCall('number')]);

    expect(seen).toStrictEqual(['string', 'number']);
  });

  it('ignores calls that are not zod schemas', () => {
    const seen: Array<string> = [];
    const visitor = zodImportScope.createTracker({ kind: 'value' }).createSchemaVisitor({
      onSchema: (_node, meta) => {
        seen.push(meta.schemaType);
      },
    });

    const notZod = makeCall(makeME(makeIdent('lodash'), 'map'));
    (notZod as unknown as Record<string, unknown>).parent = {
      type: AST_NODE_TYPES.ExpressionStatement,
    };
    visit(visitor, [notZod]);

    expect(seen).toStrictEqual([]);
  });

  it('respects the tracker scope: a zod/mini tracker ignores `zod` imports', () => {
    const seen: Array<string> = [];
    const visitor = zodMiniImportScope.createTracker({ kind: 'value' }).createSchemaVisitor({
      onSchema: (_node, meta) => {
        seen.push(meta.schemaType);
      },
    });

    visit(visitor, [makeSchemaCall('string')]);

    expect(seen).toStrictEqual([]);
  });
});

describe('getZodImportBindings', () => {
  it('records each specifier with the declaration it came from', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    const declaration = mockImportDecl('zod', [
      mockNamespaceSpec('z'),
      mockNamedSpec('str', 'string'),
    ]);
    tracker.importDeclarationListener(declaration);

    expect(
      tracker.getZodImportBindings().map(({ name, local }) => [name, local.name]),
    ).toStrictEqual([
      ['*', 'z'],
      ['string', 'str'],
    ]);
    expect(tracker.getZodImportBindings().every((b) => b.declaration === declaration)).toBe(true);
  });

  it('records a named z import as a namespace binding', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(mockImportDecl('zod', [mockNamedSpec('z', 'z')]));
    expect(tracker.getZodImportBindings().map((b) => b.name)).toStrictEqual(['*']);
  });

  it('ignores sources outside the scope', () => {
    const tracker = zodMiniImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(mockImportDecl('zod', [mockNamespaceSpec('z')]));
    expect(tracker.getZodImportBindings()).toStrictEqual([]);
  });
});

describe('createTracker kind', () => {
  function typeDecl(specifiers: Array<TSESTree.ImportClause>): TSESTree.ImportDeclaration {
    const declaration = mockImportDecl('zod', specifiers);
    (declaration as { importKind?: string }).importKind = 'type';
    return declaration;
  }

  it('records value imports by default', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(mockImportDecl('zod', [mockNamedSpec('string')]));
    expect(tracker.getNamedImportOriginal('string')).toBe('string');
  });

  it('skips a type-only declaration by default', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(typeDecl([mockNamedSpec('output')]));

    expect(tracker.getZodImportBindings()).toStrictEqual([]);
    expect(tracker.getNamedImportOriginal('output')).toBeUndefined();
  });

  it('skips a type-only specifier but keeps its value siblings', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    tracker.importDeclarationListener(
      mockImportDecl('zod', [mockTypeNamedSpec('output'), mockNamedSpec('string')]),
    );

    expect(tracker.getZodImportBindings().map((b) => b.name)).toStrictEqual(['string']);
    expect(tracker.getNamedImportOriginal('output')).toBeUndefined();
  });

  it("kind 'type' is the exact mirror", () => {
    const tracker = zodImportScope.createTracker({ kind: 'type' });
    tracker.importDeclarationListener(
      mockImportDecl('zod', [mockTypeNamedSpec('output'), mockNamedSpec('string')]),
    );
    tracker.importDeclarationListener(typeDecl([mockNamedSpec('infer')]));
    tracker.importDeclarationListener(mockImportDecl('zod', [mockNamespaceSpec('z')]));

    expect(tracker.getZodImportBindings().map((b) => b.name)).toStrictEqual(['output', 'infer']);
    expect(tracker.isZodNamespace('z')).toBe(false);
  });

  it("kind 'all' records both, for rules reading a type position", () => {
    const tracker = zodImportScope.createTracker({ kind: 'all' });
    tracker.importDeclarationListener(
      mockImportDecl('zod', [mockTypeNamedSpec('output'), mockNamedSpec('string')]),
    );
    tracker.importDeclarationListener(typeDecl([mockNamedSpec('infer')]));
    tracker.importDeclarationListener(mockImportDecl('zod', [mockNamespaceSpec('z')]));

    expect(tracker.getZodImportBindings().map((b) => b.name)).toStrictEqual([
      'output',
      'string',
      'infer',
      '*',
    ]);
    expect(tracker.isZodNamespace('z')).toBe(true);
  });
});

describe('resolveZodImport', () => {
  it('throws when the tracker was built without a sourceCode', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    expect(() => tracker.resolveZodImport(makeIdent('z'))).toThrow(/sourceCode/);
  });

  it('returns null for a node that cannot name an import', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    expect(tracker.resolveZodImport(makeCall(makeIdent('z')))).toBeNull();
    expect(tracker.resolveZodExport(makeCall(makeIdent('z')))).toBeNull();
  });
});
