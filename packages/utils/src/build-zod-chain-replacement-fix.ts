import type { TSESTree } from '@typescript-eslint/types';

import { hasCommentInRange } from './has-comment-in-range.js';
import { hasParenthesizedReceiver } from './has-parenthesized-receiver.js';
import type { RuleFix, RuleFixer, SourceCode } from './rule-types.js';

/**
 * Utility to generate a fixer for replacing a method chain like z.string().uuid() or z.number().int()
 * with z.uuid() or z.int(), preserving any intermediate methods.
 *
 * @param opts Object containing all options for the fixer
 * @returns Fixer replaceTextRange call
 */
export function buildZodChainReplacementFix(opts: {
  sourceCode: SourceCode;
  fixer: RuleFixer;
  methods: Array<{ name: string; node: TSESTree.CallExpression }>;
  fromIndex: number;
  toIndex: number;
  toMethodName: string;
}): RuleFix | null {
  const { sourceCode, fixer, methods, fromIndex, toIndex, toMethodName } = opts;
  // prettier-ignore
  const fromNode = methods[fromIndex]?.node as TSESTree.CallExpression | undefined;
  // prettier-ignore
  const toNode = methods[toIndex]?.node as TSESTree.CallExpression | undefined;

  if (!fromNode || !toNode) {
    return null;
  }

  // The suffixes below are sliced by text, which a parenthesized receiver would throw off.
  if (
    methods
      .slice(fromIndex + 1, toIndex + 1)
      .some((m) => hasParenthesizedReceiver(m.node.callee as TSESTree.MemberExpression))
  ) {
    return null;
  }

  // The replacement is rebuilt from pieces, so a comment anywhere in the range could be lost.
  const range: TSESTree.Range = [fromNode.range[0], toNode.range[1]];
  if (hasCommentInRange(sourceCode, range)) {
    return null;
  }

  // prefix is the namespace (e.g. "z")
  const fromCallee = fromNode.callee as TSESTree.MemberExpression;
  const prefixObj = fromCallee.object;
  const prefixText = sourceCode.getText(prefixObj);

  // Methods between number and int should be moved after .int()
  // Example: z.number().min(1).int() -> methodsBetween = [min]
  const methodsBetween = methods.slice(fromIndex + 1, toIndex);

  // For each intermediate method, extract only its ".name(args…)" suffix.
  // We do this by taking full text of the call expression and slicing off
  // the text of its callee.object (the part before the dot).
  const betweenSuffixes = methodsBetween.map((m) => {
    const betweenCallee = m.node.callee as TSESTree.MemberExpression;
    const objText = sourceCode.getText(betweenCallee.object);
    const fullText = sourceCode.getText(m.node);
    return fullText.slice(objText.length);
  });

  // Construct replacement: z.toMethodName() + betweenSuffixes
  let replacement = `${prefixText}.${toMethodName}(`;

  // Rebuild parameters
  if (toNode.arguments.length) {
    const argsText = toNode.arguments.map((arg) => sourceCode.getText(arg)).join(', ');

    replacement += argsText;
  }

  replacement += `)${betweenSuffixes.join('')}`;

  return fixer.replaceTextRange(range, replacement);
}
