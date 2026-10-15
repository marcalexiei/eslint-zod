import type { TSESTree } from '@typescript-eslint/types';

import { hasCommentInRange } from '../has-comment-in-range.js';
import {
  bindsWholeModule,
  getImportSyntax,
  getUsageReplacement,
  getUsageText,
} from '../import-syntax-helpers.js';
import type { ImportSyntax } from '../import-syntax-helpers.js';
import type { RuleContext, RuleFix, RuleListener, Scope } from '../rule-types.js';
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

    // Imports by the body holding them (the program, or a `declare module` block), then by source
    const importsByBody = new Map<TSESTree.Node, Map<string, Array<TSESTree.ImportDeclaration>>>();

    function checkBody(importsBySource: Map<string, Array<TSESTree.ImportDeclaration>>): void {
      // Fallback aliases already given to a source: `z`, `z1`, …
      const fallbackAliases = new Set<string>();

      for (const imports of importsBySource.values()) {
        const [first, ...duplicates] = imports;
        const specifiers = imports.flatMap((it) => it.specifiers);
        // A side-effect import (`import 'zod'`) has no syntax to enforce
        if (specifiers.length === 0) {
          continue;
        }
        // `importKind` is not set by espree: https://github.com/marcalexiei/eslint-zod/issues/501
        const isTypeOnly = imports.every((it) => it.importKind === 'type');

        const aliasSpecifier = specifiers.find(bindsWholeModule);
        const ownVariables = specifiers.flatMap((it) => sourceCode.getDeclaredVariables(it));
        const references = specifiers
          .filter((it) => it !== aliasSpecifier)
          .flatMap((specifier) =>
            sourceCode
              .getDeclaredVariables(specifier)
              .flatMap((variable) => variable.references)
              .map(({ identifier }) => ({ specifier, identifier })),
          );

        // Whether `name` reaches this source's imports from every node the fix writes it at
        const isNameFree = (name: string): boolean =>
          [first, ...references.map((it) => it.identifier)].every((node) => {
            for (let s: Scope | null = sourceCode.getScope(node); s; s = s.upper) {
              const variable = s.set.get(name);
              if (variable && !ownVariables.includes(variable)) {
                return false;
              }
            }
            return true;
          });

        let alias = aliasSpecifier?.local.name;
        if (alias === undefined) {
          let index = 0;
          do {
            alias = index > 0 ? `z${index}` : 'z';
            index += 1;
          } while (fallbackAliases.has(alias) || !isNameFree(alias));
          fallbackAliases.add(alias);
        }

        const usages = references.map(({ specifier, identifier }) => {
          const text = getUsageText(specifier, alias);
          const replacement =
            text === null ? null : getUsageReplacement(identifier as TSESTree.Identifier, text);
          return {
            identifier,
            replacement:
              replacement && !hasCommentInRange(sourceCode, replacement.node.range)
                ? replacement
                : null,
          };
        });

        const isFirstValid =
          first.specifiers.length === 1 &&
          getImportSyntax(first.specifiers[0]) === syntax &&
          // A source used as a value cannot keep a type-only first import
          (first.importKind === 'type') === isTypeOnly;
        // A fix must neither drop a comment nor leave a usage bound to another variable
        const isFixable =
          usages.every((it) => it.replacement !== null) &&
          isNameFree(alias) &&
          !(isFirstValid ? duplicates : imports).some((it) =>
            hasCommentInRange(sourceCode, it.range),
          );

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
    }

    return {
      ImportDeclaration(node): void {
        if (!scope.isAllowed(node.source.value)) {
          return;
        }
        const importsBySource =
          importsByBody.get(node.parent) ?? new Map<string, Array<TSESTree.ImportDeclaration>>();
        importsByBody.set(node.parent, importsBySource);
        importsBySource.set(node.source.value, [
          ...(importsBySource.get(node.source.value) ?? []),
          node,
        ]);
      },

      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Program:exit': function (): void {
        for (const importsBySource of importsByBody.values()) {
          checkBody(importsBySource);
        }
      },
    };
  };
}

export { IMPORT_SYNTAXES, type ImportSyntax } from '../import-syntax-helpers.js';
