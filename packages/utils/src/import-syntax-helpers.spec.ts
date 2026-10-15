import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import {
  bindsWholeModule,
  getImportSyntax,
  getUsageReplacement,
  getUsageText,
} from './import-syntax-helpers.js';

// Internal helpers of the `consistent-import` builder, asserted directly for shapes its fixtures cannot reach.

function makeIdent(name: string, parent?: TSESTree.Node): TSESTree.Identifier {
  return {
    type: AST_NODE_TYPES.Identifier,
    name,
    parent,
  } as unknown as TSESTree.Identifier;
}

function makeNamedSpec(importedName: string, localName = importedName): TSESTree.ImportSpecifier {
  return {
    type: AST_NODE_TYPES.ImportSpecifier,
    local: makeIdent(localName),
    imported: makeIdent(importedName),
  } as unknown as TSESTree.ImportSpecifier;
}

function makeStringLiteralNamedSpec(localName: string): TSESTree.ImportSpecifier {
  return {
    type: AST_NODE_TYPES.ImportSpecifier,
    local: makeIdent(localName),
    imported: { type: AST_NODE_TYPES.Literal, value: localName },
  } as unknown as TSESTree.ImportSpecifier;
}

function makeDefaultSpec(localName: string): TSESTree.ImportDefaultSpecifier {
  return {
    type: AST_NODE_TYPES.ImportDefaultSpecifier,
    local: makeIdent(localName),
  } as unknown as TSESTree.ImportDefaultSpecifier;
}

function makeNamespaceSpec(localName: string): TSESTree.ImportNamespaceSpecifier {
  return {
    type: AST_NODE_TYPES.ImportNamespaceSpecifier,
    local: makeIdent(localName),
  } as unknown as TSESTree.ImportNamespaceSpecifier;
}

describe('getUsageReplacement', () => {
  it('replaces a plain reference', () => {
    const node = makeIdent('string', {
      type: AST_NODE_TYPES.CallExpression,
    } as unknown as TSESTree.Node);

    expect(getUsageReplacement(node, 'z.string')).toStrictEqual({ node, text: 'z.string' });
  });

  it('replaces a computed key', () => {
    // The `array` of `other[array]` is still the import binding.
    const node = makeIdent('array', {
      type: AST_NODE_TYPES.MemberExpression,
      object: makeIdent('other'),
      computed: true,
    } as unknown as TSESTree.Node);

    expect(getUsageReplacement(node, 'z.array')).toStrictEqual({ node, text: 'z.array' });
  });

  it('keeps the key of a shorthand property', () => {
    const node = makeIdent('y', {
      type: AST_NODE_TYPES.Property,
      shorthand: true,
    } as unknown as TSESTree.Node);

    expect(getUsageReplacement(node, 'z')).toStrictEqual({ node, text: 'y: z' });
  });

  it('keeps the exported name of an export specifier', () => {
    const parent = {
      type: AST_NODE_TYPES.ExportSpecifier,
      exported: { type: AST_NODE_TYPES.Literal, raw: "'y-y'" },
    } as unknown as TSESTree.Node;

    expect(getUsageReplacement(makeIdent('y', parent), 'z')).toStrictEqual({
      node: parent,
      text: "z as 'y-y'",
    });
  });

  it('gives up on exporting a qualified name', () => {
    const parent = {
      type: AST_NODE_TYPES.ExportSpecifier,
      exported: makeIdent('string'),
    } as unknown as TSESTree.Node;

    expect(getUsageReplacement(makeIdent('string', parent), 'z.string')).toBeNull();
  });

  it('gives up when the usage has no text', () => {
    expect(getUsageReplacement(makeIdent('x'), null)).toBeNull();
  });
});

describe('getImportSyntax', () => {
  it('reads the syntax of each whole-module form', () => {
    expect(getImportSyntax(makeNamespaceSpec('z'))).toBe('namespace');
    expect(getImportSyntax(makeDefaultSpec('z'))).toBe('default');
    expect(getImportSyntax(makeNamedSpec('z', 'zod'))).toBe('named');
  });

  it('gives `null` for any other named import', () => {
    expect(getImportSyntax(makeNamedSpec('string'))).toBeNull();
    expect(getImportSyntax(makeNamedSpec('default', 'z'))).toBeNull();
    // `import { 'z' as z } from 'zod'`
    expect(getImportSyntax(makeStringLiteralNamedSpec('z'))).toBeNull();
  });
});

describe('bindsWholeModule', () => {
  it('accepts every whole-module form', () => {
    expect(bindsWholeModule(makeNamespaceSpec('y'))).toBe(true);
    expect(bindsWholeModule(makeDefaultSpec('y'))).toBe(true);
    expect(bindsWholeModule(makeNamedSpec('z', 'y'))).toBe(true);
    expect(bindsWholeModule(makeNamedSpec('default', 'y'))).toBe(true);
    expect(bindsWholeModule(makeStringLiteralNamedSpec('z'))).toBe(true);
  });

  it('rejects a single export', () => {
    expect(bindsWholeModule(makeNamedSpec('string'))).toBe(false);
  });
});

describe('getUsageText', () => {
  it('uses the alias for a whole-module import', () => {
    expect(getUsageText(makeNamespaceSpec('y'), 'z')).toBe('z');
  });

  it('qualifies the export name, not the local one', () => {
    expect(getUsageText(makeNamedSpec('string', 'str'), 'z')).toBe('z.string');
  });

  it('gives `null` for a string-literal export name', () => {
    expect(getUsageText(makeStringLiteralNamedSpec('a-b'), 'z')).toBeNull();
  });
});
