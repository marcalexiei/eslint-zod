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

      TSTypeReference({ typeName }: TSESTree.TSTypeReference): void {
        // `z.output` is rewritten as a member; a named `output` as the local name of the other import.
        let target: TSESTree.Identifier;
        let usedStyle: string | undefined;
        let replacement: string | undefined;
        if (typeName.type === AST_NODE_TYPES.TSQualifiedName) {
          const { left, right } = typeName;
          if (left.type !== AST_NODE_TYPES.Identifier || !isZodNamespace(left.name)) {
            return;
          }
          [target, usedStyle, replacement] = [right, right.name, style];
        } else if (typeName.type === AST_NODE_TYPES.Identifier) {
          const local = getNamedImportLocal(style);
          // `infer` is a keyword, so it cannot stand alone as a type name.
          [target, usedStyle, replacement] = [
            typeName,
            getNamedImportOriginal(typeName.name),
            local === 'infer' ? undefined : local,
          ];
        } else {
          return;
        }
        if ((usedStyle !== 'infer' && usedStyle !== 'output') || usedStyle === style) {
          return;
        }
        context.report({
          node: target,
          messageId: style === 'infer' ? 'useInfer' : 'useOutput',
          fix: (fixer) => (replacement ? fixer.replaceText(target, replacement) : null),
        });
      },
    };
  };
}
