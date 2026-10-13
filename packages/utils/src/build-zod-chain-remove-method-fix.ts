import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { hasCommentInRange } from './has-comment-in-range.js';
import { hasParenthesizedReceiver } from './has-parenthesized-receiver.js';
import type { RuleFix, RuleFixer, SourceCode } from './rule-types.js';

/**
 * Remove one call from a zod method chain, e.g. `z.number().min(0).finite()` →
 * `z.number().min(0)`.
 *
 * Returns `null` when the call's receiver is parenthesized (`(z.number()).finite()`),
 * or, given a `sourceCode`, when a comment sits in the removed text.
 */
export function buildZodChainRemoveMethodFix(opts: {
  fixer: RuleFixer;
  methods: Array<{ name: string; node: TSESTree.CallExpression }>;
  removeIndex: number;
  sourceCode?: Pick<SourceCode, 'getAllComments'>;
}): RuleFix | null {
  const { fixer, methods, removeIndex, sourceCode } = opts;

  if (removeIndex < 1) {
    return null;
  }

  // prettier-ignore
  const prev = methods[removeIndex - 1]?.node as TSESTree.CallExpression | undefined;
  // prettier-ignore
  const toRemove = methods[removeIndex]?.node as TSESTree.CallExpression | undefined;

  if (!prev?.range || !toRemove?.range) {
    return null;
  }

  if (
    toRemove.callee.type === AST_NODE_TYPES.MemberExpression &&
    hasParenthesizedReceiver(toRemove.callee)
  ) {
    return null;
  }

  const range: TSESTree.Range = [prev.range[1], toRemove.range[1]];
  if (sourceCode && hasCommentInRange(sourceCode, range)) {
    return null;
  }

  return fixer.removeRange(range);
}
