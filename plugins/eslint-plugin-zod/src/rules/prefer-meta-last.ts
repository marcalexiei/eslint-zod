import { zodImportScope } from '@eslint-zod/utils';
import type { TSESTree } from '@typescript-eslint/utils';

import { createZodPluginRule } from '../utils/create-plugin-rule.js';

export const preferMetaLast = createZodPluginRule({
  name: 'prefer-meta-last',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce `.meta()` as last method',
    },
    fixable: 'code',
    messages: {
      metaNotLast: 'The `.meta()` methods should be the last one called',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = zodImportScope.createTracker({
      kind: 'value',
    });

    return createSchemaVisitor({
      // If not inside a schema root AND doesn't look like a zod chain, bail out.
      // This preserves previous behavior while allowing standalone zod chains to be processed.
      onSchema(node): void {
        // Collect the full chain methods
        const chain = collectZodChainMethods(node);

        // Find the first meta() in the chain
        const metaIndex = chain.findIndex((c) => c.name === 'meta');
        if (metaIndex === -1) {
          return;
        }

        // If there are only meta() calls after the first meta -> valid (allow multiple metas at end)
        const hasAnyNonMetaAfter = chain.slice(metaIndex + 1).some((c) => c.name !== 'meta');
        if (!hasAnyNonMetaAfter) {
          return;
        }

        // Report the first offending `.meta(...)`
        const metaCall = chain[metaIndex].node;

        const metaCallCallee = metaCall.callee as TSESTree.MemberExpression;

        context.report({
          node: metaCallCallee.property,
          messageId: 'metaNotLast',
          fix(fixer) {
            const source = context.sourceCode;

            // "z.string().meta({...})"
            const metaCallText = source.getText(metaCall);

            // Extract ONLY ".meta(...)" from the call text:
            // The metaCall.callee.object gives us the part BEFORE `.meta`
            const objectText = source.getText(metaCallCallee.object);
            const onlyMetaSuffix = metaCallText.slice(objectText.length); // => ".meta({...})"

            // Remove `.meta(...)` where it currently is
            const [, removeStart] = metaCallCallee.object.range;
            const [, removeEnd] = metaCall.range;

            // Last call in the chain:
            const lastCall = chain[chain.length - 1].node;

            return [
              fixer.removeRange([removeStart, removeEnd]),
              fixer.insertTextAfterRange(lastCall.range, onlyMetaSuffix),
            ];
          },
        });
      },
    });
  },
});
