import type { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'noCoerceBoolean' | 'useStringbool';

export function buildNoCoerceBooleanCreate(
  scope: ZodImportScope,
): (context: Readonly<TSESLint.RuleContext<MessageIds, []>>) => TSESLint.RuleListener {
  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({ kind: 'value' });

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
        // Empty for a computed factory (`z.coerce['boolean']()`), which detection still resolves —
        // report it, just without the suggestion.
        const factoryCallee = collectZodChainMethods(node).at(0)?.node.callee;

        if (
          zodSchemaMeta.schemaDecl !== 'namespace' ||
          factoryCallee?.type !== AST_NODE_TYPES.MemberExpression ||
          factoryCallee.object.type !== AST_NODE_TYPES.MemberExpression
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
              fix(fixer): TSESLint.RuleFix {
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
