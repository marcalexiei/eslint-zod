import type { ZodExportName, ZodMethodName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';

import type { ZodSchemaConstraint } from './collect-zod-schema-constraints.js';

/** Checks whose callback may rewrite the value. */
export const CALLBACK_CHECK_NAMES: ReadonlySet<string> = new Set<ZodExportName | ZodMethodName>([
  'check',
  'superRefine',
]);

/** Chain indexes of `.check(...)` / `.with(...)` calls carrying an argument that is not a recognized zod call. */
export function getOpaqueCheckChainIndexes(
  methods: ReadonlyArray<{ name: string; node: TSESTree.CallExpression }>,
  constraints: ReadonlyArray<ZodSchemaConstraint>,
): Array<number> {
  return methods.flatMap((method, chainIndex) =>
    (method.name === 'check' || method.name === 'with') &&
    method.node.arguments.length !== constraints.filter((it) => it.chainIndex === chainIndex).length
      ? [chainIndex]
      : [],
  );
}

/**
 * Whether a check between two chain positions may rewrite the value without its name saying so:
 * a `.check(...)` argument that is not a zod call (`trimIt`, a callback, a spread),
 * or a callback check (`z.check(fn)`, `.superRefine(fn)`).
 */
export function hasOpaqueZodCheck(opts: {
  methods: Array<{ name: string; node: TSESTree.CallExpression }>;
  constraints: Array<ZodSchemaConstraint>;
  fromChainIndex: number;
  toChainIndex: number;
}): boolean {
  const { methods, constraints, fromChainIndex, toChainIndex } = opts;
  const isInRange = (chainIndex: number): boolean =>
    chainIndex >= fromChainIndex && chainIndex <= toChainIndex;

  return (
    getOpaqueCheckChainIndexes(methods, constraints).some(isInRange) ||
    constraints.some((it) => isInRange(it.chainIndex) && CALLBACK_CHECK_NAMES.has(it.name))
  );
}
