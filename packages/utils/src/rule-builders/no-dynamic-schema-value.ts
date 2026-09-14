import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils, AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'dynamicValue';
type Context = Readonly<TSESLint.RuleContext<MessageIds, []>>;
type IsZodCall = (node: TSESTree.Node) => boolean;

/**
 * True when every leaf of `node` is a literal or an import binding —
 * `zod-compiler`'s hoist criterion. A nested zod schema call (e.g. the
 * `z.string()` inside `z.object({ a: z.string() })`) counts as static here:
 * it is checked independently through its own `onSchema` visit.
 */
function isStaticExpression(node: TSESTree.Node, context: Context, isZodCall: IsZodCall): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.Literal:
      return true;

    case AST_NODE_TYPES.TemplateLiteral:
      return node.expressions.every((expression) =>
        isStaticExpression(expression, context, isZodCall),
      );

    case AST_NODE_TYPES.ArrayExpression:
      return node.elements.every(
        (element) =>
          element === null ||
          isStaticExpression(
            element.type === AST_NODE_TYPES.SpreadElement ? element.argument : element,
            context,
            isZodCall,
          ),
      );

    case AST_NODE_TYPES.ObjectExpression:
      return node.properties.every((property) =>
        property.type === AST_NODE_TYPES.SpreadElement
          ? isStaticExpression(property.argument, context, isZodCall)
          : isStaticExpression(property.value, context, isZodCall),
      );

    case AST_NODE_TYPES.ArrowFunctionExpression:
    case AST_NODE_TYPES.FunctionExpression:
      return true;

    case AST_NODE_TYPES.UnaryExpression:
      return isStaticExpression(node.argument, context, isZodCall);

    case AST_NODE_TYPES.ChainExpression:
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSSatisfiesExpression:
    case AST_NODE_TYPES.TSNonNullExpression:
      return isStaticExpression(node.expression, context, isZodCall);

    case AST_NODE_TYPES.ConditionalExpression:
      return (
        isStaticExpression(node.test, context, isZodCall) &&
        isStaticExpression(node.consequent, context, isZodCall) &&
        isStaticExpression(node.alternate, context, isZodCall)
      );

    case AST_NODE_TYPES.LogicalExpression:
    case AST_NODE_TYPES.BinaryExpression:
      return (
        node.left.type !== AST_NODE_TYPES.PrivateIdentifier &&
        isStaticExpression(node.left, context, isZodCall) &&
        isStaticExpression(node.right, context, isZodCall)
      );

    case AST_NODE_TYPES.Identifier: {
      const variable = ASTUtils.findVariable(context.sourceCode.getScope(node), node);
      const def = variable?.defs[0];
      if (!def) {
        return false;
      }

      if (def.type === TSESLint.Scope.DefinitionType.ImportBinding) {
        return true;
      }

      return (
        def.type === TSESLint.Scope.DefinitionType.Variable &&
        def.parent.kind === 'const' &&
        def.node.init !== null &&
        isStaticExpression(def.node.init, context, isZodCall)
      );
    }

    // A recognized zod call is a nested schema, not a value — see the
    // docstring above. Anything else (a plain function call, `new`, `this`, …)
    // is dynamic.
    case AST_NODE_TYPES.CallExpression:
      return isZodCall(node);

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
    const isZodCall: IsZodCall = (node) => detectZodSchemaRootNode(node) !== null;

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

            if (!isStaticExpression(expression, context, isZodCall)) {
              context.report({ node: expression, messageId: 'dynamicValue' });
            }
          }
        }
      },
    });
  };
}
