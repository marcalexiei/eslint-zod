import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

/**
 * The static name a member or property key writes.
 * `null` for a computed identifier (`obj[validate]`), which is a reference.
 */
export function getStaticPropertyName(
  node: TSESTree.MemberExpression | TSESTree.Property,
): string | null {
  const property = node.type === AST_NODE_TYPES.MemberExpression ? node.property : node.key;
  if (!node.computed && property.type === AST_NODE_TYPES.Identifier) {
    return property.name;
  }
  if (property.type === AST_NODE_TYPES.Literal && typeof property.value === 'string') {
    return property.value;
  }
  return null;
}
