import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { hasCommentInRange } from '../has-comment-in-range.js';
import { isZodFactoryChainItem } from '../is-zod-factory-chain-item.js';
import type { RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'noCoerceBoolean' | 'useStringbool';

export function buildNoCoerceBooleanCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods, isZodImportName } = scope.createTracker({
      kind: 'value',
    });

    return createSchemaVisitor({
      schemaType: 'coerce',
      onSchema(node, zodSchemaMeta): void {
        // The method invoked on `coerce`.
        // For namespace style (`z.coerce.boolean()`) the chain is `['coerce', 'boolean', ...]`;
        // for a named `coerce` import (`coerce.boolean()`) the chain is `['boolean', ...]`.
        const coerceIndex = zodSchemaMeta.methods.indexOf('coerce');
        const coercedType = zodSchemaMeta.methods[coerceIndex + 1];

        if (coercedType !== 'boolean') {
          return;
        }

        // `z.coerce.boolean()` can be rewritten to `z.stringbool()`,
        // the dedicated string→boolean codec that maps `"true"`/`"false"` (and similar pairs) explicitly.
        // This is only offered for the namespace form,
        // since the named `coerce.boolean()` form would require introducing a `stringbool` import.
        // Empty for a computed factory (`z.coerce['boolean']()`), which detection still resolves,
        // and resumed at a method after a property access (`z.coerce.boolean().def.type.toString()`) —
        // report it, just without the suggestion.
        const head = collectZodChainMethods(node).at(0);
        const factoryCallee =
          head && isZodFactoryChainItem(head, isZodImportName) ? head.member : null;

        if (
          zodSchemaMeta.schemaDecl !== 'namespace' ||
          factoryCallee?.object.type !== AST_NODE_TYPES.MemberExpression ||
          // the suggestion rewrites the whole callee
          hasCommentInRange(context.sourceCode, factoryCallee.range)
        ) {
          context.report({
            node,
            messageId: 'noCoerceBoolean',
          });
          return;
        }

        const namespaceNode = factoryCallee.object.object;

        context.report({
          node,
          messageId: 'noCoerceBoolean',
          suggest: [
            {
              messageId: 'useStringbool',
              fix(fixer): RuleFix {
                const namespaceText = context.sourceCode.getText(namespaceNode);
                return fixer.replaceText(factoryCallee, `${namespaceText}.stringbool`);
              },
            },
          ],
        });
      },
    });
  };
}
