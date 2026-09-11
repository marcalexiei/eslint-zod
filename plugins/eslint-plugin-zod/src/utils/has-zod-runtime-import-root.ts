import { zodImportScope } from '@eslint-zod/utils';
import { ASTUtils, AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

export function hasZodRuntimeImportRoot(
  node: TSESTree.CallExpression,
  sourceCode: Pick<TSESLint.SourceCode, 'getScope'>,
): boolean {
  let root: TSESTree.Node = node;

  while (
    root.type === AST_NODE_TYPES.CallExpression ||
    root.type === AST_NODE_TYPES.MemberExpression
  ) {
    root = root.type === AST_NODE_TYPES.CallExpression ? root.callee : root.object;
  }

  if (root.type !== AST_NODE_TYPES.Identifier) {
    return false;
  }

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

  const specifier = definition.node;
  return (
    specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
    specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier ||
    (specifier.type === AST_NODE_TYPES.ImportSpecifier && specifier.importKind !== 'type')
  );
}
