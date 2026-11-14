import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { OptionsWithDefaults } from '../create-rule-creator.js';
import type { ReportSuggestionArray, RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { ZOD_OBJECT_METHODS } from '../zod-object-methods.js';
import type { ZodObjectMethod } from '../zod-object-methods.js';

export { ZOD_OBJECT_METHODS };

export interface ConsistentObjectSchemaTypeOptions {
  allow: Array<ZodObjectMethod>;
}

type MessageIds = 'consistentMethod' | 'useMethod';

export function buildConsistentObjectSchemaTypeCreate(
  scope: ZodImportScope,
): (
  context: Readonly<RuleContext<MessageIds, [ConsistentObjectSchemaTypeOptions]>>,
  options: Readonly<OptionsWithDefaults<[ConsistentObjectSchemaTypeOptions]>>,
) => RuleListener {
  return function create(context, [{ allow: allowedList }]) {
    const { createSchemaVisitor, getZodChainFactory } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: ZOD_OBJECT_METHODS,
      onSchema(node, { schemaType }): void {
        if (allowedList.includes(schemaType)) {
          return;
        }

        const { callee } = node;

        // A call of a call (`z.object({})()`) is left alone.
        if (
          callee.type !== AST_NODE_TYPES.Identifier &&
          callee.type !== AST_NODE_TYPES.MemberExpression
        ) {
          return;
        }

        // The factory, not `node.callee`: that is the outermost call (`.optional` in `z.object({}).optional()`).
        // Only `<namespace>.<factory>` can be renamed in place.
        const factory = getZodChainFactory(node)?.member;
        const factoryName =
          factory?.object.type === AST_NODE_TYPES.Identifier ? factory.property : null;

        context.report({
          node,
          messageId: 'consistentMethod',
          data: { actual: schemaType, allowedList: allowedList.join(',') },
          suggest: factoryName
            ? allowedList.map<ReportSuggestionArray<MessageIds>[number]>((it) => ({
                messageId: 'useMethod',
                data: { expected: it },
                fix(fixer): RuleFix {
                  return fixer.replaceText(factoryName, it);
                },
              }))
            : [],
        });
      },
    });
  };
}
