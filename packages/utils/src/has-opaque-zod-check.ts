import type { TSESTree } from '@typescript-eslint/types';

import type { ZodSchemaConstraint } from './collect-zod-schema-constraints.js';

/** Checks whose callback may rewrite the value. */
const CALLBACK_CHECK_NAMES: ReadonlyArray<string> = ['check', 'superRefine'];

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
    methods.some(
      (method, chainIndex) =>
        (method.name === 'check' || method.name === 'with') &&
        isInRange(chainIndex) &&
        method.node.arguments.length !==
          constraints.filter((it) => it.chainIndex === chainIndex).length,
    ) ||
    constraints.some((it) => isInRange(it.chainIndex) && CALLBACK_CHECK_NAMES.includes(it.name))
  );
}
