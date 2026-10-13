import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { hasCommentInRange } from './has-comment-in-range.js';
import type { RuleFix, RuleFixer, SourceCode } from './rule-types.js';

/**
 * Replace a single-argument wrapper call with its argument, e.g.
 * `z.readonly(z.string())` → `z.string()`. Any chain on the wrapper is
 * preserved (`z.readonly(z.string()).check(…)` → `z.string().check(…)`).
 *
 * Returns `null`, so callers report without fixing, when:
 * - the call does not have exactly one non-spread argument;
 * - the argument is not an identifier, a member or a call —
 *   anything else (`a ? b : c`, `await x`) could need parentheses where the wrapper stood,
 *   unless the wrapper is itself an argument (`z.optional(z.nullable(a ? b : c))`);
 * - a comment inside the wrapper would be dropped.
 */
export function buildZodWrapperUnwrapFix(opts: {
  fixer: RuleFixer;
  sourceCode: Readonly<SourceCode>;
  wrapperCall: TSESTree.CallExpression;
}): RuleFix | null {
  const { fixer, sourceCode, wrapperCall } = opts;

  if (wrapperCall.arguments.length !== 1) {
    return null;
  }

  const [inner] = wrapperCall.arguments;
  if (inner.type === AST_NODE_TYPES.SpreadElement) {
    return null;
  }

  const isSelfContained =
    inner.type === AST_NODE_TYPES.Identifier ||
    inner.type === AST_NODE_TYPES.MemberExpression ||
    inner.type === AST_NODE_TYPES.CallExpression;
  // An argument slot takes any expression but a sequence, whose parentheses the text does not carry.
  const fitsArgumentSlot =
    wrapperCall.parent.type === AST_NODE_TYPES.CallExpression &&
    wrapperCall.parent.arguments.includes(wrapperCall) &&
    inner.type !== AST_NODE_TYPES.SequenceExpression;
  if (!isSelfContained && !fitsArgumentSlot) {
    return null;
  }

  // Only the argument's text survives.
  if (
    hasCommentInRange(sourceCode, [wrapperCall.range[0], inner.range[0]]) ||
    hasCommentInRange(sourceCode, [inner.range[1], wrapperCall.range[1]])
  ) {
    return null;
  }

  return fixer.replaceText(wrapperCall, sourceCode.getText(inner));
}
