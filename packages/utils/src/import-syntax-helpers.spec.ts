import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import {
  isGroupFirstImportKindValidForSyntax,
  shouldIdentifierBeRenamed,
} from './import-syntax-helpers.js';

/**
 * Unit spec for the helpers `consistent-import` shares with its fixers. They
 * are part of the package's public surface (re-exported from the
 * `rule-builders/consistent-import` subpath) and cover shapes the rule's own
 * fixtures cannot reach, so they are asserted directly here.
 */

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

function makeNamespaceSpec(localName: string): TSESTree.ImportNamespaceSpecifier {
  return {
    type: AST_NODE_TYPES.ImportNamespaceSpecifier,
    local: makeIdent(localName),
  } as unknown as TSESTree.ImportNamespaceSpecifier;
}

describe('shouldIdentifierBeRenamed', () => {
  it('renames a plain reference', () => {
    const node = makeIdent('string', {
      type: AST_NODE_TYPES.CallExpression,
    } as unknown as TSESTree.Node);

    expect(shouldIdentifierBeRenamed(node)).toBe(true);
  });

  it('skips the import specifier identifier itself', () => {
    const node = makeIdent('string', {
      type: AST_NODE_TYPES.ImportSpecifier,
    } as unknown as TSESTree.Node);

    expect(shouldIdentifierBeRenamed(node)).toBe(false);
  });

  it('skips an identifier already qualified by another namespace', () => {
    // The `array` of `other[array]` — reached through a different object.
    const parent = {
      type: AST_NODE_TYPES.MemberExpression,
      object: makeIdent('other'),
    } as unknown as TSESTree.Node;

    expect(shouldIdentifierBeRenamed(makeIdent('array', parent))).toBe(false);
  });

  it('renames an identifier that is the object of a member expression', () => {
    const objectIdentifier = makeIdent('string');
    const parent = {
      type: AST_NODE_TYPES.MemberExpression,
      object: objectIdentifier,
    } as unknown as TSESTree.Node;
    (objectIdentifier as unknown as Record<string, unknown>).parent = parent;

    expect(shouldIdentifierBeRenamed(objectIdentifier)).toBe(true);
  });
});

describe('isGroupFirstImportKindValidForSyntax', () => {
  it('accepts a lone namespace specifier for `namespace` syntax', () => {
    const group = { hasOnlyTypeImports: false, nodes: [makeImportDecl([makeNamespaceSpec('z')])] };

    expect(isGroupFirstImportKindValidForSyntax(group, 'namespace')).toBe(true);
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
