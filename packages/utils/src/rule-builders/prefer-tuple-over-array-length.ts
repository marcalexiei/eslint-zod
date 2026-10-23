import type { ZodExportName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { buildZodConstraintsRemoveFix } from '../build-zod-constraints-remove-fix.js';
import type { ZodSchemaConstraint } from '../collect-zod-schema-constraints.js';
import { hasOpaqueZodCheck } from '../has-opaque-zod-check.js';
import { isZodFactoryChainItem } from '../is-zod-factory-chain-item.js';
import { readIntegerLiteralValue } from '../read-integer-literal-value.js';
import { readsZodSchemaProperty } from '../reads-zod-schema-property.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import { canonicalizeZodConstraintName } from '../zod-check-vocabulary.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { ZOD_MUTATING_CHECK_NAMES } from '../zod-mutating-check-names.js';
import { ZOD_TYPE_CHANGING_METHODS } from '../zod-type-changing-methods.js';

/** The fix repeats the element schema once per item, so a large count is left to the author. */
const MAX_FIXABLE_LENGTH = 10;

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
const LENGTH_CONSTRAINT_KINDS: ReadonlyMap<string, LengthConstraintKind> = new Map<
  ZodExportName,
  LengthConstraintKind
>([
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
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const {
      createSchemaVisitor,
      collectZodChainMethods,
      collectZodSchemaConstraints,
      isZodImportName,
    } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: 'array',
      onSchema(node, zodSchemaMeta): void {
        const methods = collectZodChainMethods(node);
        // After a property access (`z.array(x).element.length(2)`) the checks are another schema's.
        const head = methods.at(0);
        if (head && !isZodFactoryChainItem(head, isZodImportName)) {
          return;
        }

        const allConstraints = collectZodSchemaConstraints(node);
        // `z.array(x).array().min(2)`: past a type-changing method the checks bound another schema.
        const typeChangeAt = allConstraints.findIndex(
          (it) => it.origin === 'chained' && ZOD_TYPE_CHANGING_METHODS.includes(it.name),
        );
        const constraints =
          typeChangeAt === -1 ? allConstraints : allConstraints.slice(0, typeChangeAt);

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

        // Nothing to flag. (`nonempty` on its own is left alone.)
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
            // The property being read may not exist on the schema the fix builds.
            if (readsZodSchemaProperty(node, zodSchemaMeta)) {
              return null;
            }

            // `max` has no behavior-preserving tuple form,
            // and `removable` is null when the constraints don't reduce to a single length.
            if (kind === 'max' || removable === null) {
              return null;
            }

            const count = readIntegerLiteralValue(countArgument);
            if (count === null || count > MAX_FIXABLE_LENGTH) {
              return null;
            }

            // A second argument is a custom error, which a tuple has no place for.
            if (removable.some((it) => it.node.arguments.length > 1)) {
              return null;
            }

            // The tuple checks its length first: a check that rewrites the array before the bound
            // (`.overwrite(dedupe).min(2)`) would then run after it.
            const lastRemovable = Math.max(...removable.map((it) => constraints.indexOf(it)));
            if (
              constraints
                .slice(0, lastRemovable)
                .some((it) => ZOD_MUTATING_CHECK_NAMES.includes(it.name)) ||
              hasOpaqueZodCheck({
                methods,
                constraints,
                fromChainIndex: 1,
                toChainIndex: Math.max(...removable.map((it) => it.chainIndex)),
              })
            ) {
              return null;
            }

            // Bail on named imports (e.g. `array(...)`):
            // rewriting to `tuple(...)` would require a `tuple` import we cannot safely add.
            if (zodSchemaMeta.schemaDecl === 'named') {
              return null;
            }

            const array = methods.find((it) => it.name === 'array');

            // Need exactly one argument (the element schema) to build the tuple.
            if (!array?.member || array.node.arguments.length !== 1) {
              return null;
            }

            const [element] = array.node.arguments;
            if (element.type === AST_NODE_TYPES.SpreadElement) {
              return null;
            }

            const removeFixes = buildZodConstraintsRemoveFix({
              fixer,
              methods,
              constraints: removable,
              sourceCode: context.sourceCode,
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
              fixer.replaceText(array.member.property, 'tuple'),
              fixer.replaceText(element, tupleArguments),
              ...removeFixes,
            ];
          },
        });
      },
    });
  };
}
