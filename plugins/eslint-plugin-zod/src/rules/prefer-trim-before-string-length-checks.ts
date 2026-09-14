import { findParentSchemaMatchingCondition, zodImportScope } from '@eslint-zod/utils';
import type { TSESTree } from '@typescript-eslint/utils';

import { createZodPluginRule } from '../utils/create-plugin-rule.js';

const LENGTH_CHECK_METHODS = ['min', 'max', 'length'];

export const preferTrimBeforeStringLengthChecks = createZodPluginRule({
  name: 'prefer-trim-before-string-length-checks',
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description:
        'Enforce `.trim()` is called before string length checks to ensure accurate validation',
    },
    messages: {
      trimBeforeLengthCheck:
        '`.trim()` must be called before length checks (`.min()`, `.max()`, `.length()`) to ensure accurate validation.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = zodImportScope.createTracker({
      kind: 'value',
    });

    return createSchemaVisitor({
      schemaType: 'string',
      onSchema(node, zodSchemaMeta): void {
        // Skip string schema used as record key — trim on record keys causes data loss
        if (
          findParentSchemaMatchingCondition(node, {
            schemaName: 'record',
            condition: (callParent) =>
              callParent.arguments.length > 0 && callParent.arguments[0] === node,
          })
        ) {
          return;
        }

        const methods = collectZodChainMethods(node);

        const trimIndex = methods.findIndex((m) => m.name === 'trim');
        if (trimIndex === -1) {
          return;
        }

        const firstLengthCheckIndex = methods.findIndex((m) =>
          LENGTH_CHECK_METHODS.includes(m.name),
        );
        if (firstLengthCheckIndex === -1) {
          return;
        }

        if (trimIndex < firstLengthCheckIndex) {
          return;
        }

        context.report({
          node,
          messageId: 'trimBeforeLengthCheck',
          fix(fixer) {
            if (zodSchemaMeta.schemaDecl === 'named') {
              return null;
            }

            const stringMethodNode = methods[0].node;
            const trimMethodNode = methods[trimIndex].node;
            const trimCallee = trimMethodNode.callee as TSESTree.MemberExpression;

            return [
              fixer.removeRange([trimCallee.object.range[1], trimMethodNode.range[1]]),
              fixer.insertTextAfter(stringMethodNode, '.trim()'),
            ];
          },
        });
      },
    });
  },
});
