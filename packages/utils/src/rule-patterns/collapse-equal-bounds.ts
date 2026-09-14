import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { buildZodChainRemoveMethodFix } from '../build-zod-chain-remove-method-fix.js';
import type { ZodSchemaConstraint } from '../collect-zod-schema-constraints.js';
import type { ZodSchemaBaseType } from '../get-zod-schema-base-type.js';
import { getZodSchemaBaseType } from '../get-zod-schema-base-type.js';
import { readIntegerLiteralValue } from '../read-integer-literal-value.js';
import type { ZodCheckDomain } from '../zod-check-vocabulary.js';
import { canonicalizeZodConstraintName, getZodCheckDescriptor } from '../zod-check-vocabulary.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { ZOD_MUTATING_CHECK_NAMES } from '../zod-mutating-check-names.js';

/** Domains with an exact-form check to collapse into; `value` has none. */
export type CollapsibleBoundDomain = Extract<ZodCheckDomain, 'length' | 'size'>;

/** Total by type, so the lookup cannot miss. */
const EXACT_CHECK_BY_DOMAIN: Record<CollapsibleBoundDomain, string> = {
  length: 'length',
  size: 'size',
};

/** Options for {@link buildCollapseEqualBoundsCreate}. */
export interface CollapseEqualBoundsOptions<TMessageIds extends string> {
  scope: ZodImportScope;

  /** `getZodSchemaBaseType` values to apply to; `['string']` covers the top-level formats. */
  baseTypes: ReadonlyArray<ZodSchemaBaseType>;

  /** Which bounds pair up: string/array `length`, or set/map `size`. */
  domain: CollapsibleBoundDomain;

  /** Message reported on the schema. */
  messageId: TMessageIds;
}

interface DomainBound {
  /** Position in the constraint list, i.e. source order. */
  index: number;
  kind: 'lower' | 'upper' | 'exact';
  constraint: ZodSchemaConstraint;
}

/** The bound's count, or `null` when it is not a literal or carries a message. */
function readBoundValue(constraint: ZodSchemaConstraint): number | null {
  const { arguments: callArguments } = constraint.node;
  if (callArguments.length !== 1) {
    return null;
  }

  return readIntegerLiteralValue(callArguments[0]);
}

/**
 * Renames a bound call to the exact check: `.min(3)` → `.length(3)`,
 * `z.minLength(3)` → `z.length(3)`, `minLength(3)` → `length(3)`.
 * `null` for a computed callee, or a named import the file lacks.
 */
function buildBoundRenameFix(opts: {
  fixer: TSESLint.RuleFixer;
  constraint: ZodSchemaConstraint;
  exactCheckName: string;
  getNamedImportLocal: (originalName: string) => string | undefined;
}): TSESLint.RuleFix | null {
  const { fixer, constraint, exactCheckName, getNamedImportLocal } = opts;
  const { callee } = constraint.node;

  // A named import needs a binding for the exact check; a fixer cannot add one.
  if (callee.type === AST_NODE_TYPES.Identifier) {
    const localName = getNamedImportLocal(exactCheckName);

    return localName === undefined ? null : fixer.replaceText(callee, localName);
  }

  // Chained method or namespaced check — only the property name changes,
  // and a computed one (`z['minLength'](3)`) has no name to change.
  if (
    callee.type !== AST_NODE_TYPES.MemberExpression ||
    callee.computed ||
    callee.property.type !== AST_NODE_TYPES.Identifier
  ) {
    return null;
  }

  return fixer.replaceText(callee.property, exactCheckName);
}

/**
 * Removes the redundant bound: a chained method,
 * the whole `.check(...)` when the bound was its only argument,
 * or that argument plus one separator.
 */
function buildBoundRemoveFix(opts: {
  fixer: TSESLint.RuleFixer;
  methods: Array<{ name: string; node: TSESTree.CallExpression }>;
  constraint: ZodSchemaConstraint;
}): TSESLint.RuleFix | null {
  const { fixer, methods, constraint } = opts;

  if (constraint.origin === 'chained' || constraint.argumentCount === 1) {
    return buildZodChainRemoveMethodFix({ fixer, methods, removeIndex: constraint.chainIndex });
  }

  const callArguments = constraint.checkNode.arguments;
  const { argumentIndex } = constraint;
  const target = callArguments[argumentIndex];

  // `argumentCount > 1` guarantees a neighbour to swallow the separator with.
  return argumentIndex === 0
    ? fixer.removeRange([target.range[0], callArguments[1].range[0]])
    : fixer.removeRange([callArguments[argumentIndex - 1].range[1], target.range[1]]);
}

/**
 * Collapses an equal lower/upper bound pair into the exact check of the same domain:
 * `z.string().min(3).max(3)` → `z.string().length(3)`.
 *
 * Bounds are matched by meaning (`bound.kind`, `bound.domain`) through the shared check vocabulary,
 * so both API styles work from one implementation.
 * Stays silent — rather than reporting unfixably —
 * whenever the pair is not provably the exact check: a non-literal or error-message argument,
 * a bound with its value baked in (`nonempty`), a mutating check between the two,
 * or more bounds than a single pair.
 * Those belong to `no-conflicting-checks`.
 */
export function buildCollapseEqualBoundsCreate<TMessageIds extends string>(
  options: CollapseEqualBoundsOptions<TMessageIds>,
): (context: Readonly<TSESLint.RuleContext<TMessageIds, []>>) => TSESLint.RuleListener {
  const { scope, baseTypes, domain, messageId } = options;
  const exactCheckName = EXACT_CHECK_BY_DOMAIN[domain];

  return function create(context) {
    const {
      createSchemaVisitor,
      collectZodChainMethods,
      collectZodSchemaConstraints,
      getNamedImportLocal,
    } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      onSchema(node, zodSchemaMeta): void {
        const baseType = getZodSchemaBaseType(zodSchemaMeta.schemaType);
        if (baseType === null || !baseTypes.includes(baseType)) {
          return;
        }

        // Empty when the chain runs through a computed member (`z['string']().min(3).max(3)`):
        // nothing to pair up.
        const constraints = collectZodSchemaConstraints(node);

        const bounds: Array<DomainBound> = [];
        const mutatingIndexes: Array<number> = [];

        for (const [index, constraint] of constraints.entries()) {
          if (ZOD_MUTATING_CHECK_NAMES.includes(constraint.name)) {
            mutatingIndexes.push(index);
            continue;
          }

          const canonicalName = canonicalizeZodConstraintName(constraint, baseType);
          const bound =
            canonicalName === null ? undefined : getZodCheckDescriptor(canonicalName)?.bound;

          if (bound?.domain !== domain) {
            continue;
          }

          // `nonempty` is `>= 1` with no argument to compare.
          if (bound.fixedValue !== undefined) {
            return;
          }

          bounds.push({ index, kind: bound.kind, constraint });
        }

        const lowerBounds = bounds.filter((it) => it.kind === 'lower');
        const upperBounds = bounds.filter((it) => it.kind === 'upper');

        // An exact check already present, or a repeated bound, is a conflict.
        if (bounds.length !== 2 || lowerBounds.length !== 1 || upperBounds.length !== 1) {
          return;
        }

        const [lowerBound] = lowerBounds;
        const [upperBound] = upperBounds;

        const lowerValue = readBoundValue(lowerBound.constraint);
        if (lowerValue === null || lowerValue !== readBoundValue(upperBound.constraint)) {
          return;
        }

        const [firstBound, secondBound] =
          lowerBound.index < upperBound.index ? [lowerBound, upperBound] : [upperBound, lowerBound];

        // `.min(3).trim().max(3)`: the second bound sees the trimmed value.
        const mutatesBetween = mutatingIndexes.some(
          (index) => index > firstBound.index && index < secondBound.index,
        );
        if (mutatesBetween) {
          return;
        }

        context.report({
          node,
          messageId,
          fix(fixer) {
            const renameFix = buildBoundRenameFix({
              fixer,
              constraint: firstBound.constraint,
              exactCheckName,
              getNamedImportLocal,
            });
            if (renameFix === null) {
              return null;
            }

            const removeFix = buildBoundRemoveFix({
              fixer,
              methods: collectZodChainMethods(node),
              constraint: secondBound.constraint,
            });

            return removeFix === null ? null : [renameFix, removeFix];
          },
        });
      },
    });
  };
}
