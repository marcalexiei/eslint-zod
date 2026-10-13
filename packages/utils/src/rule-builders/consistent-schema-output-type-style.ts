import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { RuleContext, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

export const ZOD_SCHEMA_TYPE_STYLES = Object.freeze(['infer', 'output'] as const);

type SchemaTypeStyle = (typeof ZOD_SCHEMA_TYPE_STYLES)[number];

export interface ConsistentSchemaOutputTypeStyleOptions {
  style: SchemaTypeStyle;
}

type MessageIds = 'useInfer' | 'useOutput';

export function buildConsistentSchemaOutputTypeStyleCreate(
  scope: ZodImportScope,
): (
  context: Readonly<RuleContext<MessageIds, [ConsistentSchemaOutputTypeStyleOptions]>>,
  options: readonly [ConsistentSchemaOutputTypeStyleOptions],
) => RuleListener {
  return function create(context, [{ style }]) {
    const {
      importDeclarationListener,
      isZodNamespace,
      getNamedImportOriginal,
      getNamedImportLocal,
      // A name in a type position reaches it through either import form.
    } = scope.createTracker({ kind: 'all' });

    return {
      ImportDeclaration: importDeclarationListener,

      TSTypeReference(node: TSESTree.TSTypeReference): void {
        const { typeName } = node;

        if (typeName.type === AST_NODE_TYPES.TSQualifiedName) {
          const { left, right } = typeName;

          if (left.type !== AST_NODE_TYPES.Identifier || !isZodNamespace(left.name)) {
            return;
          }

          const usedStyle = right.name;

          if ((usedStyle !== 'infer' && usedStyle !== 'output') || usedStyle === style) {
            return;
          }

          context.report({
            node: right,
            messageId: style === 'infer' ? 'useInfer' : 'useOutput',
            fix(fixer) {
              return fixer.replaceText(right, style);
            },
          });

          return;
        }

        if (typeName.type === AST_NODE_TYPES.Identifier) {
          const originalName = getNamedImportOriginal(typeName.name);

          if ((originalName !== 'infer' && originalName !== 'output') || originalName === style) {
            return;
          }

          const targetLocalName = getNamedImportLocal(style);

          context.report({
            node: typeName,
            messageId: style === 'infer' ? 'useInfer' : 'useOutput',
            fix(fixer) {
              // 'infer' cannot be used as a standalone type name (TypeScript keyword),
              // so only fix when the target local name is safe to use directly.
              if (!targetLocalName || targetLocalName === 'infer') {
                return null;
              }
              return fixer.replaceText(typeName, targetLocalName);
            },
          });
        }
      },
    };
  };
}
