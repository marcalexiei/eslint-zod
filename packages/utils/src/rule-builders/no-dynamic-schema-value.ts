import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { findVariable } from '../find-variable.js';
import { getZodChainedMethodNames } from '../get-zod-chained-method-names.js';
import { isZodFactoryChainItem } from '../is-zod-factory-chain-item.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { isZodNonSchemaHelperCall } from '../zod-non-schema-helper-names.js';
import { ZOD_NON_SCHEMA_PRODUCING_METHODS } from '../zod-non-schema-producing-methods.js';

type MessageIds = 'dynamicValue';
type Context = Readonly<RuleContext<MessageIds>>;

interface StaticCheckState {
  context: Context;
  isZodCall: (node: TSESTree.Node) => boolean;
  /** Identifier definitions being resolved, so `const a = a` cannot recurse forever. */
  resolving: Set<TSESTree.Node>;
}

/**
 * True when every leaf of `node` is a literal or an import binding —
 * `zod-compiler`'s hoist criterion.
 * A nested zod schema call (e.g. the `z.string()` inside `z.object({ a: z.string() })`) counts as static here:
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
      const def = findVariable(state.context.sourceCode.getScope(node), node.name)?.defs[0];
      if (!def) {
        return false;
      }

      // A hoisted declaration is a function literal, exactly like `const f = () => {}`.
      if (def.type === 'ImportBinding' || def.type === 'FunctionName') {
        return true;
      }

      if (
        def.type !== 'Variable' ||
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

    // A recognized zod call is a nested schema, not a value — see the docstring above.
    // Anything else (a plain function call, `new`, `this`, …) is dynamic.
    case AST_NODE_TYPES.CallExpression:
      return state.isZodCall(node);

    default:
      return false;
  }
}

/**
 * Flags a non-static value passed as an argument anywhere in a zod schema expression —
 * `z.string(getErrorMessage())`, `new Date()`, `this` —
 * the same values `zod-compiler` cannot hoist at build time.
 */
export function buildNoDynamicSchemaValueCreate(
  scope: ZodImportScope,
): (context: Context) => RuleListener {
  return function create(context) {
    const {
      createSchemaVisitor,
      detectZodSchemaRootNode,
      collectZodChainMethods,
      isZodImportName,
    } = scope.createTracker({ kind: 'value' });
    const state: StaticCheckState = {
      context,
      isZodCall: (node) => detectZodSchemaRootNode(node) !== null,
      resolving: new Set(),
    };

    return createSchemaVisitor({
      onSchema(node, meta): void {
        // Detection accepts any `z.foo()`, and a helper that does not build a schema
        // (`z.prettifyError(err)`, `z.parse(schema, input)`) takes runtime values by design.
        if (isZodNonSchemaHelperCall(meta)) {
          return;
        }

        const chain = collectZodChainMethods(node);
        // Empty on a computed member (`z['string']()`) — collectZodChainMethods is all-or-nothing,
        // so fall back to the one call we know about.
        // `.parse(input)` and its kin end the schema: from there on, arguments are runtime values.
        // Only a method counts: `z.codec(…)` is a factory that list names too.
        const names = getZodChainedMethodNames(meta);
        const end = names.findIndex((name) => ZOD_NON_SCHEMA_PRODUCING_METHODS.includes(name));
        // The chain may resume after a property access (`….parse(x).tags.split(sep)`),
        // so its methods are the last ones named.
        const chainedItems = chain.filter((item) => !isZodFactoryChainItem(item, isZodImportName));
        const offset = names.length - chainedItems.length;
        const schemaChain = chain.filter((item) => {
          const position = chainedItems.indexOf(item);
          return position === -1 || end === -1 || offset + position < end;
        });
        const calls = chain.length > 0 ? schemaChain.map((item) => item.node) : [node];

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
