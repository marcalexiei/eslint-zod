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
import { ZOD_MUTATING_CHECK_NAMES } from '../zod-mutating-check-names.js';
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

/** Rewrites that cannot put whitespace back at the edges. */
const TRIM_KEEPING_CHECKS: ReadonlySet<string> = new Set<ZodExportName | ZodMethodName>([
  'slugify',
  'toLowerCase',
  'toUpperCase',
]);

/** Wrappers a rewrite can see or undo, so both of two repeats can matter. */
const VALUE_JUDGING_WRAPPERS: ReadonlySet<string> = new Set<ZodMethodName>([
  'catch',
  'nonoptional',
  'readonly',
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

/** Methods whose argument selects what they apply to, so only identical calls repeat. */
const SELECTIVE_METHODS: ReadonlySet<string> = new Set<ZodMethodName>([
  'exactPartial',
  'exclude',
  'extract',
  'partial',
  'required',
]);

/** Whether evaluating `node` again gives the same value, so equal text means an equal argument. */
function isSameOnEachRead(node: TSESTree.Node): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.Identifier:
    case AST_NODE_TYPES.Literal:
      return true;
    case AST_NODE_TYPES.ArrayExpression:
      return node.elements.every((it) => it === null || isSameOnEachRead(it));
    case AST_NODE_TYPES.ObjectExpression:
      return node.properties.every((it) => isSameOnEachRead(it));
    case AST_NODE_TYPES.Property:
      return (!node.computed || isSameOnEachRead(node.key)) && isSameOnEachRead(node.value);
    case AST_NODE_TYPES.SpreadElement:
      return isSameOnEachRead(node.argument);
    case AST_NODE_TYPES.MemberExpression:
      return isSameOnEachRead(node.object) && (!node.computed || isSameOnEachRead(node.property));
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSSatisfiesExpression:
      return isSameOnEachRead(node.expression);
    default:
      return false;
  }
}

/** What a check is compared by; `null` when it cannot be known statically. */
function getCheckKey(check: AppliedCheck, sourceCode: Readonly<SourceCode>): string | null {
  if (SELECTIVE_METHODS.has(check.name)) {
    const args = check.node.arguments;
    return args.every((it) => isSameOnEachRead(it))
      ? `${check.name}(${args.map((it) => sourceCode.getText(it)).join()})`
      : null;
  }
  if (check.name !== 'normalize') {
    return check.name;
  }
  // `normalize()` defaults to `NFC`, as `String.prototype.normalize` does.
  const form = check.node.arguments.at(0);
  if (!form) {
    return 'normalize(NFC)';
  }
  const value = getArgumentValue(sourceCode, form);
  return value?.type === AST_NODE_TYPES.Literal && typeof value.value === 'string'
    ? `normalize(${value.value})`
    : null;
}

/** Drops the checks made before a value change, which judged another value. */
function forgetValueChecks(seen: Set<string>, changedBy: string): void {
  for (const key of seen) {
    const [name] = key.split('(', 1);
    const stillHolds =
      name === 'clone' ||
      name === 'describe' ||
      (METADATA_DROPPING_METHODS.has(name) && !VALUE_JUDGING_WRAPPERS.has(name)) ||
      (name === 'trim' && TRIM_KEEPING_CHECKS.has(changedBy)) ||
      // `trim()` only drops whitespace, so it cannot undo a rewrite.
      (changedBy === 'trim' && ZOD_MUTATING_CHECK_NAMES.includes(name));
    if (!stillHolds) {
      seen.delete(key);
    }
  }
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

        // Records `check`; whether it repeats one still in effect.
        const isRepeat = (check: AppliedCheck, tracked: boolean): boolean => {
          const key = tracked ? getCheckKey(check, context.sourceCode) : null;
          const repeated = key !== null && seen.has(key);
          if (mayWriteZodDescription(check)) {
            seen.delete('describe');
          }
          if (!repeated && mayRewriteZodValue(check.name)) {
            forgetValueChecks(seen, check.name);
          }
          if (key !== null) {
            seen.add(key);
          }
          return repeated;
        };

        for (const method of collectZodChainMethods(node)) {
          // What `catch` returned can still fail here, leaving the next `catch` to handle it.
          if (method.name === 'refine' || isZodCheckMethodName(method.name)) {
            seen.delete('catch');
          }
          // A type-changing method starts a new segment: what follows constrains a different schema.
          if (ZOD_TYPE_CHANGING_METHODS.includes(method.name)) {
            seen.clear();
          } else if (ZOD_NON_SCHEMA_HELPER_NAMES.includes(method.name)) {
            // What follows is called on a parse result or the like, not on a schema.
            break;
          } else if (isZodCheckMethodName(method.name)) {
            const constraints = collectZodSchemaConstraints(node);
            for (const argument of method.node.arguments) {
              const check = constraints.find((it) => it.node === argument);
              if (!check) {
                // A custom check may rewrite the value or the description.
                seen.delete('describe');
                forgetValueChecks(seen, 'check');
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
