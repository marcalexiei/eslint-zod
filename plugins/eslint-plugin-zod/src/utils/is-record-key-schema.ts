import type { ZodSchemaImportTracker } from '@eslint-zod/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';

const RECORD_FACTORIES = ['record', 'partialRecord', 'looseRecord'];

/**
 * Whether `node` is the key schema of a `z.record()`, `z.partialRecord()` or `z.looseRecord()`.
 * A transform on a record key causes data loss, so the trim rules leave it alone.
 *
 * @see https://github.com/marcalexiei/eslint-zod/issues/242
 */
export function isRecordKeySchema(
  node: TSESTree.CallExpression,
  isZodSchemaOfType: ZodSchemaImportTracker['isZodSchemaOfType'],
): boolean {
  const { parent } = node;
  return (
    parent.type === AST_NODE_TYPES.CallExpression &&
    parent.arguments.at(0) === node &&
    RECORD_FACTORIES.some((factory) => isZodSchemaOfType(parent, factory))
  );
}
