import { hasCommentInRange, zodImportScope } from '@eslint-zod/utils';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { createZodPluginRule } from '../utils/create-plugin-rule.js';

const ZOD_ARRAY_STYLES = ['function', 'method'];

interface Options {
  style: (typeof ZOD_ARRAY_STYLES)[number];
}
type MessageIds = 'useFunction' | 'useMethod';

const defaultOptions: Options = { style: 'function' };

export const arrayStyle = createZodPluginRule<[Options], MessageIds>({
  name: 'array-style',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Enforce consistent Zod array style',
    },
    messages: {
      useFunction: 'Use z.array(schema) instead of schema.array().',
      useMethod: 'Use schema.array() instead of z.array(schema).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          style: {
            description: 'Decides which style for zod array function',
            type: 'string',
            enum: ZOD_ARRAY_STYLES,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [defaultOptions],
  create(context, [{ style }]) {
    const { sourceCode } = context;

    const { createSchemaVisitor, collectZodChainMethods, resolveZodImport } =
      zodImportScope.createTracker({ kind: 'value', sourceCode });

    return createSchemaVisitor({
      onSchema(node, zodSchemaMeta): void {
        // walk to the head of the chain: `z.array(x).optional()` -> `z`
        let root: TSESTree.Node = node;
        while (
          root.type === AST_NODE_TYPES.CallExpression ||
          root.type === AST_NODE_TYPES.MemberExpression
        ) {
          root = root.type === AST_NODE_TYPES.CallExpression ? root.callee : root.object;
        }

        // detection matches by name, so a shadowed `z` still reaches here
        if (root.type !== AST_NODE_TYPES.Identifier || !resolveZodImport(root)) {
          return;
        }
        const { schemaDecl, schemaType } = zodSchemaMeta;

        if (style === 'method') {
          // match all z.array(z.string()) and convert them into z.string().array()
          if (schemaType === 'array') {
            context.report({
              node,
              messageId: 'useMethod',
              fix(fixer) {
                if (schemaDecl !== 'namespace') {
                  return null;
                }
                // extract inner schema from the call chain (handles chained calls like `.optional()`)
                const chain = collectZodChainMethods(node);
                const arrayCall = chain.find((c) => c.name === 'array');
                // a custom array error, explicit type arguments or optional chaining have no method spelling
                if (
                  arrayCall?.node.arguments.length !== 1 ||
                  arrayCall.node.typeArguments ||
                  arrayCall.node.optional ||
                  (arrayCall.node.callee.type === AST_NODE_TYPES.MemberExpression &&
                    arrayCall.node.callee.optional)
                ) {
                  return null;
                }
                const [arg] = arrayCall.node.arguments;
                // anything else needs parentheses in method position, or is not a schema to begin with
                if (
                  arg.type !== AST_NODE_TYPES.Identifier &&
                  arg.type !== AST_NODE_TYPES.MemberExpression &&
                  arg.type !== AST_NODE_TYPES.CallExpression
                ) {
                  return null;
                }
                // the fix keeps only the argument text, so a comment outside it would be dropped
                if (
                  sourceCode
                    .getCommentsInside(arrayCall.node)
                    .some(
                      (comment) =>
                        comment.range[0] < arg.range[0] || comment.range[1] > arg.range[1],
                    )
                ) {
                  return null;
                }
                const argText = sourceCode.getText(arg);
                return fixer.replaceText(arrayCall.node, `${argText}.array()`);
              },
            });
          }
          return;
        }

        const methods = collectZodChainMethods(node);

        const arrayMethod = methods.find(
          (it) =>
            it.name === 'array' &&
            // a bare `array()` or `z.array()` is the factory, not the method
            it.member !== null &&
            it.member.object.type !== AST_NODE_TYPES.Identifier &&
            // if there is a param the array has already a schema inside
            it.node.arguments.length === 0,
        );

        if (arrayMethod) {
          const { node: arrayNode, member: callee } = arrayMethod;
          context.report({
            node,
            messageId: 'useFunction',
            fix(fixer) {
              if (schemaDecl !== 'namespace' || !callee) {
                return null;
              }
              // only the receiver's text is kept
              if (hasCommentInRange(sourceCode, [callee.object.range[1], arrayNode.range[1]])) {
                return null;
              }
              const objText = sourceCode.getText(callee.object);
              return fixer.replaceText(arrayNode, `${root.name}.array(${objText})`);
            },
          });
        }
      },
    });
  },
});
