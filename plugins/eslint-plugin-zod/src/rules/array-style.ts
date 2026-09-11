import { zodImportScope } from '@eslint-zod/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

import { createZodPluginRule } from '../utils/create-plugin-rule.js';
import { hasZodRuntimeImportRoot } from '../utils/has-zod-runtime-import-root.js';

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

    const { createSchemaVisitor, collectZodChainMethods } = zodImportScope.createTracker();

    return createSchemaVisitor({
      onSchema(node, zodSchemaMeta): void {
        if (!hasZodRuntimeImportRoot(node, sourceCode)) {
          return;
        }
        const { schemaDecl, schemaType } = zodSchemaMeta;

        if (style === 'method') {
          // match all z.array(z.string()) and convert them into
          // z.string().array()
          if (schemaType === 'array') {
            if (schemaDecl === 'namespace') {
              context.report({
                node,
                messageId: 'useMethod',
                fix(fixer) {
                  // extract inner schema from the call chain (handles chained calls like `.optional()`)
                  const chain = collectZodChainMethods(node);
                  const arrayCall = chain.find((c) => c.name === 'array');
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
                  // Other expressions need parentheses or can change the inferred schema type.
                  if (
                    arg.type !== AST_NODE_TYPES.Identifier &&
                    arg.type !== AST_NODE_TYPES.MemberExpression &&
                    arg.type !== AST_NODE_TYPES.CallExpression
                  ) {
                    return null;
                  }
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
              return;
            }

            context.report({
              node,
              messageId: 'useMethod',
            });
          }
          return;
        }

        const methods = collectZodChainMethods(node);

        const arrayMethod = methods.find(
          (it) =>
            it.name === 'array' &&
            // if there is a param the array has already a schema inside
            it.node.arguments.length === 0,
        );

        if (arrayMethod) {
          const arrayNode = arrayMethod.node;
          if (schemaDecl === 'namespace') {
            context.report({
              node,
              messageId: 'useFunction',
              fix(fixer) {
                const callee = arrayNode.callee as TSESTree.MemberExpression;
                const objText = sourceCode.getText(callee.object);
                return fixer.replaceText(arrayNode, `z.array(${objText})`);
              },
            });
            return;
          }

          context.report({
            node,
            messageId: 'useFunction',
          });
        }
      },
    });
  },
});
