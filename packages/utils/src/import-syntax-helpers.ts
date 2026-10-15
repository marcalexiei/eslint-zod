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

/** The syntax a specifier is written in, or `null` when it is not one of them. */
export function getImportSyntax(specifier: TSESTree.ImportClause): ImportSyntax | null {
  if (specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier) {
    return 'namespace';
  }
  if (specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
    return 'default';
  }
  const { imported } = specifier;
  return imported.type === AST_NODE_TYPES.Identifier && imported.name === 'z' ? 'named' : null;
}

/** Whether a specifier binds the whole module: `* as X`, `X`, `{ z as X }` or `{ default as X }`. */
export function bindsWholeModule(specifier: TSESTree.ImportClause): boolean {
  if (specifier.type !== AST_NODE_TYPES.ImportSpecifier) {
    return true;
  }
  const { imported } = specifier;
  const name = imported.type === AST_NODE_TYPES.Identifier ? imported.name : imported.value;
  return name === 'z' || name === 'default';
}

/**
 * What a usage of `specifier` becomes once the module is imported as `alias`.
 * `null` for a string-literal export name, which has no member expression.
 */
export function getUsageText(specifier: TSESTree.ImportClause, alias: string): string | null {
  if (bindsWholeModule(specifier)) {
    return alias;
  }
  const { imported } = specifier as TSESTree.ImportSpecifier;
  return imported.type === AST_NODE_TYPES.Identifier ? `${alias}.${imported.name}` : null;
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
