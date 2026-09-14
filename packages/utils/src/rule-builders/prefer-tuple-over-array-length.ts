import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { buildZodConstraintsRemoveFix } from '../build-zod-constraints-remove-fix.js';
import type { ZodSchemaConstraint } from '../collect-zod-schema-constraints.js';
import { readIntegerLiteralValue } from '../read-integer-literal-value.js';
import { canonicalizeZodConstraintName } from '../zod-check-vocabulary.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'preferTuple';

/** The kind of length constraint applied to a `z.array(...)` schema. */
type LengthConstraintKind = 'length' | 'min' | 'max';

/**
 * Length constraints by canonical name.
 * Both API styles reduce to these via `canonicalizeZodConstraintName`,
 * so chained methods `.length()` / `.min()` / `.max()`, `zod`)
 * and standalone checks (`z.length()` / `z.minLength()` / `z.maxLength()`, `zod/mini`)
 * are matched by the same three entries.
 */
const LENGTH_CONSTRAINT_KINDS = new Map<string, LengthConstraintKind>([
  ['length', 'length'],
  ['minLength', 'min'],
  ['maxLength', 'max'],
]);

interface LengthCandidate {
  kind: LengthConstraintKind;
  constraint: ZodSchemaConstraint;
  /** The AST node of the count argument (e.g. the `2` in `.length(2)`). */
  countArgument: TSESTree.Node | null;
}

/**
 * Builds the `create` function for the `prefer-tuple-over-array-length` rule.
 *
 * Detection is API-style agnostic:
 * length constraints are collected via `collectZodSchemaConstraints`,
 * so chained methods (`.length()` / `.min()` / `.max()`, `zod`)
 * and standalone checks passed to `.check(...)` (`z.length()` / `z.minLength()` / `z.maxLength()`, `zod/mini`)
 * are recognized by the same logic, whichever style the plugin's API uses.
 */
export function buildPreferTupleOverArrayLengthCreate(
  scope: ZodImportScope,
): (context: Readonly<TSESLint.RuleContext<MessageIds, []>>) => TSESLint.RuleListener {
  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods, collectZodSchemaConstraints } =
      scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: 'array',
      onSchema(node, zodSchemaMeta): void {
        const methods = collectZodChainMethods(node);
        const constraints = collectZodSchemaConstraints(node);

        const candidates: Array<LengthCandidate> = [];
        for (const constraint of constraints) {
          const canonical = canonicalizeZodConstraintName(constraint, 'array');
          const candidateKind =
            canonical === null ? undefined : LENGTH_CONSTRAINT_KINDS.get(canonical);
          if (candidateKind) {
            candidates.push({
              kind: candidateKind,
              constraint,
              countArgument: constraint.node.arguments.at(0) ?? null,
            });
          }
        }

        // Nothing to flag. (`nonempty` on its own is the idiomatic typed form.)
        if (candidates.length === 0) {
          return;
        }

        // `.nonempty()` is itself a typed length constraint:
        // a fix that keeps it would produce a tuple carrying a method tuples don't have.
        const hasNonempty = constraints.some((it) => it.name === 'nonempty');

        const lengthCandidates = candidates.filter((it) => it.kind === 'length');
        const minCandidates = candidates.filter((it) => it.kind === 'min');
        const maxCandidates = candidates.filter((it) => it.kind === 'max');

        // Decide the reported kind, where the element count comes from,
        // and which constraints the autofix removes (`null` → report-only).
        let kind: LengthConstraintKind;
        let countArgument: TSESTree.Node | null;
        let removable: Array<ZodSchemaConstraint> | null;

        if (candidates.length === 1 && lengthCandidates.length === 1 && !hasNonempty) {
          // `length(n)` sole → fixed-length tuple.
          const [only] = lengthCandidates;
          kind = 'length';
          countArgument = only.countArgument;
          removable = [only.constraint];
        } else if (
          candidates.length === 2 &&
          minCandidates.length === 1 &&
          maxCandidates.length === 1 &&
          !hasNonempty
        ) {
          // min + max with equal literal bounds ≡ exact length → fixed tuple.
          const [min] = minCandidates;
          const [max] = maxCandidates;
          const minValue = readIntegerLiteralValue(min.countArgument);
          const maxValue = readIntegerLiteralValue(max.countArgument);

          kind = 'length';
          countArgument = min.countArgument;
          removable =
            minValue !== null && minValue === maxValue ? [min.constraint, max.constraint] : null;
        } else if (candidates.length === 1 && minCandidates.length === 1 && !hasNonempty) {
          // `min(n)` sole → rest tuple.
          const [only] = minCandidates;
          kind = 'min';
          countArgument = only.countArgument;
          removable = [only.constraint];
        } else {
          // `max()` alone, several constraints, or a `nonempty()` companion → report-only.
          const chosen = lengthCandidates.at(0) ?? candidates[0];
          kind = chosen.kind;
          countArgument = chosen.countArgument;
          removable = null;
        }

        context.report({
          node,
          messageId: 'preferTuple',
          fix(fixer) {
            // `max` has no behavior-preserving tuple form,
            // and `removable` is null when the constraints don't reduce to a single length.
            if (kind === 'max' || removable === null) {
              return null;
            }

            const count = readIntegerLiteralValue(countArgument);
            if (count === null) {
              return null;
            }

            // Bail on named imports (e.g. `array(...)`):
            // rewriting to `tuple(...)` would require a `tuple` import we cannot safely add.
            if (zodSchemaMeta.schemaDecl === 'named') {
              return null;
            }

            const arrayNode = methods.find((it) => it.name === 'array')?.node;

            // Need exactly one argument (the element schema) to build the tuple.
            if (arrayNode?.arguments.length !== 1) {
              return null;
            }

            const [element] = arrayNode.arguments;
            if (element.type === AST_NODE_TYPES.SpreadElement) {
              return null;
            }

            // Named declarations returned above and a computed factory produces no walkable `array` chain item,
            // so the callee is `<ns>.array`.
            const arrayCallee = arrayNode.callee as TSESTree.MemberExpression;

            const removeFixes = buildZodConstraintsRemoveFix({
              fixer,
              methods,
              constraints: removable,
            });
            if (removeFixes === null) {
              return null;
            }

            const elementText = context.sourceCode.getText(element);
            const items = Array.from({ length: count }, () => elementText).join(', ');
            // `min(n)` → a rest tuple `z.tuple([el × n], el)` (at least n items);
            // `length(n)` → a fixed tuple `z.tuple([el × n])`.
            const tupleArguments = kind === 'min' ? `[${items}], ${elementText}` : `[${items}]`;

            return [
              fixer.replaceText(arrayCallee.property, 'tuple'),
              fixer.replaceText(element, tupleArguments),
              ...removeFixes,
            ];
          },
        });
      },
    });
  };
}
