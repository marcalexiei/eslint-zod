import type { TSESTree } from '@typescript-eslint/types';

import {
  getNamespaceAliasNameFrom,
  getUsageReplacement,
  isGroupFirstImportKindValidForSyntax,
} from '../import-syntax-helpers.js';
import type { ImportGroupData, ImportSyntax, UsageReplacement } from '../import-syntax-helpers.js';
import type { RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

export interface ConsistentImportOptions<TSyntax extends ImportSyntax = ImportSyntax> {
  syntax: TSyntax;
}

type MessageIds = 'changeImportSyntax' | 'removeDuplicate' | 'convertUsage';

export function buildConsistentImportCreate<TSyntax extends ImportSyntax = ImportSyntax>(
  scope: ZodImportScope,
): (
  context: Readonly<RuleContext<MessageIds, [ConsistentImportOptions<TSyntax>]>>,
  options: readonly [ConsistentImportOptions<TSyntax>],
) => RuleListener {
  return function create(context, [options]) {
    const { syntax } = options;

    const { sourceCode } = context;

    const importGroups: Record<string, ImportGroupData> = {};

    return {
      ImportDeclaration(node): void {
        const { source, importKind } = node;

        if (!scope.isAllowed(source.value)) {
          return;
        }

        importGroups[source.value] ??= {
          hasOnlyTypeImports: true,
          nodes: [],
        };

        /**
         * `importKind` is not set by espree
         * @see https://github.com/marcalexiei/eslint-zod/issues/501
         */
        if (importGroups[source.value].hasOnlyTypeImports && importKind !== 'type') {
          importGroups[source.value].hasOnlyTypeImports = false;
        }

        importGroups[source.value].nodes.push(node);
      },

      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Program:exit': function (): void {
        let namespaceAliasNameIndex = 0;

        for (const importGroup of Object.values(importGroups)) {
          const { hasOnlyTypeImports, nodes } = importGroup;
          const [firstImportNode, ...othersImportNodes] = nodes;

          // Specifiers of a single export, whose references get the alias as prefix
          const specifiersToQualify: Array<TSESTree.ImportClause> = [];
          // Further whole-module specifiers, whose references get the alias as name
          const specifiersToRename: Array<TSESTree.ImportClause> = [];

          let namespaceAliasName: string | null = null;

          for (const specifier of nodes.flatMap((it) => it.specifiers)) {
            const aliasName = getNamespaceAliasNameFrom(specifier);
            if (aliasName === null) {
              specifiersToQualify.push(specifier);
            } else if (namespaceAliasName === null) {
              namespaceAliasName = aliasName;
            } else {
              specifiersToRename.push(specifier);
            }
          }

          if (!namespaceAliasName) {
            // Each group that needs the fallback gets a distinct name, so two
            // sources rewritten in the same file don't both become `z`.
            namespaceAliasName = namespaceAliasNameIndex > 0 ? `z${namespaceAliasNameIndex}` : 'z';
            namespaceAliasNameIndex += 1;
          }

          const aliasName = namespaceAliasName;
          const collectUsages = (
            specifiers: Array<TSESTree.ImportClause>,
            getNewText: (name: string) => string,
          ): Array<{ identifier: TSESTree.Node; replacement: UsageReplacement | null }> =>
            specifiers
              .flatMap((it) => sourceCode.getDeclaredVariables(it))
              .flatMap((it) => it.references)
              .map(({ identifier }) => ({
                identifier,
                replacement: getUsageReplacement(
                  identifier as TSESTree.Identifier,
                  getNewText(identifier.name),
                ),
              }));
          const usages = [
            ...collectUsages(specifiersToQualify, (name) => `${aliasName}.${name}`),
            ...collectUsages(specifiersToRename, () => aliasName),
          ];
          // A usage with no rewrite would lose its binding, so the whole group goes unfixed
          const isFixable = usages.every((it) => it.replacement !== null);

          // Check if first import node is a namespace import
          const isFirstImportValid = isGroupFirstImportKindValidForSyntax(importGroup, syntax);

          // if first node is invalid turn it into a namespace import
          if (!isFirstImportValid) {
            context.report({
              node: firstImportNode,
              messageId: 'changeImportSyntax',
              data: { syntax },
              fix: isFixable
                ? (fixer): RuleFix => {
                    const importTypeKeyword = hasOnlyTypeImports ? 'type ' : '';
                    let importSpecifier: string | undefined;
                    if (syntax === 'named') {
                      if (aliasName === 'z') {
                        importSpecifier = '{ z }';
                      } else {
                        importSpecifier = `{ z as ${aliasName} }`;
                      }
                    } else if (syntax === 'default') {
                      importSpecifier = aliasName;
                    } else {
                      importSpecifier = `* as ${aliasName}`;
                    }
                    const newImportText = `import ${importTypeKeyword}${importSpecifier} from ${firstImportNode.source.raw};`;
                    return fixer.replaceText(firstImportNode, newImportText);
                  }
                : null,
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

          // Remove duplicate imports, if any
          for (const extraImport of othersImportNodes) {
            context.report({
              node: extraImport,
              messageId: 'removeDuplicate',
              fix: isFixable ? (fixer): RuleFix => fixer.removeRange(extraImport.range) : null,
            });
          }
        }
      },
    };
  };
}

export { IMPORT_SYNTAXES, type ImportSyntax } from '../import-syntax-helpers.js';
