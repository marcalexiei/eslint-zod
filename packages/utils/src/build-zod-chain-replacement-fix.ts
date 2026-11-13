import type { TSESTree } from '@typescript-eslint/types';

import { hasCommentInRange } from './has-comment-in-range.js';
import { hasParenthesizedReceiver } from './has-parenthesized-receiver.js';
import type { RuleFix, RuleFixer, SourceCode } from './rule-types.js';

/**
 * Replaces the chain from its factory to `toIndex` with a top-level call, keeping the methods in between:
 * `z.number().min(1).int()` → `z.int().min(1)`.
 */
export function buildZodChainReplacementFix(opts: {
  sourceCode: SourceCode;
  fixer: RuleFixer;
  methods: Array<{ name: string; node: TSESTree.CallExpression }>;
  toIndex: number;
  toMethodName: string;
}): RuleFix | null {
  const { sourceCode, fixer, methods, toIndex, toMethodName } = opts;
  const fromNode = methods.at(0)?.node;
  const toNode = methods.at(toIndex)?.node;
  if (!fromNode || !toNode) {
    return null;
  }

  // The suffixes below are sliced by text, which a parenthesized receiver would throw off.
  const memberOf = (node: TSESTree.CallExpression): TSESTree.MemberExpression =>
    node.callee as TSESTree.MemberExpression;
  if (methods.slice(1, toIndex + 1).some((it) => hasParenthesizedReceiver(memberOf(it.node)))) {
    return null;
  }

  // The replacement is rebuilt from pieces, so a comment anywhere in the range could be lost.
  const range: TSESTree.Range = [fromNode.range[0], toNode.range[1]];
  if (hasCommentInRange(sourceCode, range)) {
    return null;
  }

  const namespace = sourceCode.getText(memberOf(fromNode).object);
  const args = toNode.arguments.map((arg) => sourceCode.getText(arg)).join(', ');
  // Each method in between keeps its `.name(args)` suffix: its text past the receiver's.
  const suffixes = methods
    .slice(1, toIndex)
    .map(({ node }) =>
      sourceCode.getText(node).slice(sourceCode.getText(memberOf(node).object).length),
    );

  return fixer.replaceTextRange(range, `${namespace}.${toMethodName}(${args})${suffixes.join('')}`);
}
