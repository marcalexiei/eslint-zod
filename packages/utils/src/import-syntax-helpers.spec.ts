import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import {
  getUsageReplacement,
  isGroupFirstImportKindValidForSyntax,
} from './import-syntax-helpers.js';

// Internal helpers of the `consistent-import` builder, asserted directly for shapes its fixtures cannot reach.

function makeIdent(name: string, parent?: TSESTree.Node): TSESTree.Identifier {
  return {
    type: AST_NODE_TYPES.Identifier,
    name,
    parent,
  } as unknown as TSESTree.Identifier;
}

function makeImportDecl(
  specifiers: Array<TSESTree.ImportClause>,
  importKind: 'value' | 'type' = 'value',
): TSESTree.ImportDeclaration {
  return {
    type: AST_NODE_TYPES.ImportDeclaration,
    specifiers,
    importKind,
  } as unknown as TSESTree.ImportDeclaration;
}

function makeNamedSpec(importedName: string): TSESTree.ImportSpecifier {
  return {
    type: AST_NODE_TYPES.ImportSpecifier,
    local: makeIdent(importedName),
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
});

describe('isGroupFirstImportKindValidForSyntax', () => {
  it('accepts a lone namespace specifier for `namespace` syntax', () => {
    const group = { hasOnlyTypeImports: false, nodes: [makeImportDecl([makeNamespaceSpec('z')])] };

    expect(isGroupFirstImportKindValidForSyntax(group, 'namespace')).toBe(true);
  });

  it('accepts a lone default specifier for `default` syntax', () => {
    const group = { hasOnlyTypeImports: false, nodes: [makeImportDecl([makeDefaultSpec('z')])] };

    expect(isGroupFirstImportKindValidForSyntax(group, 'default')).toBe(true);
    expect(isGroupFirstImportKindValidForSyntax(group, 'namespace')).toBe(false);
  });

  it('rejects a namespace specifier for `default` syntax', () => {
    const group = { hasOnlyTypeImports: false, nodes: [makeImportDecl([makeNamespaceSpec('z')])] };

    expect(isGroupFirstImportKindValidForSyntax(group, 'default')).toBe(false);
  });

  it('rejects a group whose first import has more than one specifier', () => {
    const group = {
      hasOnlyTypeImports: false,
      nodes: [makeImportDecl([makeNamedSpec('z'), makeNamedSpec('string')])],
    };

    expect(isGroupFirstImportKindValidForSyntax(group, 'named')).toBe(false);
  });

  it('accepts a lone named `z` specifier for `named` syntax', () => {
    const group = { hasOnlyTypeImports: false, nodes: [makeImportDecl([makeNamedSpec('z')])] };

    expect(isGroupFirstImportKindValidForSyntax(group, 'named')).toBe(true);
  });

  it('rejects a named specifier that is not `z`', () => {
    const group = { hasOnlyTypeImports: false, nodes: [makeImportDecl([makeNamedSpec('string')])] };

    expect(isGroupFirstImportKindValidForSyntax(group, 'named')).toBe(false);
  });

  it('rejects a string-literal import name', () => {
    // `import { 'z' as z } from 'zod'` — the imported name is not an identifier.
    const group = {
      hasOnlyTypeImports: false,
      nodes: [makeImportDecl([makeStringLiteralNamedSpec('z')])],
    };

    expect(isGroupFirstImportKindValidForSyntax(group, 'named')).toBe(false);
  });

  it('requires `import type` when the group has only type imports', () => {
    const valueImport = {
      hasOnlyTypeImports: true,
      nodes: [makeImportDecl([makeNamespaceSpec('z')], 'value')],
    };
    const typeImport = {
      hasOnlyTypeImports: true,
      nodes: [makeImportDecl([makeNamespaceSpec('z')], 'type')],
    };

    expect(isGroupFirstImportKindValidForSyntax(valueImport, 'namespace')).toBe(false);
    expect(isGroupFirstImportKindValidForSyntax(typeImport, 'namespace')).toBe(true);
  });
});
