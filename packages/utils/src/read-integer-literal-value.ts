import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

/**
 * Reads a non-negative integer literal, or `null` for anything else — rules
 * comparing check arguments must skip non-literal counts rather than guess.
 * Internal to `@eslint-zod/utils`.
 */
export function readIntegerLiteralValue(node: TSESTree.Node | null): number | null {
  if (node?.type !== AST_NODE_TYPES.Literal) {
    return null;
  }

  const { value } = node;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    return null;
  }

  return value;
}
