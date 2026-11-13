import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { getZodSchemaFactoryName } from '../get-zod-schema-factory-name.js';
import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

/** Options for {@link buildDeprecatedSchemaPropertyCreate}. */
export interface DeprecatedSchemaPropertyOptions<TMessageIds extends string> {
  scope: ZodImportScope;

  /** Schema factories the property is accessed on (e.g. `number`); `coerce.<name>()` counts as `<name>`. */
  schemaType: string | ReadonlyArray<string>;

  /** The deprecated property, accessed without calling it (e.g. `isInt`). */
  propertyName: string;

  /** Message reported on the property access. */
  messageId: TMessageIds;
}

/**
 * Flags a deprecated property access on a schema built by one of `schemaType` (`z.number().isInt`, or `amount.isInt` on a local schema).
 * Report-only: the replacement depends on surrounding code, so no fix is safe.
 */
export function buildDeprecatedSchemaPropertyCreate<TMessageIds extends string>(
  options: DeprecatedSchemaPropertyOptions<TMessageIds>,
): (context: Readonly<RuleContext<TMessageIds>>) => RuleListener {
  const { scope, schemaType, propertyName, messageId } = options;
  const schemaTypes: ReadonlyArray<string> =
    typeof schemaType === 'string' ? [schemaType] : schemaType;

  return function create(context) {
    const { importDeclarationListener, resolveZodSchema } = scope.createTracker({
      kind: 'value',
      sourceCode: context.sourceCode,
    });

    return {
      ImportDeclaration: importDeclarationListener,

      MemberExpression(node): void {
        if (
          node.computed ||
          node.property.type !== AST_NODE_TYPES.Identifier ||
          node.property.name !== propertyName
        ) {
          return;
        }
        // Also a schema bound to a `const` (`amount.isInt`), the usual form.
        const resolved = resolveZodSchema(node.object);
        const factory = resolved && getZodSchemaFactoryName(resolved);
        if (!factory || !schemaTypes.includes(factory)) {
          return;
        }

        context.report({ node, messageId });
      },
    };
  };
}
