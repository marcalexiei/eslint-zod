import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

/**
 * Supported import syntaxes for the `consistent-import` rule:
 * - `'namespace'` → `import * as z from 'zod'`
 * - `'named'` → `import { z } from 'zod'`
 *
 * A default import (`import z from 'zod'`) is not a syntax of its own:
 * it satisfies neither option and is rewritten to whichever one is configured.
 *
 * @see https://github.com/marcalexiei/eslint-zod/issues/409
 */
export const IMPORT_SYNTAXES = ['namespace', 'named'] as const;
export type ImportSyntax = (typeof IMPORT_SYNTAXES)[number];

export interface ImportGroupData {
  hasOnlyTypeImports: boolean;
  nodes: Array<TSESTree.ImportDeclaration>;
}

/**
 * Determines whether the first import in a group is valid for a given import
 * syntax (`named` or `namespace`), taking into account whether the group
 * contains only type imports.
 *
 * Rules enforced:
 * - For `named` syntax:
 *   - The first import must have exactly one specifier
 *   - That specifier must be a named import of identifier `z`
 * - For `namespace` syntax:
 *   - The first import must have exactly one namespace specifier
 * - If the group contains only type imports, the first import must explicitly
 *   be declared as `import type`
 *
 * @param group - Metadata describing the import group
 * @param syntax - Expected import syntax for the group
 * @returns `true` if the first import matches the expected syntax and type rules
 */
export function isGroupFirstImportKindValidForSyntax(
  group: ImportGroupData,
  syntax: ImportSyntax,
): boolean {
  const { hasOnlyTypeImports, nodes } = group;
  const [firstImportNode] = nodes;
  const { specifiers, importKind } = firstImportNode;

  // All supported syntaxes require exactly one specifier
  if (specifiers.length !== 1) {
    return false;
  }

  const [specifier] = specifiers;

  // Validate syntax-specific constraints
  const isValidForSyntax =
    syntax === 'named'
      ? specifier.type === AST_NODE_TYPES.ImportSpecifier &&
        specifier.imported.type === AST_NODE_TYPES.Identifier &&
        specifier.imported.name === 'z'
      : specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier;

  if (!isValidForSyntax) {
    return false;
  }

  // If the group consists only of type imports, the first import
  // must explicitly use `import type`
  if (hasOnlyTypeImports) {
    return importKind === 'type';
  }

  return true;
}

/**
 * Returns `true` if an identifier node should be renamed by a `consistent-import`
 * fixer. Skips specifier nodes themselves and identifiers already qualified
 * through a different namespace (e.g. the `z` in `z.array`, when the rename
 * target is not `z`).
 */
export function shouldIdentifierBeRenamed(node: TSESTree.Identifier): boolean {
  // Skip import specifier nodes themselves
  if (node.parent.type === AST_NODE_TYPES.ImportSpecifier) {
    return false;
  }

  // Skip if already qualified, e.g. z.array
  if (
    node.parent.type === AST_NODE_TYPES.MemberExpression &&
    node.parent.object.type === AST_NODE_TYPES.Identifier &&
    node.parent.object.name !== node.name
  ) {
    return false;
  }

  return true;
}

/**
 * From a given specifiers retrieve the most significant to use when creating an alias import
 */
export function getNamespaceAliasNameFrom(node: TSESTree.ImportClause): string | null {
  if (
    node.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
    node.type === AST_NODE_TYPES.ImportNamespaceSpecifier
  ) {
    return node.local.name;
  }

  if (
    // node.type === AST_NODE_TYPES.ImportSpecifier &&
    node.imported.type === AST_NODE_TYPES.Identifier &&
    // Search named imports for 'z'
    node.imported.name === 'z'
  ) {
    return node.local.name;
  }

  return null;
}
