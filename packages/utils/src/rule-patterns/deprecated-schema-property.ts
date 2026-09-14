import type { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

/** Options for {@link buildDeprecatedSchemaPropertyCreate}. */
export interface DeprecatedSchemaPropertyOptions<TMessageIds extends string> {
  scope: ZodImportScope;

  /** Schema factory the property is accessed on (e.g. `number`). */
  schemaType: string;

  /** The deprecated property, accessed without calling it (e.g. `isInt`). */
  propertyName: string;

  /** Message reported on the property access. */
  messageId: TMessageIds;
}

/**
 * Flags a deprecated property access on a schema of `schemaType` (`z.number().isInt`).
 * Report-only: the replacement depends on surrounding code, so no fix is safe.
 */
export function buildDeprecatedSchemaPropertyCreate<TMessageIds extends string>(
  options: DeprecatedSchemaPropertyOptions<TMessageIds>,
): (context: Readonly<TSESLint.RuleContext<TMessageIds, []>>) => TSESLint.RuleListener {
  const { scope, schemaType, propertyName, messageId } = options;

  return function create(context) {
    const { importDeclarationListener, isZodSchemaOfType } = scope.createTracker({ kind: 'value' });

    return {
      ImportDeclaration: importDeclarationListener,

      MemberExpression(node): void {
        if (node.computed) {
          return;
        }
        if (node.property.type !== AST_NODE_TYPES.Identifier) {
          return;
        }
        if (node.property.name !== propertyName) {
          return;
        }
        if (node.object.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }
        if (!isZodSchemaOfType(node.object, schemaType)) {
          return;
        }

        context.report({ node, messageId });
      },
    };
  };
}
