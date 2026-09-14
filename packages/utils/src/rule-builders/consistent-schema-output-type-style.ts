import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';

type SchemaTypeStyle = 'infer' | 'output';

interface Options {
  style: SchemaTypeStyle;
}

type MessageIds = 'useInfer' | 'useOutput';

export function buildConsistentSchemaOutputTypeStyleCreate(
  scope: ZodImportScope,
): (
  context: Readonly<TSESLint.RuleContext<MessageIds, [Options]>>,
  options: readonly [Options],
) => TSESLint.RuleListener {
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
