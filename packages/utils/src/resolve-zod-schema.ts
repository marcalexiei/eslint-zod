import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { parseZodCallExpression } from './detect-zod-schema-root-node.js';
import type { ZodImports, ZodSchemaMeta } from './detect-zod-schema-root-node.js';
import { findVariable } from './find-variable.js';
import type { SourceCode } from './rule-types.js';
import { chainsZodNonSchemaMethod } from './zod-non-schema-producing-methods.js';
import { isZodSchemaFactoryCall } from './zod-schema-factory-names.js';

/** Builds the tracker's `resolveZodSchema` for one file, memoized per node. */
export function createZodSchemaResolver(
  imports: ZodImports,
  sourceCode: SourceCode,
): (node: TSESTree.Node) => ZodSchemaMeta | null {
  const cache = new WeakMap<TSESTree.Node, ZodSchemaMeta | null>();

  function resolve(node: TSESTree.Node): ZodSchemaMeta | null {
    const cached = cache.get(node);
    if (cached !== undefined) {
      return cached;
    }
    // A node reached again while it resolves is a `const` cycle, which is a TDZ error at runtime.
    cache.set(node, null);
    let result: ZodSchemaMeta | null = null;

    switch (node.type) {
      case AST_NODE_TYPES.TSAsExpression:
      case AST_NODE_TYPES.TSSatisfiesExpression:
      case AST_NODE_TYPES.TSNonNullExpression:
        result = resolve(node.expression);
        break;

      case AST_NODE_TYPES.Identifier: {
        const variable = findVariable(sourceCode.getScope(node), node.name);
        // more than one definition means the binding is re-declared, so its initializer does not settle its value
        const definition = variable?.defs.length === 1 ? variable.defs[0] : undefined;
        if (
          definition?.type === 'Variable' &&
          definition.parent.kind === 'const' &&
          definition.node.id.type === AST_NODE_TYPES.Identifier &&
          definition.node.init !== null
        ) {
          result = resolve(definition.node.init);
        }
        break;
      }

      case AST_NODE_TYPES.CallExpression: {
        const meta = parseZodCallExpression(node, imports, resolve);
        result =
          meta && isZodSchemaFactoryCall(meta) && !chainsZodNonSchemaMethod(meta) ? meta : null;
        break;
      }

      // no default
    }

    cache.set(node, result);
    return result;
  }

  return resolve;
}
