import type { TSESLint } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';
import { ZOD_NON_SCHEMA_PRODUCING_METHODS } from '../zod-non-schema-producing-methods.js';

/** Options for {@link buildDeprecatedSchemaMethodCreate}. */
export interface DeprecatedSchemaMethodOptions<TMessageIds extends string> {
  scope: ZodImportScope;

  /** The deprecated method as chained on a schema (e.g. `isOptional`). */
  methodName: string;

  /** Message reported on the schema expression. */
  messageId: TMessageIds;
}

/**
 * Flags a deprecated method anywhere in a schema chain (`.isOptional()`).
 * Skipped when a non-schema-producing method comes first — the call then belongs to that result,
 * not to zod.
 * Report-only: the `safeParse(…)` replacement would duplicate the schema expression.
 */
export function buildDeprecatedSchemaMethodCreate<TMessageIds extends string>(
  options: DeprecatedSchemaMethodOptions<TMessageIds>,
): (context: Readonly<TSESLint.RuleContext<TMessageIds, []>>) => TSESLint.RuleListener {
  const { scope, methodName, messageId } = options;

  return function create(context) {
    const { createSchemaVisitor } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      onSchema(node, zodSchemaMeta): void {
        const { methods } = zodSchemaMeta;

        const methodIndex = methods.indexOf(methodName);
        if (methodIndex === -1) {
          return;
        }

        const precedingMethods = methods.slice(0, methodIndex);
        if (precedingMethods.some((it) => ZOD_NON_SCHEMA_PRODUCING_METHODS.includes(it))) {
          return;
        }

        context.report({ node, messageId });
      },
    });
  };
}
