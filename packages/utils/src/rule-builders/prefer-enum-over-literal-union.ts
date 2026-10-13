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

          // Only a bare `literal(value)` maps onto an enum member:
          // a chained method (`.describe()`) or a params argument would be lost,
          // and `s` is then that outer call rather than the `literal()` one.
          if (collectZodChainMethods(s).length !== 1 || s.arguments.length !== 1) {
            return null;
          }

          const [literalArgument] = s.arguments;
          if (
            literalArgument.type === AST_NODE_TYPES.Literal &&
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
              fixer.replaceText(unionNode.arguments[0], `[${zodLiteralStrings.join(', ')}]`),
            ];
          },
        });
      },
    });
  };
}
