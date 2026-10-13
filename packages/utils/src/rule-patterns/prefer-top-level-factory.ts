import { buildZodChainReplacementFix } from '../build-zod-chain-replacement-fix.js';
import { isZodFactoryChainItem } from '../is-zod-factory-chain-item.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { ZOD_MUTATING_CHECK_NAMES } from '../zod-mutating-check-names.js';
import { ZOD_TYPE_CHANGING_METHODS } from '../zod-type-changing-methods.js';

const REORDER_BARRIERS: ReadonlyArray<string> = [
  ...ZOD_MUTATING_CHECK_NAMES,
  ...ZOD_TYPE_CHANGING_METHODS,
  // a `.check(fn)` callback may rewrite the value
  'check',
  'with',
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

  /** Factory the deprecated method is chained on (e.g. `string`, `number`). */
  factoryName: string;

  /** Chained method → top-level factory that replaces it. */
  replacements: ReadonlyArray<TopLevelFactoryReplacement>;

  /** Message reported on the schema; gets `sourceMethod` / `replacementMethod` data. */
  messageId: TMessageIds;

  /** Method names to skip, for rules exposing an `ignore` option. */
  ignore?: ReadonlyArray<string>;
}

/**
 * Prefers a top-level factory over a deprecated method chained on a general one (`z.uuid()` over `z.string().uuid()`, `z.int()` over `z.number().safe()`).
 * The fix rewrites `z.<factory>().<method>(args)` into `z.<replacement>(args)`,
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
  const { scope, factoryName, replacements, messageId, ignore = [] } = options;

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

  return function create(context) {
    const { sourceCode } = context;

    const { createSchemaVisitor, findZodChainedMethod } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: factoryName,
      onSchema(node, zodSchemaMeta): void {
        const found = findZodChainedMethod(node, zodSchemaMeta, sourceMethodNames);
        if (found === null) {
          return;
        }

        // A chain that does not start at the factory resumes after a property access
        // (`z.string().foo.email()`), so its methods are not chained on `<factoryName>()`.
        if (found.methods.length > 0 && !isZodFactoryChainItem(found.methods[0])) {
          return;
        }

        const replacementMethodName = replacementBySource[found.name];

        context.report({
          node,
          messageId,
          data: { sourceMethod: found.name, replacementMethod: replacementMethodName },
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
              // The factory is always the first chain item.
              fromIndex: 0,
              toIndex: found.index,
              toMethodName: replacementMethodName,
            });
          },
        });
      },
    });
  };
}
