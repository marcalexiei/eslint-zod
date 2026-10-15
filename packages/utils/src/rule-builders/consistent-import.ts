import type { TSESTree } from '@typescript-eslint/types';

import { hasCommentInRange } from '../has-comment-in-range.js';
import {
  bindsWholeModule,
  getImportSyntax,
  getUsageReplacement,
  getUsageText,
} from '../import-syntax-helpers.js';
import type { ImportSyntax } from '../import-syntax-helpers.js';
import type { RuleContext, RuleFix, RuleFixer, RuleListener, Scope } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

export interface ConsistentImportOptions<TSyntax extends ImportSyntax = ImportSyntax> {
  syntax: TSyntax;
}

type MessageIds = 'changeImportSyntax' | 'removeDuplicate' | 'convertUsage';

/**
 * Builds `consistent-import`: one import per source, written in `syntax`, every usage rewritten against it.
 * Fixes nothing in a source when a fix would break code or drop a comment.
 */
export function buildConsistentImportCreate<TSyntax extends ImportSyntax = ImportSyntax>(
  scope: ZodImportScope,
): (
  context: Readonly<RuleContext<MessageIds, [ConsistentImportOptions<TSyntax>]>>,
  options: readonly [ConsistentImportOptions<TSyntax>],
) => RuleListener {
  return function create(context, [{ syntax }]) {
    const { sourceCode } = context;

    // Imports by source, within the body holding them: the program or a `declare module` block
    const importGroups = new Map<string, Array<TSESTree.ImportDeclaration>>();

    function checkGroup(
      imports: Array<TSESTree.ImportDeclaration>,
      takenAliases: Set<string>,
    ): void {
      const [first, ...duplicates] = imports;
      const specifiers = imports.flatMap((it) => it.specifiers);
      // A side-effect import (`import 'zod'`) has no syntax to enforce
      if (specifiers.length === 0) {
        return;
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
      for (let index = 0; alias === undefined; index += 1) {
        const candidate = index > 0 ? `z${index}` : 'z';
        if (!takenAliases.has(candidate) && isNameFree(candidate)) {
          alias = candidate;
        }
      }
      takenAliases.add(alias);

      const usages = references.map(({ specifier, identifier }) => ({
        identifier,
        replacement: getUsageReplacement(
          identifier as TSESTree.Identifier,
          getUsageText(specifier, alias),
        ),
      }));

      const isFirstValid =
        first.specifiers.length === 1 &&
        getImportSyntax(first.specifiers[0]) === syntax &&
        // A source used as a value cannot keep a type-only first import
        (first.importKind === 'type') === isTypeOnly;
      // A fix must neither drop a comment nor leave a usage bound to another variable
      const isFixable =
        isNameFree(alias) &&
        usages.every(
          ({ replacement }) =>
            replacement && !hasCommentInRange(sourceCode, replacement.node.range),
        ) &&
        !(isFirstValid ? duplicates : imports).some((it) =>
          hasCommentInRange(sourceCode, it.range),
        );

      const report = (
        node: TSESTree.Node,
        messageId: MessageIds,
        fix: ((fixer: RuleFixer) => RuleFix) | null,
      ): void => {
        context.report({ node, messageId, data: { syntax }, fix: isFixable ? fix : null });
      };

      if (!isFirstValid) {
        const specifierText = {
          namespace: `* as ${alias}`,
          named: alias === 'z' ? '{ z }' : `{ z as ${alias} }`,
          default: alias,
        }[syntax];
        const text = `import ${isTypeOnly ? 'type ' : ''}${specifierText} from ${first.source.raw};`;
        report(first, 'changeImportSyntax', (fixer) => fixer.replaceText(first, text));
      }
      for (const { identifier, replacement } of usages) {
        report(
          identifier,
          'convertUsage',
          replacement &&
            ((fixer): RuleFix => fixer.replaceText(replacement.node, replacement.text)),
        );
      }
      for (const duplicate of duplicates) {
        report(duplicate, 'removeDuplicate', (fixer) => fixer.removeRange(duplicate.range));
      }
    }

    return {
      ImportDeclaration(node): void {
        if (scope.isAllowed(node.source.value)) {
          const key = `${node.parent.range[0]}:${node.source.value}`;
          importGroups.set(key, [...(importGroups.get(key) ?? []), node]);
        }
      },

      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Program:exit': function (): void {
        const takenAliases = new Set<string>();
        for (const imports of importGroups.values()) {
          checkGroup(imports, takenAliases);
        }
      },
    };
  };
}

export { IMPORT_SYNTAXES, type ImportSyntax } from '../import-syntax-helpers.js';
