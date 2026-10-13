import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

/**
 * Walks up the AST from a Zod call expression and returns `true` when an
 * ancestor call expression invokes a method named `schemaName` and the supplied
 * `condition` predicate returns `true` for it.
 *
 * Useful for asking questions like *"is this `.min(1)` chain used inside a
 * `z.record(...)` call as its first argument?"* without having to write the
 * ancestor traversal in every rule.
 *
 * Returns `false` if no matching ancestor is reached before the root.
 *
 * @param outermostNode - Starting call expression (typically the result of {@link detectZodSchemaRootNode})
 * @param options.schemaName - Name of the ancestor method to look for (e.g. `'record'`)
 * @param options.condition - Predicate evaluated on the matching ancestor call expression
 */
export function findParentSchemaMatchingCondition(
  outermostNode: TSESTree.CallExpression,
  options: {
    schemaName: string;
    condition: (node: TSESTree.CallExpression) => boolean;
  },
): boolean {
  const { schemaName, condition } = options;
  let current = outermostNode;

  // Traverse the parent chain to find if this is an argument to z.record()
  // We need to go up: .min(1) -> MemberExpression (.min) -> parent chain...
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (current.parent) {
    const { parent } = current;

    // If parent is a CallExpression, check if it's z.record()
    if (parent.type === AST_NODE_TYPES.CallExpression) {
      const callParent = parent;

      // Check if the parent call is a method call (callee is MemberExpression)
      if (callParent.callee.type === AST_NODE_TYPES.MemberExpression) {
        const memberExpr = callParent.callee;

        // Get the property name (method name)
        const methodName =
          memberExpr.property.type === AST_NODE_TYPES.Identifier ? memberExpr.property.name : null;

        // If this is z.record(), check if we're the first argument
        if (methodName === schemaName) {
          return condition(callParent);
        }
      }
    }

    // If parent is a MemberExpression, continue up the chain
    if (parent.type === AST_NODE_TYPES.MemberExpression) {
      const memberParent = parent;

      current = memberParent as unknown as TSESTree.CallExpression;
      continue;
    }

    // Move to parent for arguments case
    current = parent as TSESTree.CallExpression;
  }

  return false;
}
