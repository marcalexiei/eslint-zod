import type { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ZodImportScope } from '../zod-import-scope.js';
import { ZOD_NON_SCHEMA_PRODUCING_METHODS } from '../zod-non-schema-producing-methods.js';
import { isZodSchemaFactoryCall } from '../zod-schema-factory-names.js';

interface Options {
  before?: string;
  after?: string;
}

export function buildConsistentSchemaVarNameCreate(
  scope: ZodImportScope,
): (
  context: Readonly<TSESLint.RuleContext<'invalidName', [Options]>>,
  options: readonly [Options],
) => TSESLint.RuleListener {
  return function create(context, [{ before = '', after = '' }]) {
    const { importDeclarationListener, detectZodSchemaRootNode, collectZodChainMethods } =
      scope.createTracker({ kind: 'value' });

    return {
      ImportDeclaration: importDeclarationListener,
      VariableDeclarator(node): void {
        const initNode = node.init;

        if (initNode?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const meta = detectZodSchemaRootNode(initNode);

        // Detection accepts any `z.foo()`, so a helper that returns something other than a schema
        // (`z.toJSONSchema(schema)`, `z.registry()`) reaches here too.
        if (!meta || !isZodSchemaFactoryCall(meta)) {
          return;
        }

        const chainMethods = collectZodChainMethods(initNode).map((it) => it.name);

        if (ZOD_NON_SCHEMA_PRODUCING_METHODS.some((it) => chainMethods.includes(it))) {
          return;
        }

        if (node.id.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        const { name } = node.id;

        const nameLower = name.toLowerCase();
        const matchesBarePrefix = Boolean(before) && nameLower === before.toLowerCase();
        const matchesBareSuffix = Boolean(after) && nameLower === after.toLowerCase();

        if ((!before && matchesBareSuffix) || (!after && matchesBarePrefix)) {
          return;
        }

        const validPrefix = !before || name.startsWith(before);
        const validSuffix = !after || name.endsWith(after);

        if (validPrefix && validSuffix) {
          return;
        }

        const expected =
          matchesBarePrefix || matchesBareSuffix
            ? before + after
            : (validPrefix ? '' : before) + name + (validSuffix ? '' : after);

        context.report({
          node,
          messageId: 'invalidName',
          data: { expected },
        });
      },
    };
  };
}
