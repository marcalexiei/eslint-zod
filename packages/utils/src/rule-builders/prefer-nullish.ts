import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { buildZodWrapperUnwrapFix } from '../build-zod-wrapper-unwrap-fix.js';
import type { ZodSchemaMeta } from '../detect-zod-schema-root-node.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'preferNullish';

/**
 * Builds the `create` function for the `prefer-nullish` rule.
 *
 * Handles both API spellings with the same logic:
 * - chained methods (`zod`): `schema.optional().nullable()` /
 * `schema.nullable().optional()`, found via `collectZodChainMethods` —
 * the two methods must be directly adjacent in the chain.
 * - wrapper factories (`zod/mini`): `z.optional(z.nullable(inner))` /
 * `z.nullable(z.optional(inner))`,
 * where the outer wrapper's single argument is the other bare wrapper (no intervening chain, no extra arguments).
 *
 * Both cases are equivalent to `nullish` and are autofixed to it.
 */
export function buildPreferNullishCreate(
  scope: ZodImportScope,
): (context: Readonly<TSESLint.RuleContext<MessageIds, []>>) => TSESLint.RuleListener {
  return function create(context) {
    const { sourceCode } = context;
    const {
      createSchemaVisitor,
      detectZodSchemaRootNode,
      collectZodChainMethods,
      getNamedImportLocal,
    } = scope.createTracker({ kind: 'value' });

    /**
     * Fixer that renames the factory of a wrapper call to `nullish`.
     * Namespace style renames the member property (`z.optional` → `z.nullish`);
     * named style renames the callee identifier to `nullish`'s local name and returns `null` when `nullish` was not imported (an unsafe fix).
     */
    function renameWrapperFactory(
      fixer: TSESLint.RuleFixer,
      wrapperCall: TSESTree.CallExpression,
      schemaDecl: 'namespace' | 'named',
    ): TSESLint.RuleFix | null {
      const { callee } = wrapperCall;

      if (schemaDecl === 'namespace') {
        // A namespace schema is detected only when its factory is a member of the namespace,
        // so this call is always `<ns>.<factory>(…)`.
        const { property } = callee as TSESTree.MemberExpression;
        return fixer.replaceText(property, 'nullish');
      }

      // A named-import schema is normally called bare (`optional(…)`),
      // but the import can also be used as an object (`optional.foo(…)`),
      // and that still parses as a `named` schema.
      // Replacing the whole callee there would delete the member call, so decline the fix instead.
      if (callee.type !== AST_NODE_TYPES.Identifier) {
        return null;
      }

      const nullishLocalName = getNamedImportLocal('nullish');
      if (!nullishLocalName) {
        return null;
      }
      return fixer.replaceText(callee, nullishLocalName);
    }

    /** Wrapper form (`zod/mini`): `z.optional(z.nullable(inner))`. */
    function handleWrapper(node: TSESTree.CallExpression, meta: ZodSchemaMeta): void {
      const wrapperCall = collectZodChainMethods(node).at(0)?.node;
      // The leftmost chain item is the factory call itself; guard extra args.
      if (wrapperCall?.arguments.length !== 1) {
        return;
      }

      const [inner] = wrapperCall.arguments;
      if (inner.type !== AST_NODE_TYPES.CallExpression) {
        return;
      }

      const other = meta.schemaType === 'optional' ? 'nullable' : 'optional';
      const innerMeta = detectZodSchemaRootNode(inner);
      // The inner must be the *other* bare wrapper: same factory, single argument,
      // and no trailing chain (which would carry checks we'd drop).
      if (
        innerMeta?.schemaType !== other ||
        collectZodChainMethods(inner).length !== 1 ||
        inner.arguments.length !== 1 ||
        inner.arguments[0].type === AST_NODE_TYPES.SpreadElement
      ) {
        return;
      }

      context.report({
        node: wrapperCall,
        messageId: 'preferNullish',
        fix(fixer) {
          const renameFix = renameWrapperFactory(fixer, wrapperCall, meta.schemaDecl);
          if (!renameFix) {
            return null;
          }
          const unwrapFix = buildZodWrapperUnwrapFix({ fixer, sourceCode, wrapperCall: inner });
          if (!unwrapFix) {
            return null;
          }
          return [renameFix, unwrapFix];
        },
      });
    }

    /** Chained form (`zod`): `schema.optional().nullable()`. */
    function handleChained(node: TSESTree.CallExpression): void {
      const methods = collectZodChainMethods(node);
      const optionalIndex = methods.findIndex((it) => it.name === 'optional');
      const nullableIndex = methods.findIndex((it) => it.name === 'nullable');

      if (optionalIndex === -1 || nullableIndex === -1) {
        return;
      }
      // Only fire when the two methods are directly adjacent —
      // an intervening method (e.g. `.describe()`) makes merging into `.nullish()` unsafe.
      if (Math.abs(optionalIndex - nullableIndex) !== 1) {
        return;
      }

      const earlier = methods[Math.min(optionalIndex, nullableIndex)];
      const later = methods[Math.max(optionalIndex, nullableIndex)];

      context.report({
        node: later.node,
        messageId: 'preferNullish',
        fix(fixer) {
          const earlierCallee = earlier.node.callee;
          const laterCallee = later.node.callee;
          if (
            earlierCallee.type !== AST_NODE_TYPES.MemberExpression ||
            laterCallee.type !== AST_NODE_TYPES.MemberExpression ||
            laterCallee.property.type !== AST_NODE_TYPES.Identifier
          ) {
            return null;
          }
          // Drop the earlier method, keep its object, and rename the later one to `nullish`:
          // both orderings collapse to `…nullish()`.
          return [
            fixer.replaceText(earlier.node, sourceCode.getText(earlierCallee.object)),
            fixer.replaceText(laterCallee.property, 'nullish'),
          ];
        },
      });
    }

    return createSchemaVisitor({
      onSchema(node, meta): void {
        if (meta.schemaType === 'optional' || meta.schemaType === 'nullable') {
          handleWrapper(node, meta);
          return;
        }

        handleChained(node);
      },
    });
  };
}
