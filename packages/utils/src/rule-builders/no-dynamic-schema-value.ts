import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils, AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'dynamicValue';
type Context = Readonly<TSESLint.RuleContext<MessageIds, []>>;

interface StaticCheckState {
  context: Context;
  isZodCall: (node: TSESTree.Node) => boolean;
  /** Identifier definitions being resolved, so `const a = a` cannot recurse forever. */
  resolving: Set<TSESTree.Node>;
}

/**
 * True when every leaf of `node` is a literal or an import binding —
 * `zod-compiler`'s hoist criterion. A nested zod schema call (e.g. the
 * `z.string()` inside `z.object({ a: z.string() })`) counts as static here:
 * it is checked independently through its own `onSchema` visit.
 */
function isStaticExpression(node: TSESTree.Node, state: StaticCheckState): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.Literal:
    case AST_NODE_TYPES.ArrowFunctionExpression:
    case AST_NODE_TYPES.FunctionExpression:
      return true;

    case AST_NODE_TYPES.TemplateLiteral:
      return node.expressions.every((expression) => isStaticExpression(expression, state));

    case AST_NODE_TYPES.ArrayExpression:
      return node.elements.every(
        (element) =>
          element === null ||
          isStaticExpression(
            element.type === AST_NODE_TYPES.SpreadElement ? element.argument : element,
            state,
          ),
      );

    case AST_NODE_TYPES.ObjectExpression:
      return node.properties.every((property) =>
        isStaticExpression(
          property.type === AST_NODE_TYPES.SpreadElement ? property.argument : property.value,
          state,
        ),
      );

    case AST_NODE_TYPES.UnaryExpression:
      return isStaticExpression(node.argument, state);

    case AST_NODE_TYPES.ChainExpression:
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSSatisfiesExpression:
    case AST_NODE_TYPES.TSNonNullExpression:
      return isStaticExpression(node.expression, state);

    case AST_NODE_TYPES.ConditionalExpression:
      return (
        isStaticExpression(node.test, state) &&
        isStaticExpression(node.consequent, state) &&
        isStaticExpression(node.alternate, state)
      );

    case AST_NODE_TYPES.LogicalExpression:
    case AST_NODE_TYPES.BinaryExpression:
      return (
        node.left.type !== AST_NODE_TYPES.PrivateIdentifier &&
        isStaticExpression(node.left, state) &&
        isStaticExpression(node.right, state)
      );

    case AST_NODE_TYPES.Identifier: {
      const def = ASTUtils.findVariable(state.context.sourceCode.getScope(node), node)?.defs[0];
      if (!def) {
        return false;
      }

      // A hoisted declaration is a function literal, exactly like `const f = () => {}`.
      if (
        def.type === TSESLint.Scope.DefinitionType.ImportBinding ||
        def.type === TSESLint.Scope.DefinitionType.FunctionName
      ) {
        return true;
      }

      if (
        def.type !== TSESLint.Scope.DefinitionType.Variable ||
        def.parent.kind !== 'const' ||
        def.node.init === null ||
        state.resolving.has(def.node)
      ) {
        return false;
      }

      state.resolving.add(def.node);
      const isStatic = isStaticExpression(def.node.init, state);
      state.resolving.delete(def.node);
      return isStatic;
    }

    // A recognized zod call is a nested schema, not a value — see the
    // docstring above. Anything else (a plain function call, `new`, `this`, …)
    // is dynamic.
    case AST_NODE_TYPES.CallExpression:
      return state.isZodCall(node);

    default:
      return false;
  }
}

/**
 * Flags a non-static value passed as an argument anywhere in a zod schema
 * expression — `z.string(getErrorMessage())`, `new Date()`, `this` — the
 * same values `zod-compiler` cannot hoist at build time.
 */
export function buildNoDynamicSchemaValueCreate(
  scope: ZodImportScope,
): (context: Context) => TSESLint.RuleListener {
  return function create(context) {
    const { createSchemaVisitor, detectZodSchemaRootNode, collectZodChainMethods } =
      scope.createTracker();
    const state: StaticCheckState = {
      context,
      isZodCall: (node) => detectZodSchemaRootNode(node) !== null,
      resolving: new Set(),
    };

    return createSchemaVisitor({
      onSchema(node): void {
        const chain = collectZodChainMethods(node);
        // Empty on a computed member (`z['string']()`) — collectZodChainMethods
        // is all-or-nothing, so fall back to the one call we know about.
        const calls = chain.length > 0 ? chain.map((item) => item.node) : [node];

        for (const call of calls) {
          for (const argument of call.arguments) {
            const expression =
              argument.type === AST_NODE_TYPES.SpreadElement ? argument.argument : argument;

            if (!isStaticExpression(expression, state)) {
              context.report({ node: expression, messageId: 'dynamicValue' });
            }
          }
        }
      },
    });
  };
}
