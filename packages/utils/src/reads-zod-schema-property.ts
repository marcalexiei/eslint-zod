import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { ZodSchemaMeta } from './detect-zod-schema-root-node.js';
import { ZOD_NON_SCHEMA_PRODUCING_METHODS } from './zod-non-schema-producing-methods.js';

/**
 * Whether a property is read from the schema `node` builds: `z.array(x).length(2).element`.
 * A fixer that swaps the schema for another kind withholds its fix there, since the property may not exist on it.
 * A read from a parse result (`….safeParse(x).success`) does not count.
 */
export function readsZodSchemaProperty(
  node: TSESTree.CallExpression,
  meta: ZodSchemaMeta,
): boolean {
  const { parent } = node;
  if (parent.type !== AST_NODE_TYPES.MemberExpression || parent.object !== node) {
    return false;
  }
  const last = meta.methods.at(-1);
  return last === undefined || !ZOD_NON_SCHEMA_PRODUCING_METHODS.includes(last);
}
