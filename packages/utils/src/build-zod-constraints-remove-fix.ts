import type { TSESTree } from '@typescript-eslint/types';

import { buildZodChainRemoveMethodFix } from './build-zod-chain-remove-method-fix.js';
import type { ZodSchemaConstraint } from './collect-zod-schema-constraints.js';
import type { RuleFix, RuleFixer, SourceCode } from './rule-types.js';

/**
 * Build the fixes that remove the given constraints from a zod chain,
 * whatever their API style:
 *
 * - `chained` constraints are removed as chain methods
 *   (`z.array(x).min(2)` → `z.array(x)`);
 * - `check-argument` constraints are removed by deleting the containing
 *   `.check(...)` call — but only when every argument of that call is
 *   targeted, so removal never orphans an unrelated check argument.
 *
 * Pass each constraint at most once. Returns `null` when the constraints
 * cannot be removed safely (partial `.check(...)` coverage, unfixable chain
 * position); callers should then report without fixing.
 */
export function buildZodConstraintsRemoveFix(opts: {
  fixer: RuleFixer;
  /** Chain items from `collectZodChainMethods`, factory first. */
  methods: Array<{ name: string; node: TSESTree.CallExpression }>;
  constraints: Array<ZodSchemaConstraint>;
  /** When given, a removal that would drop a comment returns `null`. */
  sourceCode?: Pick<SourceCode, 'getAllComments'>;
}): Array<RuleFix> | null {
  const { fixer, methods, constraints, sourceCode } = opts;

  const fixes: Array<RuleFix> = [];
  // chainIndex of a `.check(...)` call → how many of its arguments are
  // targeted, and how many arguments it has in total.
  const checkRemovals = new Map<number, { targeted: number; argumentCount: number }>();

  for (const constraint of constraints) {
    if (constraint.origin === 'chained') {
      const fix = buildZodChainRemoveMethodFix({
        fixer,
        methods,
        removeIndex: constraint.chainIndex,
        sourceCode,
      });
      if (fix === null) {
        return null;
      }
      fixes.push(fix);
      continue;
    }

    const entry = checkRemovals.get(constraint.chainIndex);
    if (entry) {
      entry.targeted += 1;
    } else {
      checkRemovals.set(constraint.chainIndex, {
        targeted: 1,
        argumentCount: constraint.argumentCount,
      });
    }
  }

  for (const [chainIndex, { targeted, argumentCount }] of checkRemovals) {
    if (targeted !== argumentCount) {
      return null;
    }

    const fix = buildZodChainRemoveMethodFix({
      fixer,
      methods,
      removeIndex: chainIndex,
      sourceCode,
    });
    if (fix === null) {
      return null;
    }
    fixes.push(fix);
  }

  return fixes;
}
