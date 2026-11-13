import { zodImportScope } from '@eslint-zod/utils';
import { buildPreferTopLevelFactoryCreate } from '@eslint-zod/utils/rule-patterns/prefer-top-level-factory';
import type { RuleContext, RuleListener } from '@eslint-zod/utils/rule-types';

import { createZodPluginRule } from '../meta.js';
import {
  INTEGER_NUMBER_FACTORIES,
  NON_INTEGER_NUMBER_FACTORIES,
  isNumberSchema,
} from '../utils/number-factories.js';

type MessageIds = 'useInt' | 'removeSafe' | 'useIntMethod';

const createTopLevel = buildPreferTopLevelFactoryCreate<MessageIds>({
  scope: zodImportScope,
  factoryName: NON_INTEGER_NUMBER_FACTORIES,
  replacements: [{ sourceMethodName: 'safe', replacementMethodName: 'int' }],
  messageId: 'useInt',
  redundant: { factoryNames: INTEGER_NUMBER_FACTORIES, messageId: 'removeSafe' },
});

export const noNumberSchemaWithSafe = createZodPluginRule({
  name: 'no-number-schema-with-safe',
  meta: {
    fixable: 'code',
    type: 'problem',
    docs: {
      description:
        'Disallow deprecated `z.number().safe()`. Use `z.int()`; `.safe()` is now identical to `.int()`.',
    },
    messages: {
      useInt:
        '`.safe()` is deprecated; it is identical to `.int()`. Use `z.int()` (or the equivalent) instead of chaining `.safe()` on `z.{{factory}}()`.',
      removeSafe:
        '`.safe()` is deprecated, and `z.{{factory}}()` accepts only safe integers already. Remove this call.',
      useIntMethod:
        '`.safe()` is deprecated; it is identical to `.int()`. Use `.int()` on `z.coerce.number()`.',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context: Readonly<RuleContext<MessageIds>>): RuleListener {
    const topLevel = createTopLevel(context);

    const { createSchemaVisitor, findZodChainedMethod } = zodImportScope.createTracker({
      kind: 'value',
    });

    // No top-level factory coerces, so a coerced number keeps its factory and takes `.int()`.
    const coerced = createSchemaVisitor({
      schemaType: 'coerce',
      onSchema(node, zodSchemaMeta): void {
        if (!isNumberSchema(zodSchemaMeta)) {
          return;
        }
        const safe = findZodChainedMethod(node, zodSchemaMeta, 'safe');
        if (safe === null) {
          return;
        }

        context.report({
          node,
          messageId: 'useIntMethod',
          fix: (fixer) => (safe.member ? fixer.replaceText(safe.member.property, 'int') : null),
        });
      },
    });

    return {
      ImportDeclaration(node): void {
        topLevel.ImportDeclaration?.(node);
        coerced.ImportDeclaration?.(node);
      },
      CallExpression(node): void {
        topLevel.CallExpression?.(node);
        coerced.CallExpression?.(node);
      },
    };
  },
});
