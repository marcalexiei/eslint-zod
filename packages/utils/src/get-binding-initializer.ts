import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { findVariable } from './find-variable.js';
import type { ScopeVariable, SourceCode } from './rule-types.js';

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

/** `node` without the `as`, `satisfies` and `!` around it, none of which changes the value. */
export function skipTypeAssertions(node: TSESTree.Expression): TSESTree.Expression {
  let current = node;
  while (
    current.type === AST_NODE_TYPES.TSAsExpression ||
    current.type === AST_NODE_TYPES.TSSatisfiesExpression ||
    current.type === AST_NODE_TYPES.TSNonNullExpression
  ) {
    current = current.expression;
  }
  return current;
}

/** The value `identifier` holds where it is read, per {@link getBindingInitializer}, assertions skipped. */
export function getIdentifierValue(
  sourceCode: Readonly<SourceCode>,
  identifier: TSESTree.Identifier,
): TSESTree.Expression | null {
  const init = getBindingInitializer(
    findVariable(sourceCode.getScope(identifier), identifier.name),
  );
  return init && skipTypeAssertions(init);
}

/** The value of a call argument, an identifier followed per {@link getIdentifierValue}; `null` for a spread. */
export function getArgumentValue(
  sourceCode: Readonly<SourceCode>,
  argument: TSESTree.CallExpressionArgument | undefined,
): TSESTree.Expression | null {
  if (!argument || argument.type === AST_NODE_TYPES.SpreadElement) {
    return null;
  }
  const value = skipTypeAssertions(argument);
  return value.type === AST_NODE_TYPES.Identifier ? getIdentifierValue(sourceCode, value) : value;
}
