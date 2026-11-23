import type { ZodExportName, ZodMethodName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { ZodSchemaConstraint } from '../collect-zod-schema-constraints.js';
import { isZodCheckMethodName } from '../collect-zod-schema-constraints.js';
import { getArgumentValue } from '../get-binding-initializer.js';
import { mayRewriteZodValue } from '../has-opaque-zod-check.js';
import { readsZodSchemaKind } from '../reads-zod-schema-kind.js';
import type { RuleContext, RuleListener, SourceCode } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { METADATA_DROPPING_METHODS, mayWriteZodDescription } from '../zod-metadata.js';
import { ZOD_NON_SCHEMA_HELPER_NAMES } from '../zod-non-schema-helper-names.js';
import type { ZodTypeChangingMethod } from '../zod-type-changing-methods.js';
import { ZOD_TYPE_CHANGING_METHODS } from '../zod-type-changing-methods.js';

/** Each unreachable entry of `TExcluded` becomes the reason, so listing one is a type error. */
export type NoDuplicateSchemaMethodsExclusions<TExcluded extends ReadonlyArray<string>> = {
  readonly [K in keyof TExcluded]: TExcluded[K] extends ZodTypeChangingMethod
    ? `'${TExcluded[K]}' starts a new chain segment, so excluding it is dead code`
    : TExcluded[K] extends 'check' | 'with'
      ? `'${TExcluded[K]}' is never compared, only its arguments, so excluding it is dead code`
      : TExcluded[K];
};

/** A chained method or a `.check(...)` argument. */
type AppliedCheck = Pick<ZodSchemaConstraint, 'name' | 'node'>;

/** Case changes, `normalize()` and `slugify()`: each overrides the one before. */
const REWRITE_CHECKS: ReadonlySet<string> = new Set<ZodExportName | ZodMethodName>([
  'normalize',
  'slugify',
  'toLowerCase',
  'toUpperCase',
]);

/** Rewrites that cannot put whitespace back at the edges. */
const TRIM_KEEPING_CHECKS: ReadonlySet<string> = new Set<ZodExportName | ZodMethodName>([
  'slugify',
  'toLowerCase',
  'toUpperCase',
  'trim',
]);

/** Wrappers that judge the value, so a rewrite between two of them can make both matter. */
const VALUE_JUDGING_WRAPPERS: ReadonlySet<string> = new Set<ZodMethodName>([
  'catch',
  'nonoptional',
]);

/** Wrappers peeled one at a time, so a later `.unwrap()` can need both of two repeats. */
const PEELABLE_WRAPPERS: ReadonlySet<string> = new Set<ZodMethodName>([
  'catch',
  'default',
  'exactOptional',
  'nonoptional',
  'nullable',
  'nullish',
  'optional',
  'prefault',
  'readonly',
]);

/** What a rewrite check sets; `null` when it cannot be known statically. */
function getRewriteKey(check: AppliedCheck, sourceCode: Readonly<SourceCode>): string | null {
  if (check.name !== 'normalize') {
    return check.name;
  }
  // `normalize()` defaults to `NFC`, as `String.prototype.normalize` does.
  const form = check.node.arguments.at(0);
  if (!form) {
    return 'NFC';
  }
  const value = getArgumentValue(sourceCode, form);
  return value?.type === AST_NODE_TYPES.Literal && typeof value.value === 'string'
    ? value.value
    : null;
}

/**
 * Reports a method called twice in one chain segment, the excluded ones aside,
 * and a repeat among `comparedCheckArguments` passed to `.check(...)`.
 * A repeat counts only while the earlier call is still in effect.
 */
export function buildNoDuplicateSchemaMethodsCreate<const TExcluded extends ReadonlyArray<string>>(
  scope: ZodImportScope,
  excludedMethods: NoDuplicateSchemaMethodsExclusions<TExcluded>,
  comparedCheckArguments: ReadonlyArray<string> = [],
): (context: Readonly<RuleContext<'noDuplicateSchemaMethod'>>) => RuleListener {
  const excluded: ReadonlyArray<string> = excludedMethods;

  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods, collectZodSchemaConstraints } =
      scope.createTracker({ kind: 'value' });
    const report = (node: TSESTree.Node, method: string): void => {
      context.report({ node, messageId: 'noDuplicateSchemaMethod', data: { method } });
    };

    return createSchemaVisitor({
      onSchema(node): void {
        const seen = new Set<string>();
        // The rewrite in effect, `null` when unknown.
        let rewrite: string | null = null;
        const constraints = collectZodSchemaConstraints(node);

        // Checks made before a value change judged another value.
        const forgetValueChecks = (changedBy: string): void => {
          for (const name of seen) {
            const stillHolds =
              name === 'clone' ||
              name === 'describe' ||
              (METADATA_DROPPING_METHODS.has(name) && !VALUE_JUDGING_WRAPPERS.has(name)) ||
              (name === 'trim' && TRIM_KEEPING_CHECKS.has(changedBy));
            if (!stillHolds) {
              seen.delete(name);
            }
          }
          // `trim()` only drops whitespace, so it cannot undo a rewrite.
          if (changedBy !== 'trim') {
            rewrite = null;
          }
        };
        // Records `check`; whether it repeats one still in effect.
        const isRepeat = (check: AppliedCheck, tracked: boolean): boolean => {
          const isRewrite = REWRITE_CHECKS.has(check.name);
          const key = isRewrite ? getRewriteKey(check, context.sourceCode) : null;
          const repeated =
            tracked && (isRewrite ? key !== null && key === rewrite : seen.has(check.name));
          if (mayWriteZodDescription(check)) {
            seen.delete('describe');
          }
          if (!repeated && mayRewriteZodValue(check.name)) {
            forgetValueChecks(check.name);
          }
          if (tracked && isRewrite) {
            rewrite = key;
          } else if (tracked) {
            seen.add(check.name);
          }
          return repeated;
        };

        for (const method of collectZodChainMethods(node)) {
          // A type-changing method starts a new segment: what follows constrains a different schema.
          if (ZOD_TYPE_CHANGING_METHODS.includes(method.name)) {
            seen.clear();
            rewrite = null;
          } else if (ZOD_NON_SCHEMA_HELPER_NAMES.includes(method.name)) {
            // What follows is called on a parse result or the like, not on a schema.
            break;
          } else if (isZodCheckMethodName(method.name)) {
            for (const argument of method.node.arguments) {
              const check = constraints.find((it) => it.node === argument);
              if (!check) {
                // A custom check may rewrite the value or the description.
                seen.delete('describe');
                forgetValueChecks('check');
              } else if (isRepeat(check, comparedCheckArguments.includes(check.name))) {
                report(check.node, check.name);
              }
            }
          } else {
            if (METADATA_DROPPING_METHODS.has(method.name)) {
              seen.delete('describe');
            }
            if (
              isRepeat(method, !excluded.includes(method.name)) &&
              !(
                PEELABLE_WRAPPERS.has(method.name) &&
                readsZodSchemaKind(context.sourceCode, method.node)
              )
            ) {
              report(node, method.name);
            }
          }
        }
      },
    });
  };
}
