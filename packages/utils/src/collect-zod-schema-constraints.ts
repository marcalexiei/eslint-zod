import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ZodSchemaMeta } from './detect-zod-schema-root-node.js';

interface ZodSchemaConstraintBase {
  /**
   * Constraint name as written in the source,
   * e.g. `'min'` for a chained `.min(2)` or `'minLength'` for `z.minLength(2)` inside `.check(...)`.
   *
   * Names are intentionally NOT canonicalized:
   * the meaning of a chained name depends on the base type (`.min()` is a length bound on strings/arrays but a value bound on numbers),
   * so mapping spellings to a shared vocabulary is left to each rule.
   */
  name: string;

  /** The call expression carrying the constraint's arguments. */
  node: TSESTree.CallExpression;

  /**
   * Index into the `collectZodChainMethods` list of the chain item this constraint belongs to:
   * the method itself for `chained` constraints,
   * the containing `.check(...)` call for `check-argument` constraints.
   */
  chainIndex: number;
}

export interface ZodChainedConstraint extends ZodSchemaConstraintBase {
  origin: 'chained';
}

export interface ZodCheckArgumentConstraint extends ZodSchemaConstraintBase {
  origin: 'check-argument';

  /** The `.check(...)` call expression containing this constraint. */
  checkNode: TSESTree.CallExpression;

  /** Position of this constraint among the `.check(...)` arguments. */
  argumentIndex: number;

  /**
   * Total number of arguments of the containing `.check(...)` call,
   * including arguments that were not recognized as zod check calls.
   */
  argumentCount: number;
}

/**
 * A single constraint applied to a zod schema, seen uniformly across the two API styles:
 * chained methods (`z.string().min(2)`, `zod`) and standalone checks passed to `.check(...)` (`z.string().check(z.minLength(2))`, `zod/mini`).
 * The two styles never appear in the same (valid) chain,
 * but the collector makes no assumption either way —
 * rule logic written against this type serves both plugins unchanged.
 */
export type ZodSchemaConstraint = ZodChainedConstraint | ZodCheckArgumentConstraint;

/**
 * Flattens a zod call chain into the list of constraints applied to the schema,
 * regardless of API style:
 *
 * - every chained method after the factory becomes a `chained` constraint
 * (`.check(...)` itself excluded);
 * - every recognized zod call among `.check(...)` arguments becomes a
 * `check-argument` constraint.
 * Non-call or unrecognized arguments are skipped,
 * but still counted in `argumentCount` so fixers can tell whether removing a whole `.check(...)` would orphan an unrelated argument.
 *
 * Internal:
 * rules use the bound `collectZodSchemaConstraints(node)` from `scope.createTracker({ kind: 'value' })`,
 * which supplies the chain and the detector.
 */
export function collectZodSchemaConstraints(opts: {
  /** Chain items from `collectZodChainMethods`, factory first. */
  methods: Array<{ name: string; node: TSESTree.CallExpression }>;

  /** Detector bound to the file's imports (see `detectZodSchemaRootNode`). */
  detectZodSchemaRootNode: (node: TSESTree.Node) => ZodSchemaMeta | null;
}): Array<ZodSchemaConstraint> {
  const { methods, detectZodSchemaRootNode } = opts;

  const constraints: Array<ZodSchemaConstraint> = [];

  for (const [chainIndex, method] of methods.entries()) {
    // Index 0 is the schema factory (or wrapper), not a constraint.
    if (chainIndex === 0) {
      continue;
    }

    if (method.name !== 'check') {
      constraints.push({
        name: method.name,
        node: method.node,
        origin: 'chained',
        chainIndex,
      });
      continue;
    }

    const checkArguments = method.node.arguments;
    for (const [argumentIndex, argument] of checkArguments.entries()) {
      if (argument.type !== AST_NODE_TYPES.CallExpression) {
        continue;
      }

      const checkMeta = detectZodSchemaRootNode(argument);
      if (!checkMeta) {
        continue;
      }

      constraints.push({
        name: checkMeta.schemaType,
        node: argument,
        origin: 'check-argument',
        chainIndex,
        checkNode: method.node,
        argumentIndex,
        argumentCount: checkArguments.length,
      });
    }
  }

  return constraints;
}
