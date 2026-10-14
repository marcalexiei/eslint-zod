import { ZOD_TYPE_CHANGING_METHODS, hasCommentInRange, zodImportScope } from '@eslint-zod/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { createZodPluginRule } from '../meta.js';

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

        // Pair the two only on the same schema:
        // in `z.string().optional().array().default([])` they sit on either side of a type change.
        let optionalMethod: (typeof methods)[number] | undefined;
        let defaultMethod: (typeof methods)[number] | undefined;
        for (const method of methods) {
          if (ZOD_TYPE_CHANGING_METHODS.includes(method.name)) {
            optionalMethod = undefined;
            defaultMethod = undefined;
          } else if (method.name === 'optional') {
            optionalMethod ??= method;
          } else if (method.name === 'default') {
            defaultMethod ??= method;
          }

          if (optionalMethod && defaultMethod) {
            break;
          }
        }

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
            const nodeToRemove =
              preferredMethod === 'default' ? optionalMethod.node : defaultMethod.node;
            const calleeToRemove = nodeToRemove.callee;

            // The wrapper form (`z.optional(schema)`, `optional(schema)`) has no chained call to remove.
            if (
              calleeToRemove.type !== AST_NODE_TYPES.MemberExpression ||
              calleeToRemove.object.type === AST_NODE_TYPES.Identifier
            ) {
              return null;
            }

            // Only the receiver's text is kept.
            if (
              hasCommentInRange(sourceCode, [calleeToRemove.object.range[1], nodeToRemove.range[1]])
            ) {
              return null;
            }

            // Replace the entire call expression with just its object
            return fixer.replaceText(nodeToRemove, sourceCode.getText(calleeToRemove.object));
          },
        });
      },
    });
  },
});
