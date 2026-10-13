import type { ReportSuggestionArray, RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'sourceNotAllowed' | 'replaceSource';

export interface ConsistentImportSourceOptions<TSource extends string> {
  sources: Array<TSource>;
}

export function buildConsistentImportSourceCreate<TSources extends ReadonlyArray<string>>(
  scope: ZodImportScope<TSources>,
): (
  context: Readonly<RuleContext<MessageIds, [ConsistentImportSourceOptions<TSources[number]>]>>,
  options: readonly [ConsistentImportSourceOptions<TSources[number]>],
) => RuleListener {
  return function create(context, [{ sources }]) {
    return {
      ImportDeclaration(node): void {
        const sourceValue = node.source.value;
        if (!scope.isAllowed(sourceValue)) {
          return;
        }

        if (sources.includes(sourceValue)) {
          return;
        }

        context.report({
          node,
          messageId: 'sourceNotAllowed',
          data: {
            source: sourceValue,
            sources: sources.map((s) => `"${s}"`).join(', '),
          },
          suggest: sources.map<ReportSuggestionArray<MessageIds>[number]>((it) => ({
            messageId: 'replaceSource',
            data: { valid: it, invalid: sourceValue },
            fix(fixer): RuleFix {
              return fixer.replaceText(
                node.source,
                // Replacing using the raw value
                // to keep quote style consistent with the user code
                node.source.raw.replace(sourceValue, it),
              );
            },
          })),
        });
      },
    };
  };
}
