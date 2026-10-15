import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import {
  bindsWholeModule,
  getImportSyntax,
  getUsageReplacement,
  getUsageText,
} from '../import-syntax-helpers.js';
import type { ImportSyntax } from '../import-syntax-helpers.js';
import type { RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

export interface ConsistentImportOptions<TSyntax extends ImportSyntax = ImportSyntax> {
  syntax: TSyntax;
}

type MessageIds = 'changeImportSyntax' | 'removeDuplicate' | 'convertUsage';

/**
 * Builds `consistent-import`: one import per source, written in `syntax`, every usage rewritten against it.
 * Fixes nothing in a source when one of its usages has no in-place rewrite.
 */
export function buildConsistentImportCreate<TSyntax extends ImportSyntax = ImportSyntax>(
  scope: ZodImportScope,
): (
  context: Readonly<RuleContext<MessageIds, [ConsistentImportOptions<TSyntax>]>>,
  options: readonly [ConsistentImportOptions<TSyntax>],
) => RuleListener {
  return function create(context, [{ syntax }]) {
    const { sourceCode } = context;

    return {
      Program(program): void {
        const importsBySource = new Map<string, Array<TSESTree.ImportDeclaration>>();
        for (const node of program.body) {
          if (
            node.type === AST_NODE_TYPES.ImportDeclaration &&
            scope.isAllowed(node.source.value)
          ) {
            importsBySource.set(node.source.value, [
              ...(importsBySource.get(node.source.value) ?? []),
              node,
            ]);
          }
        }

        // Each source without an alias of its own gets a distinct one: `z`, `z1`, …
        let fallbackAliasCount = 0;

        for (const imports of importsBySource.values()) {
          const [first, ...duplicates] = imports;
          const specifiers = imports.flatMap((it) => it.specifiers);
          // `importKind` is not set by espree: https://github.com/marcalexiei/eslint-zod/issues/501
          const isTypeOnly = imports.every((it) => it.importKind === 'type');

          const aliasSpecifier = specifiers.find(bindsWholeModule);
          let alias = aliasSpecifier?.local.name;
          if (alias === undefined) {
            alias = fallbackAliasCount > 0 ? `z${fallbackAliasCount}` : 'z';
            fallbackAliasCount += 1;
          }

          const usages = specifiers
            .filter((it) => it !== aliasSpecifier)
            .flatMap((specifier) => {
              const text = getUsageText(specifier, alias);
              return sourceCode
                .getDeclaredVariables(specifier)
                .flatMap((variable) => variable.references)
                .map(({ identifier }) => ({
                  identifier,
                  replacement:
                    text === null
                      ? null
                      : getUsageReplacement(identifier as TSESTree.Identifier, text),
                }));
            });
          const isFixable = usages.every((it) => it.replacement !== null);

          const isFirstValid =
            first.specifiers.length === 1 &&
            getImportSyntax(first.specifiers[0]) === syntax &&
            // A source used as a value cannot keep a type-only first import
            (first.importKind === 'type') === isTypeOnly;

          if (!isFirstValid) {
            const specifierText = {
              namespace: `* as ${alias}`,
              named: alias === 'z' ? '{ z }' : `{ z as ${alias} }`,
              default: alias,
            }[syntax];
            const text = `import ${isTypeOnly ? 'type ' : ''}${specifierText} from ${first.source.raw};`;
            context.report({
              node: first,
              messageId: 'changeImportSyntax',
              data: { syntax },
              fix: isFixable ? (fixer): RuleFix => fixer.replaceText(first, text) : null,
            });
          }

          for (const { identifier, replacement } of usages) {
            context.report({
              node: identifier,
              messageId: 'convertUsage',
              data: { syntax },
              fix:
                isFixable && replacement
                  ? (fixer): RuleFix => fixer.replaceText(replacement.node, replacement.text)
                  : null,
            });
          }

          for (const duplicate of duplicates) {
            context.report({
              node: duplicate,
              messageId: 'removeDuplicate',
              fix: isFixable ? (fixer): RuleFix => fixer.removeRange(duplicate.range) : null,
            });
          }
        }
      },
    };
  };
}

export { IMPORT_SYNTAXES, type ImportSyntax } from '../import-syntax-helpers.js';
