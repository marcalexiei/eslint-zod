import type { TSESLint } from '@typescript-eslint/utils';

import { buildZodChainReplacementFix } from '../build-zod-chain-replacement-fix.js';
import { getZodChainedMethodNames } from '../get-zod-chained-method-names.js';
import type { ZodImportScope } from '../zod-import-scope.js';

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
 * and on a chain the walker cannot name.
 */
export function buildPreferTopLevelFactoryCreate<
  TMessageIds extends string,
  TOptions extends ReadonlyArray<unknown> = [],
>(
  options: PreferTopLevelFactoryOptions<TMessageIds>,
): (context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>) => TSESLint.RuleListener {
  const { scope, factoryName, replacements, messageId, ignore = [] } = options;

  const ignored = new Set(ignore);
  const replacementBySource = new Map(
    replacements
      .filter(({ sourceMethodName }) => !ignored.has(sourceMethodName))
      .map(({ sourceMethodName, replacementMethodName }) => [
        sourceMethodName,
        replacementMethodName,
      ]),
  );

  return function create(context) {
    const { sourceCode } = context;

    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: factoryName,
      onSchema(node, zodSchemaMeta): void {
        const methods = collectZodChainMethods(node);

        // A walkable chain always starts at the factory.
        // A different name there means it was imported under an alias (`import { string as str }`),
        // so no method in this chain is chained on `<factoryName>()`.
        if (methods.length > 0 && methods[0].name !== factoryName) {
          return;
        }

        const chainedMethod = methods.find(
          (it, index) => index > 0 && replacementBySource.has(it.name),
        );

        // The fallback covers a chain the walker cannot name (`z['string']().uuid()`),
        // where detection still names the methods.
        const sourceMethodName =
          chainedMethod?.name ??
          getZodChainedMethodNames(zodSchemaMeta).find((name) => replacementBySource.has(name));

        const replacementMethodName =
          sourceMethodName === undefined ? undefined : replacementBySource.get(sourceMethodName);

        if (replacementMethodName === undefined) {
          return;
        }

        context.report({
          node,
          messageId,
          data: { sourceMethod: sourceMethodName, replacementMethod: replacementMethodName },
          fix(fixer) {
            if (!chainedMethod || zodSchemaMeta.schemaDecl === 'named') {
              return null;
            }

            return buildZodChainReplacementFix({
              sourceCode,
              fixer,
              methods,
              // The factory is always the first chain item.
              fromIndex: 0,
              toIndex: methods.indexOf(chainedMethod),
              toMethodName: replacementMethodName,
            });
          },
        });
      },
    });
  };
}
