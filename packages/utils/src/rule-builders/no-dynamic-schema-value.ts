import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { findVariable } from '../find-variable.js';
import { getZodChainedMethodNames } from '../get-zod-chained-method-names.js';
import { isZodFactoryChainItem } from '../is-zod-factory-chain-item.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { isZodNonSchemaHelperCall } from '../zod-non-schema-helper-names.js';
import {
  ZOD_NON_SCHEMA_PRODUCING_METHODS,
  chainsZodNonSchemaMethod,
} from '../zod-non-schema-producing-methods.js';

type MessageIds = 'dynamicValue';
type Context = Readonly<RuleContext<MessageIds>>;

function unwrapSpread(node: TSESTree.Expression | TSESTree.SpreadElement): TSESTree.Expression {
  return node.type === AST_NODE_TYPES.SpreadElement ? node.argument : node;
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
      resolveZodSchema,
    } = scope.createTracker({ kind: 'value', sourceCode: context.sourceCode });

    /** Identifier definitions being resolved, so `const a = a` cannot recurse forever. */
    const resolving = new Set<TSESTree.Node>();

    // A check (`z.refine(fn)`) counts as a schema; a parse result or a helper call is a value.
    function isNestedSchema(node: TSESTree.CallExpression): boolean {
      const meta = detectZodSchemaRootNode(node);
      if (meta) {
        return !isZodNonSchemaHelperCall(meta) && !chainsZodNonSchemaMethod(meta);
      }
      return resolveZodSchema(node) !== null;
    }

    /**
     * True when every leaf of `node` is a literal, an import binding, or a `const` bound to one —
     * `zod-compiler`'s hoist criterion.
     * A nested schema (`z.object({ a: z.string() })`, a local `base.optional()`) counts as static:
     * the visitor checks its own arguments when it reaches it.
     */
    function isStaticExpression(node: TSESTree.Node): boolean {
      switch (node.type) {
        case AST_NODE_TYPES.Literal:
        case AST_NODE_TYPES.ArrowFunctionExpression:
        case AST_NODE_TYPES.FunctionExpression:
          return true;

        case AST_NODE_TYPES.TemplateLiteral:
          return node.expressions.every((expression) => isStaticExpression(expression));

        case AST_NODE_TYPES.ArrayExpression:
          return node.elements.every(
            (element) => element === null || isStaticExpression(unwrapSpread(element)),
          );

        case AST_NODE_TYPES.ObjectExpression:
          return node.properties.every((property) =>
            isStaticExpression(
              property.type === AST_NODE_TYPES.SpreadElement ? property.argument : property.value,
            ),
          );

        case AST_NODE_TYPES.UnaryExpression:
          return isStaticExpression(node.argument);

        case AST_NODE_TYPES.ChainExpression:
        case AST_NODE_TYPES.TSAsExpression:
        case AST_NODE_TYPES.TSSatisfiesExpression:
        case AST_NODE_TYPES.TSNonNullExpression:
          return isStaticExpression(node.expression);

        case AST_NODE_TYPES.ConditionalExpression:
          return (
            isStaticExpression(node.test) &&
            isStaticExpression(node.consequent) &&
            isStaticExpression(node.alternate)
          );

        case AST_NODE_TYPES.LogicalExpression:
        case AST_NODE_TYPES.BinaryExpression:
          return (
            node.left.type !== AST_NODE_TYPES.PrivateIdentifier &&
            isStaticExpression(node.left) &&
            isStaticExpression(node.right)
          );

        case AST_NODE_TYPES.Identifier: {
          const def = findVariable(context.sourceCode.getScope(node), node.name)?.defs[0];
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
            resolving.has(def.node)
          ) {
            return false;
          }

          resolving.add(def.node);
          const isStatic = isStaticExpression(def.node.init);
          resolving.delete(def.node);
          return isStatic;
        }

        // `schema.shape`, `config.message`: reading a static value is static.
        case AST_NODE_TYPES.MemberExpression:
          return (
            (!node.computed || isStaticExpression(node.property)) && isStaticExpression(node.object)
          );

        case AST_NODE_TYPES.CallExpression:
          return isNestedSchema(node);

        default:
          return false;
      }
    }

    return createSchemaVisitor({
      // A local schema's calls (`base.extend({…})`) take arguments too.
      localSchemas: true,
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
            const expression = unwrapSpread(argument);
            if (!isStaticExpression(expression)) {
              context.report({ node: expression, messageId: 'dynamicValue' });
            }
          }
        }
      },
    });
  };
}
