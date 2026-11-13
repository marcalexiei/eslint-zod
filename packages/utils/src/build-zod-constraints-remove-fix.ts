import type { TSESTree } from '@typescript-eslint/types';

import { buildZodChainRemoveMethodFix } from './build-zod-chain-remove-method-fix.js';
import type { ZodSchemaConstraint } from './collect-zod-schema-constraints.js';
import type { RuleFix, RuleFixer, SourceCode } from './rule-types.js';

/**
 * The fixes removing `constraints` from a chain: a chained one as its method,
 * a check argument as its whole `.check(...)`, which every argument of must then be targeted.
 * Pass each constraint at most once; `null` when a removal is unsafe.
 */
export function buildZodConstraintsRemoveFix(opts: {
  fixer: RuleFixer;
  /** Chain items from `collectZodChainMethods`, factory first. */
  methods: Array<{ name: string; node: TSESTree.CallExpression }>;
  constraints: Array<ZodSchemaConstraint>;
  sourceCode: Pick<SourceCode, 'getAllComments'>;
}): Array<RuleFix> | null {
  const { fixer, methods, constraints, sourceCode } = opts;

  const partialCheck = constraints.some(
    (constraint) =>
      constraint.origin === 'check-argument' &&
      constraints.filter((it) => it.chainIndex === constraint.chainIndex).length !==
        constraint.argumentCount,
  );
  if (partialCheck) {
    return null;
  }

  const fixes = [...new Set(constraints.map((it) => it.chainIndex))].map((removeIndex) =>
    buildZodChainRemoveMethodFix({ fixer, methods, removeIndex, sourceCode }),
  );
  return fixes.every((fix) => fix !== null) ? fixes : null;
}
