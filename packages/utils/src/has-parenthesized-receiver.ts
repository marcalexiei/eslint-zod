import type { TSESTree } from '@typescript-eslint/types';

/**
 * Whether the object of a member expression is wrapped in parentheses: `(z.string()).min(1)`.
 * A fixer that cuts at the object's end would leave the closing parenthesis behind,
 * so callers withhold the fix instead.
 */
export function hasParenthesizedReceiver(member: TSESTree.MemberExpression): boolean {
  return member.range[0] !== member.object.range[0];
}
