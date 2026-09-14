import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

/** Options for {@link buildPreferDedicatedFactoryCreate}. */
export interface PreferDedicatedFactoryOptions<TMessageIds extends string> {
  scope: ZodImportScope;

  /** The general factory the modifier is chained on (e.g. `object`). */
  factoryName: string;

  /** Chained modifiers the dedicated factory replaces (e.g. `passthrough`, `loose`). */
  modifierMethods: ReadonlyArray<string>;

  /** The dedicated factory to use instead (e.g. `looseObject`). */
  replacementFactoryName: string;

  /** Message reported on the modifier call. */
  messageId: TMessageIds;
}

/**
 * Prefers a dedicated factory over a general one plus a chained modifier (`z.looseObject()` over `z.object().passthrough()`).
 * The fix renames the factory and drops the modifier;
 * it bails on named imports (would need a new import) and on a modifier with arguments (nowhere to put them).
 */
export function buildPreferDedicatedFactoryCreate<TMessageIds extends string>(
  options: PreferDedicatedFactoryOptions<TMessageIds>,
): (context: Readonly<TSESLint.RuleContext<TMessageIds, []>>) => TSESLint.RuleListener {
  const { scope, factoryName, modifierMethods, replacementFactoryName, messageId } = options;

  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: factoryName,
      onSchema(node, zodSchemaMeta): void {
        if (!zodSchemaMeta.methods.some((name) => modifierMethods.includes(name))) {
          return;
        }

        const methods = collectZodChainMethods(node);
        // Empty when the chain runs through a computed member (`z['object']({}).passthrough()`):
        // detection named the modifier but the walker cannot,
        // so report on the schema and offer no fix.
        const modifierMethod = methods.find((it) => modifierMethods.includes(it.name));

        context.report({
          node: modifierMethod?.node ?? node,
          messageId,
          fix(fixer) {
            if (!modifierMethod || zodSchemaMeta.schemaDecl === 'named') {
              return null;
            }

            if (modifierMethod.node.arguments.length !== 0) {
              return null;
            }

            const { sourceCode } = context;

            // The chain is walkable (`modifierMethod` came from it) and starts at the factory,
            // which the visitor already filtered to `factoryName`.
            // Named declarations returned above,
            // so both calls are `<ns>.<name>(…)` member expressions —
            // a bare identifier callee is unreachable here.
            const [factoryMethod] = methods;
            const factoryCallee = factoryMethod.node.callee as TSESTree.MemberExpression;
            const modifierCallee = modifierMethod.node.callee as TSESTree.MemberExpression;

            const fixes = [
              fixer.replaceText(
                factoryCallee,
                `${sourceCode.getText(factoryCallee.object)}.${replacementFactoryName}`,
              ),
            ];

            const tokenBefore = sourceCode.getTokenBefore(modifierCallee.property);

            if (tokenBefore?.value === '.') {
              fixes.push(fixer.removeRange([tokenBefore.range[0], modifierMethod.node.range[1]]));
            }

            return fixes;
          },
        });
      },
    });
  };
}
