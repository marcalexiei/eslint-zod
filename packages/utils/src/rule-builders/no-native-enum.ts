import { isZodFactoryChainItem } from '../is-zod-factory-chain-item.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'useEnum';

/**
 * Builds the `create` function for the `no-native-enum` rule.
 *
 * `nativeEnum` is a plain namespace factory in both `zod` and `zod/mini`,
 * so the same detection and rename fix serve both plugins unchanged.
 */
export function buildNoNativeEnumCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods, isZodImportName } = scope.createTracker({
      kind: 'value',
    });

    return createSchemaVisitor({
      schemaType: 'nativeEnum',
      onSchema(node): void {
        // Empty for a computed factory (`z['nativeEnum'](Foo)`), which detection still resolves,
        // and resumed at a method after a property access (`z.nativeEnum(Foo).options.map(…)`) —
        // report it, just without a fix.
        const head = collectZodChainMethods(node).at(0);
        const factoryCallee =
          head && isZodFactoryChainItem(head, isZodImportName) ? head.member : null;

        context.report({
          node,
          messageId: 'useEnum',
          fix(fixer) {
            // For named imports (e.g., `nativeEnum(Color)`),
            // we cannot safely auto-fix because replacing the entire chain would require access to the namespace prefix.
            // Report the error without a fix in this case.
            if (!factoryCallee) {
              return null;
            }

            return fixer.replaceText(factoryCallee.property, 'enum');
          },
        });
      },
    });
  };
}
