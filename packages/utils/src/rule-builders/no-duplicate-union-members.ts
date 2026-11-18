import type { ZodExportName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { hasCommentInRange } from '../has-comment-in-range.js';
import type { ReportFixFunction, RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'duplicateMember' | 'duplicateDiscriminatedUnionMember' | 'removeDuplicate';

const FACTORIES = [
  'union',
  'discriminatedUnion',
  'enum',
  'literal',
] as const satisfies ReadonlyArray<ZodExportName>;

type Factory = (typeof FACTORIES)[number];

// Members are compared as values, so only literals are known to repeat.
const VALUE_FACTORIES: ReadonlySet<Factory> = new Set(['enum', 'literal']);

/** The member's AST without positions, so whitespace and comments do not tell two members apart. */
function structuralKey(node: TSESTree.Node): string {
  return JSON.stringify(node, (key, value: unknown) => {
    if (key === 'parent' || key === 'range' || key === 'loc' || key === 'raw') {
      return undefined;
    }
    return typeof value === 'bigint' ? `${value}n` : value;
  });
}

/**
 * Builds the `create` function for the `no-duplicate-union-members` rule.
 *
 * Reports a member repeated in `union`, `discriminatedUnion`, `enum` or array `literal`:
 * a literal value for the last two, any textually equal expression for the unions.
 * Only `enum` is autofixed, since only it dedupes its error and JSON Schema output; the rest get a suggestion.
 * Bails on a spread or a hole in the member list.
 */
export function buildNoDuplicateUnionMembersCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const { sourceCode } = context;
    const { createSchemaVisitor, getZodChainFactory } = scope.createTracker({ kind: 'value' });

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
        const list = factory?.node.arguments.at(schemaType === 'discriminatedUnion' ? 1 : 0);
        if (list?.type !== AST_NODE_TYPES.ArrayExpression) {
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
        const seen = new Map<string, TSESTree.Expression>();
        for (const element of elements) {
          if (isValueList && element.type !== AST_NODE_TYPES.Literal) {
            continue;
          }
          const key = structuralKey(element);
          const first = seen.get(key);
          if (!first) {
            seen.set(key, element);
            continue;
          }

          const fix = buildRemoveFix(element);
          context.report({
            node: element,
            messageId:
              schemaType === 'discriminatedUnion'
                ? 'duplicateDiscriminatedUnionMember'
                : 'duplicateMember',
            data: { line: first.loc.start.line },
            fix: schemaType === 'enum' ? fix : null,
            suggest: schemaType !== 'enum' && fix ? [{ messageId: 'removeDuplicate', fix }] : [],
          });
        }
      },
    });
  };
}
