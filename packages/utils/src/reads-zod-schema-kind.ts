import type { ZodMethodName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { getStaticPropertyName } from './get-static-property-name.js';
import type { ScopeVariable, SourceCode } from './rule-types.js';
import { ZOD_NON_SCHEMA_PRODUCING_METHODS } from './zod-non-schema-producing-methods.js';

/** Methods whose result depends on the kind of schema they are called on. */
const KIND_READING_METHODS: ReadonlySet<string> = new Set<ZodMethodName>([
  'apply',
  'removeCatch',
  'removeDefault',
  'unwrap',
]);

/** A kind read anywhere in a file; `ZodError` checks are about parse failures. */
const KIND_READ_IN_SOURCE =
  /\.\s*(?:_zod|apply|def|element|options|removeCatch|removeDefault|unwrap)\b|\binstanceof\s+[\w$.]*Zod(?!(?:Real)?Error\b)/u;

function readsKindFrom(
  expression: TSESTree.Expression,
  sourceCode: Readonly<SourceCode>,
  visited: Set<ScopeVariable>,
): boolean {
  const { parent } = expression;
  switch (parent.type) {
    case AST_NODE_TYPES.ChainExpression:
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSNonNullExpression:
    case AST_NODE_TYPES.TSSatisfiesExpression:
    case AST_NODE_TYPES.TSTypeAssertion:
      return readsKindFrom(parent, sourceCode, visited);
    case AST_NODE_TYPES.BinaryExpression:
      return parent.operator === 'instanceof' && parent.left === expression;
    case AST_NODE_TYPES.VariableDeclarator: {
      // Destructuring reads a property.
      if (parent.id.type !== AST_NODE_TYPES.Identifier) {
        return true;
      }
      const [variable] = sourceCode.getDeclaredVariables(parent);
      if (visited.has(variable)) {
        return false;
      }
      visited.add(variable);
      return variable.references.some(
        (reference) =>
          reference.isRead() &&
          reference.identifier.type === AST_NODE_TYPES.Identifier &&
          readsKindFrom(reference.identifier, sourceCode, visited),
      );
    }
    case AST_NODE_TYPES.MemberExpression: {
      if (parent.object !== expression) {
        return false;
      }
      const call = parent.parent;
      if (call.type !== AST_NODE_TYPES.CallExpression || call.callee !== parent) {
        return true;
      }
      const name = getStaticPropertyName(parent);
      if (name === null || KIND_READING_METHODS.has(name)) {
        return true;
      }
      return (
        !ZOD_NON_SCHEMA_PRODUCING_METHODS.includes(name) && readsKindFrom(call, sourceCode, visited)
      );
    }
    case AST_NODE_TYPES.ExpressionStatement:
      return false;
    default:
      // Once passed, stored or returned, any kind read in the file may be of this schema.
      return KIND_READ_IN_SOURCE.test(sourceCode.text);
  }
}

/**
 * Whether later code may read the kind of schema `call` builds.
 * Once the schema leaves the chain, any such read in the file counts. Other files are not seen.
 */
export function readsZodSchemaKind(
  sourceCode: Readonly<SourceCode>,
  call: TSESTree.CallExpression,
): boolean {
  return readsKindFrom(call, sourceCode, new Set());
}
