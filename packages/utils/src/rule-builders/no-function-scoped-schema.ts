import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'functionScopedSchema';
type IsLazyCall = (node: TSESTree.Node) => boolean;

const FUNCTION_NODE_TYPES: ReadonlySet<TSESTree.AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.ArrowFunctionExpression,
]);

/**
 * The two recursive-schema idioms where a function is the schema's only legal
 * home: an object getter, and the thunk passed to `z.lazy()`. Walking past one
 * leaves the enclosing scope — not the thunk — deciding whether to report.
 */
function isRecursiveSchemaThunk(node: TSESTree.Node, isLazyCall: IsLazyCall): boolean {
  const { parent } = node;

  return parent?.type === AST_NODE_TYPES.Property
    ? parent.kind === 'get' && parent.value === node
    : parent?.type === AST_NODE_TYPES.CallExpression &&
        parent.callee !== node &&
        isLazyCall(parent);
}

/**
 * Flags a zod schema constructed inside a function body — `() => z.string()`,
 * or a schema declared in a function's block — instead of once at module
 * scope. Under `import 'zod/compile'` a schema instance is compiled lazily on
 * first parse, so a per-call schema is rebuilt (and recompiled) on every call.
 */
export function buildNoFunctionScopedSchemaCreate(
  scope: ZodImportScope,
): (context: Readonly<TSESLint.RuleContext<MessageIds, []>>) => TSESLint.RuleListener {
  return function create(context) {
    const { createSchemaVisitor, isZodSchemaOfType } = scope.createTracker();
    // Populated with every reported root, so a schema nested inside another
    // reported schema (`z.object({ a: z.string() })`) is reported once.
    const reportedSchemaCalls = new WeakSet<TSESTree.CallExpression>();
    const isLazyCall: IsLazyCall = (node) => isZodSchemaOfType(node, 'lazy');

    return createSchemaVisitor({
      onSchema(node): void {
        let current: TSESTree.Node = node;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (current.parent) {
          const parent: TSESTree.Node = current.parent;

          if (parent.type === AST_NODE_TYPES.Program) {
            return;
          }

          if (parent.type === AST_NODE_TYPES.CallExpression && reportedSchemaCalls.has(parent)) {
            return;
          }

          if (FUNCTION_NODE_TYPES.has(parent.type) && !isRecursiveSchemaThunk(parent, isLazyCall)) {
            reportedSchemaCalls.add(node);
            context.report({ node, messageId: 'functionScopedSchema' });
            return;
          }

          current = parent;
        }
      },
    });
  };
}
