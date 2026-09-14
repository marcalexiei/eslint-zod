import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import esquery from 'esquery';

import type { ZodImportScope } from '../zod-import-scope.js';

interface Options {
  selector: string;
  example: string;
}

type MessageIds = 'invalidStyle' | 'invalidSelector';

export function buildSchemaErrorPropertyStyleCreate(
  scope: ZodImportScope,
): (
  context: Readonly<TSESLint.RuleContext<MessageIds, [Options]>>,
  options: readonly [Options],
) => TSESLint.RuleListener {
  return function create(context, [{ selector, example }]) {
    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({ kind: 'value' });

    let parsedSelector: ReturnType<typeof esquery.parse>;

    /**
     * Parsing `selector` to ensure it is valid,
     * if not report an error and return empty rule listener
     */
    try {
      parsedSelector = esquery.parse(selector);
    } catch {
      context.report({
        loc: { line: 1, column: 0 },
        messageId: 'invalidSelector',
        data: { selector },
      });
      return {};
    }

    return createSchemaVisitor({
      onSchema(node, zodSchemaMeta): void {
        if (
          zodSchemaMeta.schemaType !== 'custom' &&
          !collectZodChainMethods(node).some((it) => it.name === 'refine')
        ) {
          return;
        }

        // Error should be the second parameter, if not present stop processing
        if (node.arguments.length < 2) {
          return;
        }

        let errorMessageNode: TSESTree.Node | undefined;

        const [, params] = node.arguments;

        switch (params.type) {
          case AST_NODE_TYPES.Literal:
          case AST_NODE_TYPES.TemplateLiteral:
            errorMessageNode = params;
            break;

          case AST_NODE_TYPES.ObjectExpression:
            for (const property of params.properties) {
              if (
                property.type === AST_NODE_TYPES.Property &&
                property.key.type === AST_NODE_TYPES.Identifier &&
                property.key.name === 'error'
              ) {
                errorMessageNode = property.value;
                break;
              }
            }
            break;

          // no default
        }

        if (!errorMessageNode) {
          return;
        }

        const match = esquery.matches(
          errorMessageNode as never,
          parsedSelector,
          errorMessageNode as never,
        );

        if (match) {
          return;
        }

        context.report({
          node,
          messageId: 'invalidStyle',
          data: {
            selector,
            example,
            actual: context.sourceCode.getText(errorMessageNode),
          },
        });
      },
    });
  };
}
