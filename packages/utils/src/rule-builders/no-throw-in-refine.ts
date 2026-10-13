import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'noThrowInRefine';

export function buildNoThrowInRefineCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({ kind: 'value' });

    function checkNode(node: TSESTree.Node): void {
      switch (node.type) {
        case AST_NODE_TYPES.ThrowStatement:
          context.report({ node, messageId: 'noThrowInRefine' });
          break;
        case AST_NODE_TYPES.BlockStatement:
          node.body.forEach(checkNode);
          break;
        case AST_NODE_TYPES.IfStatement:
          checkNode(node.consequent);
          if (node.alternate) {
            checkNode(node.alternate);
          }
          break;
        case AST_NODE_TYPES.ForStatement:
        case AST_NODE_TYPES.ForInStatement:
        case AST_NODE_TYPES.ForOfStatement:
        case AST_NODE_TYPES.WhileStatement:
        case AST_NODE_TYPES.DoWhileStatement:
          checkNode(node.body);
          break;
        case AST_NODE_TYPES.TryStatement:
          checkNode(node.block);
          if (node.handler) {
            checkNode(node.handler.body);
          }
          if (node.finalizer) {
            checkNode(node.finalizer);
          }
          break;
        case AST_NODE_TYPES.SwitchStatement:
          node.cases.forEach((switchCase) => {
            switchCase.consequent.forEach(checkNode);
          });
          break;
        case AST_NODE_TYPES.LabeledStatement:
          checkNode(node.body);
          break;
        // Ignore nested functions
        case AST_NODE_TYPES.FunctionExpression:
        case AST_NODE_TYPES.ArrowFunctionExpression:
        case AST_NODE_TYPES.FunctionDeclaration:
          break;
        // no default
      }
    }

    return createSchemaVisitor({
      onSchema(node): void {
        for (const method of collectZodChainMethods(node)) {
          if (method.name !== 'refine') {
            continue;
          }

          // `.refine()` with no argument is invalid zod but valid JS,
          // so the argument list can legitimately be empty here.
          const callback = method.node.arguments.at(0);
          if (
            callback?.type === AST_NODE_TYPES.ArrowFunctionExpression ||
            callback?.type === AST_NODE_TYPES.FunctionExpression
          ) {
            checkNode(callback.body);
          }
        }
      },
    });
  };
}
