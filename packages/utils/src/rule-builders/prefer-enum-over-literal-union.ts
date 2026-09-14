import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

export function buildPreferEnumOverLiteralUnionCreate(
  scope: ZodImportScope,
): (context: Readonly<TSESLint.RuleContext<'useEnum', []>>) => TSESLint.RuleListener {
  return function create(context) {
    const { createSchemaVisitor, detectZodSchemaRootNode, collectZodChainMethods } =
      scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: 'union',
      onSchema(node, zodSchemaMeta): void {
        const methods = collectZodChainMethods(node);
        const union = methods.find((it) => it.name === 'union');

        if (!union) {
          return;
        }

        const unionNode = union.node;

        const unionArgument = unionNode.arguments.at(0);
        if (unionArgument?.type !== AST_NODE_TYPES.ArrayExpression) {
          return;
        }

        const zodLiteralStrings = unionArgument.elements.map<string | null>((s) => {
          if (!s) {
            return null;
          }

          if (s.type !== AST_NODE_TYPES.CallExpression) {
            return null;
          }

          const maybeLiteralSchema = detectZodSchemaRootNode(s);
          if (maybeLiteralSchema?.schemaType !== 'literal') {
            return null;
          }

          // `z.literal()` with no argument is invalid zod but valid JS.
          const literalArgument = s.arguments.at(0);
          if (
            literalArgument?.type === AST_NODE_TYPES.Literal &&
            // Literal could be also a number
            typeof literalArgument.value === 'string'
          ) {
            // Use raw to keep the string format consistent with the original source
            return literalArgument.raw;
          }

          return null;
        });

        if (zodLiteralStrings.some((it) => it === null)) {
          return;
        }

        context.report({
          node,
          messageId: 'useEnum',
          fix(fixer) {
            if (zodSchemaMeta.schemaDecl === 'named') {
              return null;
            }

            return [
              fixer.replaceText((unionNode.callee as TSESTree.MemberExpression).property, 'enum'),
              fixer.replaceText(unionNode.arguments[0], `[${zodLiteralStrings.join(', ')}]`),
            ];
          },
        });
      },
    });
  };
}
