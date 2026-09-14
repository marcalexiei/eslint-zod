import { zodImportScope } from '@eslint-zod/utils';
import type { TSESTree } from '@typescript-eslint/utils';

import { createZodPluginRule } from '../utils/create-plugin-rule.js';

const preferredMethods = ['none', 'default', 'optional'] as const;

type PreferredMethod = (typeof preferredMethods)[number];

interface Options {
  preferredMethod: PreferredMethod;
}

type MessageIds = 'noOptionalAndDefaultTogether' | 'noOptionalAndDefaultTogetherRemoveMethod';

const defaultOptions: Options = { preferredMethod: 'none' };

export const noOptionalAndDefaultTogether = createZodPluginRule<[Options], MessageIds>({
  name: 'no-optional-and-default-together',
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Disallow using both `.optional()` and `.default()` on the same Zod schema',
    },
    messages: {
      noOptionalAndDefaultTogether:
        'Using both `.optional()` and `.default()` is redundant. A schema with a default value is already optional.',
      noOptionalAndDefaultTogetherRemoveMethod:
        'Using both `.optional()` and `.default()` is redundant. Remove the `.{{method}}()` method to avoid redundancy.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          preferredMethod: {
            description: 'Determines which method to keep when both are present',
            type: 'string',
            enum: [...preferredMethods],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [defaultOptions],
  create(context, [{ preferredMethod }]) {
    const { sourceCode } = context;

    const { createSchemaVisitor, collectZodChainMethods } = zodImportScope.createTracker({
      kind: 'value',
    });

    return createSchemaVisitor({
      onSchema(node): void {
        // Collect all methods in the chain
        const methods = collectZodChainMethods(node);

        if (methods.length === 0) {
          return;
        }

        const optionalMethod = methods.find((m) => m.name === 'optional');
        const defaultMethod = methods.find((m) => m.name === 'default');

        // If not both methods are present stop processing the expression
        if (!optionalMethod || !defaultMethod) {
          return;
        }

        // Determine which node to report on (the one that appears later in the chain)
        const reportNode =
          methods.indexOf(optionalMethod) > methods.indexOf(defaultMethod)
            ? optionalMethod.node
            : defaultMethod.node;

        if (preferredMethod === 'none') {
          context.report({
            node: reportNode,
            messageId: 'noOptionalAndDefaultTogether',
          });
          return;
        }

        const methodToRemoveName: Exclude<PreferredMethod, 'none'> =
          preferredMethod === 'default' ? 'optional' : 'default';

        context.report({
          node: reportNode,
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: methodToRemoveName },
          fix(fixer) {
            // Determine which method to remove
            const nodeToRemove =
              preferredMethod === 'default' ? optionalMethod.node : defaultMethod.node;

            // Get the callee of the node to remove
            const calleeToRemove = nodeToRemove.callee as TSESTree.MemberExpression;

            // Replace the entire call expression with just its object
            return fixer.replaceText(nodeToRemove, sourceCode.getText(calleeToRemove.object));
          },
        });
      },
    });
  },
});
