import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { ZodChainItem } from './track-zod-schema-imports.js';

/**
 * Whether a chain item is the schema factory (`z.string()`, `z.coerce.boolean()`, a bare `string()`)
 * rather than a method called on a schema.
 * A chain resumed after a property access (`z.object({}).shape.a.optional()`) starts at a method,
 * and so does one on a local schema (`base.optional()`), whose root is not a zod import.
 */
export function isZodFactoryChainItem(
  item: Pick<ZodChainItem, 'member'>,
  isZodImportName: (name: string) => boolean,
): boolean {
  let object: TSESTree.Node | undefined = item.member?.object;
  while (object?.type === AST_NODE_TYPES.MemberExpression) {
    ({ object } = object);
  }
  return (
    object === undefined ||
    (object.type === AST_NODE_TYPES.Identifier && isZodImportName(object.name))
  );
}
