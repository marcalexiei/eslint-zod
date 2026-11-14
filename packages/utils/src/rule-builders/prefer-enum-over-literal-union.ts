import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { hasCommentInRange } from '../has-comment-in-range.js';
import { readsZodSchemaProperty } from '../reads-zod-schema-property.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

export function buildPreferEnumOverLiteralUnionCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<'useEnum'>>) => RuleListener {
  return function create(context) {
    const { createSchemaVisitor, detectZodSchemaRootNode, collectZodChainMethods } =
      scope.createTracker({ kind: 'value' });

    /** A bare `z.literal('…')`'s source text: a chained method or a params argument would be lost. */
    function literalText(element: TSESTree.ArrayExpression['elements'][number]): string | null {
      if (
        element?.type !== AST_NODE_TYPES.CallExpression ||
        detectZodSchemaRootNode(element)?.schemaType !== 'literal' ||
        collectZodChainMethods(element).length !== 1 ||
        element.arguments.length !== 1
      ) {
        return null;
      }
      const [argument] = element.arguments;
      return argument.type === AST_NODE_TYPES.Literal && typeof argument.value === 'string'
        ? argument.raw
        : null;
    }

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
        if (
          unionArgument?.type !== AST_NODE_TYPES.ArrayExpression ||
          unionArgument.elements.length === 0
        ) {
          return;
        }

        const zodLiteralStrings = unionArgument.elements.map(literalText);
        if (zodLiteralStrings.some((it) => it === null)) {
          return;
        }

        context.report({
          node,
          messageId: 'useEnum',
          fix(fixer) {
            // The property being read may not exist on the schema the fix builds.
            if (readsZodSchemaProperty(node, zodSchemaMeta)) {
              return null;
            }

            if (zodSchemaMeta.schemaDecl === 'named' || !union.member) {
              return null;
            }

            // The member list is rewritten from the literal values alone.
            if (hasCommentInRange(context.sourceCode, unionArgument.range)) {
              return null;
            }

            return [
              fixer.replaceText(union.member.property, 'enum'),
              fixer.replaceText(unionArgument, `[${zodLiteralStrings.join(', ')}]`),
            ];
          },
        });
      },
    });
  };
}
