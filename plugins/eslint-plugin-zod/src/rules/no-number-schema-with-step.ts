import { getZodChainedMethodNames, zodImportScope } from '@eslint-zod/utils';
import type { TSESTree } from '@typescript-eslint/utils';

import { createZodPluginRule } from '../utils/create-plugin-rule.js';

export const noNumberSchemaWithStep = createZodPluginRule({
  name: 'no-number-schema-with-step',
  meta: {
    fixable: 'code',
    type: 'problem',
    docs: {
      description: 'Disallow deprecated `z.number().step()`. Use `.multipleOf()` instead.',
    },
    messages: {
      useMultipleOf: '`.step()` is deprecated. Use `.multipleOf()` with the same argument instead.',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = zodImportScope.createTracker({
      kind: 'value',
    });

    return createSchemaVisitor({
      schemaType: 'number',
      onSchema(node, zodSchemaMeta): void {
        // Detect on the names alone: they exclude the factory,
        // so an aliased named import (`import { number as step }`) is not mistaken for a `.step()` call,
        // and a computed factory (`z['number']().step(5)`) is still caught even though the chain walker cannot name it.
        if (!getZodChainedMethodNames(zodSchemaMeta).includes('step')) {
          return;
        }

        const methods = collectZodChainMethods(node);
        // Skip index 0 — that item is the `number()` factory itself.
        const stepIndex = methods.findIndex((m, index) => index > 0 && m.name === 'step');

        // Rename the `step` call's own property, not the chain's outermost one:
        // in `z.number().step(5).min(0)` the outermost callee is `.min`.
        // Past index 0 the callee is always a plain-identifier member expression —
        // that is the only shape `collectZodChainMethods` names.
        const property =
          stepIndex === -1
            ? null
            : (
                methods[stepIndex].node.callee as TSESTree.MemberExpression & {
                  property: TSESTree.Identifier;
                }
              ).property;

        context.report({
          node,
          messageId: 'useMultipleOf',
          fix(fixer) {
            // A computed factory leaves no nameable `.step()` node to rename.
            return property === null ? null : fixer.replaceText(property, 'multipleOf');
          },
        });
      },
    });
  },
});
