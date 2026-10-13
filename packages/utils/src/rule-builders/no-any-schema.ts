import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'noZAny' | 'useUnknown';

export function buildNoAnySchemaCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({ kind: 'value' });

    return createSchemaVisitor({
      schemaType: 'any',
      onSchema(node): void {
        // A call of a call (`z.any()()`) is left alone.
        if (
          node.callee.type !== AST_NODE_TYPES.Identifier &&
          node.callee.type !== AST_NODE_TYPES.MemberExpression
        ) {
          return;
        }

        // Only `<namespace>.any` can be renamed in place:
        // a named import (`any()`) has no member, a computed factory (`z['any']()`) no walkable chain,
        // and after a property access (`z.any().shape.x()`) the chain no longer starts at the factory.
        const head = collectZodChainMethods(node).at(0)?.member;
        const factoryCallee = head?.object.type === AST_NODE_TYPES.Identifier ? head : null;

        context.report({
          node,
          messageId: 'noZAny',
          suggest: factoryCallee
            ? [
                {
                  messageId: 'useUnknown',
                  fix(fixer): RuleFix {
                    return fixer.replaceText(factoryCallee.property, 'unknown');
                  },
                },
              ]
            : [],
        });
      },
    });
  };
}
