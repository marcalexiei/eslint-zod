import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';
import esquery from 'esquery';

import { getStaticPropertyName } from '../get-static-property-name.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

export interface SchemaErrorPropertyStyleOptions {
  selector: string;
  example: string;
}

type MessageIds = 'invalidStyle' | 'invalidSelector';

export function buildSchemaErrorPropertyStyleCreate(
  scope: ZodImportScope,
): (
  context: Readonly<RuleContext<MessageIds, [SchemaErrorPropertyStyleOptions]>>,
  options: readonly [SchemaErrorPropertyStyleOptions],
) => RuleListener {
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
        // `node` is the outermost call: the params belong to the `refine` / `custom` call itself.
        const chain = collectZodChainMethods(node);
        const calls = chain.filter((it) => it.name === 'refine').map((it) => it.node);
        if (zodSchemaMeta.schemaType === 'custom') {
          calls.push(chain.at(0)?.node ?? node);
        }

        for (const call of calls) {
          // Error should be the second parameter, if not present stop processing
          const params = call.arguments.at(1);

          let errorMessageNode: TSESTree.Node | undefined;

          switch (params?.type) {
            case AST_NODE_TYPES.Literal:
            case AST_NODE_TYPES.TemplateLiteral:
              errorMessageNode = params;
              break;

            case AST_NODE_TYPES.ObjectExpression:
              errorMessageNode = params.properties.find(
                (property): property is TSESTree.Property =>
                  property.type === AST_NODE_TYPES.Property &&
                  getStaticPropertyName(property) === 'error',
              )?.value;
              break;

            // no default
          }

          if (
            !errorMessageNode ||
            esquery.matches(errorMessageNode as never, parsedSelector, errorMessageNode as never)
          ) {
            continue;
          }

          context.report({
            node: call,
            messageId: 'invalidStyle',
            data: {
              selector,
              example,
              actual: context.sourceCode.getText(errorMessageNode),
            },
          });
        }
      },
    });
  };
}
