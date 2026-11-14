import type { ZodMethodName } from '@eslint-zod/zod-api';

import { buildZodChainRemoveMethodFix } from '../build-zod-chain-remove-method-fix.js';
import { buildZodChainReplacementFix } from '../build-zod-chain-replacement-fix.js';
import { isZodFactoryChainItem } from '../is-zod-factory-chain-item.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { ZOD_MUTATING_CHECK_NAMES } from '../zod-mutating-check-names.js';
import { ZOD_TYPE_CHANGING_METHODS } from '../zod-type-changing-methods.js';

/** A `.check(fn)` callback may rewrite the value. */
const CALLBACK_CHECK_METHODS: ReadonlyArray<ZodMethodName> = ['check', 'with'];

const REORDER_BARRIERS: ReadonlyArray<string> = [
  ...ZOD_MUTATING_CHECK_NAMES,
  ...ZOD_TYPE_CHANGING_METHODS,
  ...CALLBACK_CHECK_METHODS,
];

/** A deprecated chained method paired with the top-level factory replacing it. */
export interface TopLevelFactoryReplacement {
  /** The deprecated method as chained on the factory (e.g. `uuid`, `safe`). */
  sourceMethodName: string;

  /** The top-level factory replacing it; may be dotted (`iso.date`). */
  replacementMethodName: string;
}

/** Options for {@link buildPreferTopLevelFactoryCreate}. */
export interface PreferTopLevelFactoryOptions<TMessageIds extends string> {
  scope: ZodImportScope;

  /** Factories the deprecated method is chained on (e.g. `string`, `number`). */
  factoryName: string | ReadonlyArray<string>;

  /** Chained method → top-level factory that replaces it. */
  replacements: ReadonlyArray<TopLevelFactoryReplacement>;

  /** Message reported on the schema; gets `factory` / `sourceMethod` / `replacementMethod` data. */
  messageId: TMessageIds;

  /**
   * Factories that already imply the method (`z.int32()` for `.int()`).
   * There the fix removes the call instead, reported with this message and the same data.
   */
  redundant?: { factoryNames: ReadonlyArray<string>; messageId: TMessageIds };

  /** Method names to skip, for rules exposing an `ignore` option. */
  ignore?: ReadonlyArray<string>;
}

/**
 * Prefers a top-level factory over a deprecated method chained on a general one (`z.uuid()` over `z.string().uuid()`, `z.int()` over `z.number().safe()`).
 * The fix rewrites `z.<factory>().<method>(args)` into `z.<replacement>(args)`, or removes the method on a `redundant` factory,
 * keeping the methods in between; it bails on named imports, which would need a new import,
 * on a chain the walker cannot name, on a factory called with arguments,
 * when a mutating or type-changing method or a `.check()` sits in between,
 * and when another of the deprecated methods is chained too.
 */
export function buildPreferTopLevelFactoryCreate<
  TMessageIds extends string,
  TOptions extends ReadonlyArray<unknown> = [],
>(
  options: PreferTopLevelFactoryOptions<TMessageIds>,
): (context: Readonly<RuleContext<TMessageIds, TOptions>>) => RuleListener {
  const { scope, factoryName, replacements, messageId, redundant, ignore = [] } = options;

  const ignored = new Set(ignore);
  // A plain object so the lookup types as `string`: the match is always one of its keys.
  const replacementBySource: Record<string, string> = Object.fromEntries(
    replacements
      .filter(({ sourceMethodName }) => !ignored.has(sourceMethodName))
      .map(({ sourceMethodName, replacementMethodName }) => [
        sourceMethodName,
        replacementMethodName,
      ]),
  );
  const sourceMethodNames = Object.keys(replacementBySource);
  const everySourceMethodName = replacements.map((it) => it.sourceMethodName);
  const redundantOn: ReadonlyArray<string> = redundant?.factoryNames ?? [];
  const schemaType = [
    ...(typeof factoryName === 'string' ? [factoryName] : factoryName),
    ...redundantOn,
  ];

  return function create(context) {
    const { sourceCode } = context;

    const { createSchemaVisitor, findZodChainedMethod, isZodImportName } = scope.createTracker({
      kind: 'value',
    });

    return createSchemaVisitor({
      schemaType,
      onSchema(node, zodSchemaMeta): void {
        const found = findZodChainedMethod(node, zodSchemaMeta, sourceMethodNames);
        if (found === null) {
          return;
        }

        // A chain that does not start at the factory resumes after a property access
        // (`z.string().foo.email()`), so its methods are not chained on `<factoryName>()`.
        if (found.methods.length > 0 && !isZodFactoryChainItem(found.methods[0], isZodImportName)) {
          return;
        }

        const replacementMethodName = replacementBySource[found.name];
        const data = {
          factory: zodSchemaMeta.schemaType,
          sourceMethod: found.name,
          replacementMethod: replacementMethodName,
        };

        if (redundant && redundantOn.includes(zodSchemaMeta.schemaType)) {
          context.report({
            node,
            messageId: redundant.messageId,
            data,
            fix: (fixer) =>
              buildZodChainRemoveMethodFix({
                fixer,
                methods: found.methods,
                removeIndex: found.index,
                sourceCode,
              }),
          });
          return;
        }

        context.report({
          node,
          messageId,
          data,
          fix(fixer) {
            if (found.member === null || zodSchemaMeta.schemaDecl === 'named') {
              return null;
            }

            // The rewrite drops the factory's own arguments,
            // and moves the method ahead of anything that changes the value it sees.
            if (
              found.methods[0].node.arguments.length > 0 ||
              found.methods.slice(1, found.index).some((it) => REORDER_BARRIERS.includes(it.name))
            ) {
              return null;
            }

            // The replacement may not carry the other deprecated methods: `z.guid().uuid()` throws.
            if (
              found.methods.some(
                (it, index) =>
                  index > 0 && index !== found.index && everySourceMethodName.includes(it.name),
              )
            ) {
              return null;
            }

            return buildZodChainReplacementFix({
              sourceCode,
              fixer,
              methods: found.methods,
              toIndex: found.index,
              toMethodName: replacementMethodName,
            });
          },
        });
      },
    });
  };
}
