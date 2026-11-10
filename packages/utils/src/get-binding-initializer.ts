import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { ScopeVariable } from './rule-types.js';

/** The initializer of a variable declared once and never reassigned, which is its value wherever it is read. */
export function getBindingInitializer(variable: ScopeVariable | null): TSESTree.Expression | null {
  // More than one definition means the binding is re-declared.
  if (variable?.defs.length !== 1) {
    return null;
  }
  const [definition] = variable.defs;
  if (definition.type !== 'Variable' || definition.node.id.type !== AST_NODE_TYPES.Identifier) {
    return null;
  }
  const reassigned = variable.references.some(
    (reference) => reference.isWrite() && !reference.init,
  );
  return reassigned ? null : definition.node.init;
}
