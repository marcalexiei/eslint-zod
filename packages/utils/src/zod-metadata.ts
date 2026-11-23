import type { ZodMethodName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { ZodSchemaConstraint } from './collect-zod-schema-constraints.js';
import { skipTypeAssertions } from './get-binding-initializer.js';
import { getStaticPropertyName } from './get-static-property-name.js';
import { getOpaqueCheckChainIndexes } from './has-opaque-zod-check.js';
import { ZOD_TYPE_CHANGING_METHODS } from './zod-type-changing-methods.js';

/** Methods building a new schema that does not inherit the metadata. */
export const METADATA_DROPPING_METHODS: ReadonlySet<string> = new Set<ZodMethodName>([
  'catch',
  'catchall',
  'default',
  'exactOptional',
  'exactPartial',
  'exclude',
  'extend',
  'extract',
  'loose',
  'merge',
  'nonoptional',
  'nullable',
  'nullish',
  'omit',
  'optional',
  'partial',
  'passthrough',
  'pick',
  'prefault',
  'readonly',
  'required',
  'rest',
  'safeExtend',
  'strict',
  'strip',
]);

const METADATA_WRITING_METHODS: ReadonlySet<string> = new Set<ZodMethodName>([
  'describe',
  'meta',
  'register',
]);

/** Whether a call may replace the description. */
export function mayWriteZodDescription(check: Pick<ZodSchemaConstraint, 'name' | 'node'>): boolean {
  if (check.name !== 'meta') {
    return METADATA_WRITING_METHODS.has(check.name);
  }
  const argument = check.node.arguments.at(0);
  if (!argument || argument.type === AST_NODE_TYPES.SpreadElement) {
    return true;
  }
  // Only an inline object: one held in a variable can gain a `description` later.
  const value = skipTypeAssertions(argument);
  return (
    value.type !== AST_NODE_TYPES.ObjectExpression ||
    value.properties.some((property) => {
      if (property.type !== AST_NODE_TYPES.Property) {
        return true;
      }
      const key = getStaticPropertyName(property);
      return key === null || key === 'description';
    })
  );
}

function endsMetadata(name: string): boolean {
  return (
    METADATA_DROPPING_METHODS.has(name) ||
    (name !== 'apply' && ZOD_TYPE_CHANGING_METHODS.includes(name))
  );
}

/** Whether removing the call at `chainIndex` would bring back metadata it dropped. */
export function restoresZodMetadata(
  methods: ReadonlyArray<{ name: string; node: TSESTree.CallExpression }>,
  constraints: ReadonlyArray<ZodSchemaConstraint>,
  chainIndex: number,
): boolean {
  if (methods.slice(chainIndex + 1).some((it) => endsMetadata(it.name))) {
    return false;
  }
  const opaqueIndexes = getOpaqueCheckChainIndexes(methods, constraints);
  for (let index = chainIndex - 1; index >= 0; index -= 1) {
    const { name } = methods[index];
    if (
      name === 'apply' ||
      opaqueIndexes.includes(index) ||
      constraints.some((it) => it.chainIndex === index && METADATA_WRITING_METHODS.has(it.name))
    ) {
      return true;
    }
    if (endsMetadata(name)) {
      return false;
    }
  }
  return false;
}
