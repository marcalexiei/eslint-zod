import type { ZodCoreExportName, ZodExportName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { hasCommentInRange } from '../has-comment-in-range.js';
import type { ReportFixFunction, RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'duplicateMember' | 'duplicateDiscriminatedUnionMember' | 'removeDuplicate';

// The index of each factory's member list; `zod/v4/core`'s builders take the schema class first.
const MEMBER_LIST_INDEX: ReadonlyMap<string, number> = new Map<
  ZodCoreExportName | ZodExportName,
  number
>([
  ['union', 0],
  ['discriminatedUnion', 1],
  ['enum', 0],
  ['literal', 0],
  ['_union', 1],
  ['_discriminatedUnion', 2],
  ['_enum', 1],
  ['_literal', 1],
]);

const FACTORIES = [...MEMBER_LIST_INDEX.keys()];

// Members are compared as values, so only literals are known to repeat.
const VALUE_FACTORIES: ReadonlySet<string> = new Set<ZodCoreExportName | ZodExportName>([
  'enum',
  'literal',
  '_enum',
  '_literal',
]);

// Only an enum dedupes its error and JSON Schema output too.
const FIXABLE_FACTORIES: ReadonlySet<string> = new Set<ZodCoreExportName | ZodExportName>([
  'enum',
  '_enum',
]);

const DISCRIMINATED_FACTORIES: ReadonlySet<string> = new Set<ZodCoreExportName | ZodExportName>([
  'discriminatedUnion',
  '_discriminatedUnion',
]);

const CLOSING_BRACKETS: ReadonlySet<string> = new Set([')', ']', '}']);

/** A literal's value, keyed by type so `1` and `'1'` differ; `null` for a regular expression. */
function literalKey(node: TSESTree.Literal): string | null {
  if ('bigint' in node) {
    return `bigint:${node.bigint}`;
  }
  if ('regex' in node) {
    return null;
  }
  return `${typeof node.value}:${String(node.value)}`;
}

/**
 * Builds the `create` function for the `no-duplicate-union-members` rule.
 *
 * Reports a member repeated in `union`, `discriminatedUnion`, `enum` or array `literal`,
 * or in their `zod/v4/core` builders (`_union`, …):
 * a literal value for the last two, the same tokens for the unions.
 * Only a v4 enum is autofixed; the rest get a suggestion.
 * Bails on a spread or a hole in the member list.
 */
export function buildNoDuplicateUnionMembersCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const { sourceCode } = context;
    const { createSchemaVisitor, getZodChainFactory, resolveZodExport } = scope.createTracker({
      kind: 'value',
      sourceCode,
    });

    /** The member's tokens, so whitespace, comments and trailing commas do not tell two members apart. */
    function tokenKey(element: TSESTree.Expression): string | null {
      const tokens: Array<[string, string]> = [];
      const before = sourceCode.getTokenBefore(element);
      let token = before && sourceCode.getTokenAfter(before);
      while (token && token.range[1] <= element.range[1]) {
        const next = sourceCode.getTokenAfter(token);
        const trailingComma = token.value === ',' && CLOSING_BRACKETS.has(next?.value ?? '');
        if (!trailingComma) {
          tokens.push([token.type, token.value]);
        }
        token = next;
      }
      return tokens.length > 0 ? JSON.stringify(tokens) : null;
    }

    /** Removes the element and the comma before it; `null` when that would drop a comment or a parenthesis. */
    function buildRemoveFix(element: TSESTree.Expression): ReportFixFunction | null {
      const before = sourceCode.getTokenBefore(element);
      const after = sourceCode.getTokenAfter(element);
      if (before?.value !== ',' || (after?.value !== ',' && after?.value !== ']')) {
        return null;
      }
      const range: TSESTree.Range = [before.range[0], element.range[1]];
      return hasCommentInRange(sourceCode, range)
        ? null
        : (fixer): RuleFix => fixer.removeRange(range);
    }

    return createSchemaVisitor({
      schemaType: FACTORIES,
      onSchema(node, { schemaType }): void {
        const factory = getZodChainFactory(node);
        const list = factory?.node.arguments.at(MEMBER_LIST_INDEX.get(schemaType) ?? 0);
        if (!factory || list?.type !== AST_NODE_TYPES.ArrayExpression) {
          return;
        }

        const elements: Array<TSESTree.Expression> = [];
        for (const element of list.elements) {
          if (!element || element.type === AST_NODE_TYPES.SpreadElement) {
            return;
          }
          elements.push(element);
        }

        const isValueList = VALUE_FACTORIES.has(schemaType);
        // `zod/v3` keeps a repeated enum value in `options` and in its issues.
        const source = resolveZodExport(factory.node.callee)?.declaration.source.value;
        const fixable =
          FIXABLE_FACTORIES.has(schemaType) && source !== undefined && source !== 'zod/v3';
        const seen = new Map<string, TSESTree.Expression>();
        for (const element of elements) {
          let key: string | null;
          if (isValueList) {
            key = element.type === AST_NODE_TYPES.Literal ? literalKey(element) : null;
          } else {
            key = tokenKey(element);
          }
          if (key === null) {
            continue;
          }
          const first = seen.get(key);
          if (!first) {
            seen.set(key, element);
            continue;
          }

          const fix = buildRemoveFix(element);
          context.report({
            node: element,
            messageId: DISCRIMINATED_FACTORIES.has(schemaType)
              ? 'duplicateDiscriminatedUnionMember'
              : 'duplicateMember',
            data: { line: first.loc.start.line },
            fix: fixable ? fix : null,
            suggest: !fixable && fix ? [{ messageId: 'removeDuplicate', fix }] : [],
          });
        }
      },
    });
  };
}
