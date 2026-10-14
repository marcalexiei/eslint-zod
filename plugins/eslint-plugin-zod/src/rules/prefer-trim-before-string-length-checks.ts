import { hasCommentInRange, hasParenthesizedReceiver, zodImportScope } from '@eslint-zod/utils';
import type { TSESTree } from '@typescript-eslint/types';

import { createZodPluginRule } from '../meta.js';
import { isRecordKeySchema } from '../utils/is-record-key-schema.js';

const LENGTH_CHECK_METHODS = ['min', 'max', 'length', 'nonempty'];

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
        '`.trim()` must be called before length checks (`.min()`, `.max()`, `.length()`, `.nonempty()`) to ensure accurate validation.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { createSchemaVisitor, collectZodChainMethods, isZodSchemaOfType } =
      zodImportScope.createTracker({
        kind: 'value',
      });

    return createSchemaVisitor({
      schemaType: 'string',
      onSchema(node, zodSchemaMeta): void {
        if (isRecordKeySchema(node, isZodSchemaOfType)) {
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
            const { node: trimMethodNode, member: trimCallee } = methods[trimIndex];
            // Cutting at a parenthesized receiver's end would leave its closing parenthesis behind.
            if (
              zodSchemaMeta.schemaDecl === 'named' ||
              !trimCallee ||
              hasParenthesizedReceiver(trimCallee)
            ) {
              return null;
            }

            const trimRange: TSESTree.Range = [trimCallee.object.range[1], trimMethodNode.range[1]];
            if (hasCommentInRange(context.sourceCode, trimRange)) {
              return null;
            }

            const stringMethodNode = methods[0].node;

            return [
              fixer.removeRange(trimRange),
              fixer.insertTextAfter(stringMethodNode, '.trim()'),
            ];
          },
        });
      },
    });
  },
});
