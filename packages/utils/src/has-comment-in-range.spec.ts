import { describe, expect, it } from 'vitest';

import { hasCommentInRange } from './has-comment-in-range.js';
import type { SourceCode } from './rule-types.js';

const sourceCode = {
  getAllComments: () => [{ range: [10, 20] }],
} as unknown as SourceCode;

describe('hasCommentInRange', () => {
  it('is true when a comment lies inside the range', () => {
    expect(hasCommentInRange(sourceCode, [5, 25])).toBe(true);
  });

  it('is false when the comment starts before or ends after the range', () => {
    expect(hasCommentInRange(sourceCode, [12, 25])).toBe(false);
    expect(hasCommentInRange(sourceCode, [5, 15])).toBe(false);
  });
});
