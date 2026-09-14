import type { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

const ZOD_OBJECT_METHODS = ['object', 'looseObject', 'strictObject'] as const;

type ZodObjectMethod = (typeof ZOD_OBJECT_METHODS)[number];

interface Options {
  allow: Array<ZodObjectMethod>;
}

type MessageIds = 'consistentMethod' | 'useMethod';

export function buildConsistentObjectSchemaTypeCreate(
  scope: ZodImportScope,
): (
  context: Readonly<TSESLint.RuleContext<MessageIds, [Options]>>,
  options: readonly [Options],
) => TSESLint.RuleListener {
  return function create(context, [{ allow: allowedList }]) {
    const { createSchemaVisitor } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: ZOD_OBJECT_METHODS,
      onSchema(node, { schemaType }): void {
        if (allowedList.includes(schemaType)) {
          return;
        }

        const { callee } = node;

        if (callee.type === AST_NODE_TYPES.Identifier) {
          context.report({
            node,
            messageId: 'consistentMethod',
            data: { actual: schemaType, allowedList: allowedList.join(',') },
          });
          return;
        }

        if (callee.type === AST_NODE_TYPES.MemberExpression) {
          context.report({
            node,
            messageId: 'consistentMethod',
            data: {
              actual: schemaType,
              allowedList: allowedList.join(','),
            },
            suggest: allowedList.map<TSESLint.ReportSuggestionArray<MessageIds>[number]>((it) => ({
              messageId: 'useMethod',
              data: { expected: it },
              fix(fixer): TSESLint.RuleFix {
                return fixer.replaceText(callee.property, it);
              },
            })),
          });
        }
      },
    });
  };
}
