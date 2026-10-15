import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

/**
 * Import syntaxes the `consistent-import` builder can enforce; each plugin offers its own subset:
 * - `'namespace'` → `import * as z from 'zod'`
 * - `'named'` → `import { z } from 'zod'`
 * - `'default'` → `import z from 'zod'`
 */
export const IMPORT_SYNTAXES = ['namespace', 'named', 'default'] as const;
export type ImportSyntax = (typeof IMPORT_SYNTAXES)[number];

export interface ImportGroupData {
  hasOnlyTypeImports: boolean;
  nodes: Array<TSESTree.ImportDeclaration>;
}

/**
 * Determines whether the first import in a group is valid for a given import
 * syntax (`namespace`, `named` or `default`), taking into account whether the group
 * contains only type imports.
 *
 * Rules enforced:
 * - For `named` syntax:
 *   - The first import must have exactly one specifier
 *   - That specifier must be a named import of identifier `z`
 * - For `namespace` syntax:
 *   - The first import must have exactly one namespace specifier
 * - For `default` syntax:
 *   - The first import must have exactly one default specifier
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
      : specifier.type ===
        (syntax === 'default'
          ? AST_NODE_TYPES.ImportDefaultSpecifier
          : AST_NODE_TYPES.ImportNamespaceSpecifier);

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

export interface UsageReplacement {
  node: TSESTree.Node;
  text: string;
}

/**
 * How a `consistent-import` fixer rewrites a usage of an import binding as `newText`.
 * `null` when there is no in-place rewrite: `export { string }` cannot export `z.string`.
 */
export function getUsageReplacement(
  node: TSESTree.Identifier,
  newText: string,
): UsageReplacement | null {
  const { parent } = node;

  // `{ y }` keeps its key: `{ y: z }`
  if (parent.type === AST_NODE_TYPES.Property && parent.shorthand) {
    return { node, text: `${node.name}: ${newText}` };
  }

  // `export { y }` keeps its exported name: `export { z as y }`
  if (parent.type === AST_NODE_TYPES.ExportSpecifier) {
    if (newText.includes('.')) {
      return null;
    }
    const exportedName =
      parent.exported.type === AST_NODE_TYPES.Identifier
        ? parent.exported.name
        : parent.exported.raw;
    return { node: parent, text: `${newText} as ${exportedName}` };
  }

  return { node, text: newText };
}

/**
 * The local name of a specifier bound to the whole Zod module
 * (`* as X`, `X`, `{ z as X }` or `{ default as X }`), or `null` for any other export.
 */
export function getNamespaceAliasNameFrom(node: TSESTree.ImportClause): string | null {
  if (
    node.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
    node.type === AST_NODE_TYPES.ImportNamespaceSpecifier
  ) {
    return node.local.name;
  }

  const importedName =
    node.imported.type === AST_NODE_TYPES.Identifier ? node.imported.name : node.imported.value;

  return importedName === 'z' || importedName === 'default' ? node.local.name : null;
}
