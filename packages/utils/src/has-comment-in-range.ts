import type { TSESTree } from '@typescript-eslint/types';

import type { SourceCode } from './rule-types.js';

/**
 * Whether a comment sits inside `range`.
 * A fixer that removes or rewrites the range would drop it, so callers withhold the fix instead.
 */
export function hasCommentInRange(
  sourceCode: Pick<SourceCode, 'getAllComments'>,
  [start, end]: TSESTree.Range,
): boolean {
  return sourceCode
    .getAllComments()
    .some((comment) => comment.range[0] >= start && comment.range[1] <= end);
}
