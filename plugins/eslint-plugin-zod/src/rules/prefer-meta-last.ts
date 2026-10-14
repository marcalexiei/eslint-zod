import {
  ZOD_NON_SCHEMA_PRODUCING_METHODS,
  hasCommentInRange,
  hasParenthesizedReceiver,
  zodImportScope,
} from '@eslint-zod/utils';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { createZodPluginRule } from '../meta.js';

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
        const fullChain = collectZodChainMethods(node);

        // `.parse(x)` and its kin end the schema: what follows is not a schema method.
        const end = fullChain.findIndex(
          (c, index) => index > 0 && ZOD_NON_SCHEMA_PRODUCING_METHODS.includes(c.name),
        );
        const chain = end === -1 ? fullChain : fullChain.slice(0, end);

        // A `meta` called bare or on the namespace is a factory, not the `.meta()` method.
        const metaMembers = chain.map((c) =>
          c.name === 'meta' && c.member?.object.type !== AST_NODE_TYPES.Identifier
            ? c.member
            : null,
        );

        // Trailing `.meta()` calls are fine; the ones before the last other method are not.
        const lastOtherIndex = metaMembers.lastIndexOf(null);
        const misplaced = chain.flatMap((c, index) => {
          const member = metaMembers[index];
          return member && index < lastOtherIndex ? [{ node: c.node, member }] : [];
        });
        if (misplaced.length === 0) {
          return;
        }

        context.report({
          node: misplaced[0].member.property,
          messageId: 'metaNotLast',
          fix(fixer) {
            // Cutting at the receiver's end would leave a closing parenthesis behind.
            if (misplaced.some((it) => hasParenthesizedReceiver(it.member))) {
              return null;
            }

            const source = context.sourceCode;
            const removals = misplaced.map((it): TSESTree.Range => [
              it.member.object.range[1],
              it.node.range[1],
            ]);
            // The text between the receiver and `.meta` is dropped by the move.
            if (
              misplaced.some((it) =>
                hasCommentInRange(source, [it.member.object.range[1], it.member.property.range[0]]),
              )
            ) {
              return null;
            }

            // Moved together and in order, so a later `.meta()` still overrides an earlier one.
            const suffix = misplaced
              .map((it) => source.getText(it.node).slice(source.getText(it.member.object).length))
              .join('');

            return [
              ...removals.map((range) => fixer.removeRange(range)),
              fixer.insertTextAfterRange(chain[lastOtherIndex].node.range, suffix),
            ];
          },
        });
      },
    });
  },
});
