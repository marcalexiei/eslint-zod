import { zodImportScope } from '@eslint-zod/utils';
import { ASTUtils, AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

/**
 * Whether the identifier a chain starts from resolves to a runtime zod import.
 * Bails on a root that is shadowed, re-assigned, type-only, or imported from another source —
 * every case where a fix would rewrite code that is not zod, or reference a binding erased at runtime.
 */
export function hasZodRuntimeImportRoot(
  node: TSESTree.CallExpression,
  sourceCode: Pick<TSESLint.SourceCode, 'getScope'>,
): boolean {
  let root: TSESTree.Node = node;

  // walk to the head of the chain: `z.array(x).optional()` -> `z`
  while (
    root.type === AST_NODE_TYPES.CallExpression ||
    root.type === AST_NODE_TYPES.MemberExpression
  ) {
    root = root.type === AST_NODE_TYPES.CallExpression ? root.callee : root.object;
  }

  if (root.type !== AST_NODE_TYPES.Identifier) {
    return false;
  }

  // more than one definition means the binding is re-declared, so the import does not settle its value
  const variable = ASTUtils.findVariable(sourceCode.getScope(root), root);
  if (variable?.defs.length !== 1) {
    return false;
  }

  const [definition] = variable.defs;
  if (
    definition.type !== TSESLint.Scope.DefinitionType.ImportBinding ||
    definition.parent.type !== AST_NODE_TYPES.ImportDeclaration ||
    definition.parent.importKind === 'type' ||
    !zodImportScope.isAllowed(definition.parent.source.value)
  ) {
    return false;
  }

  // a value declaration can still carry a type-only specifier: `import { type z } from 'zod'`
  const specifier = definition.node;
  return (
    specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
    specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier ||
    (specifier.type === AST_NODE_TYPES.ImportSpecifier && specifier.importKind !== 'type')
  );
}
