import { describe, expect, it } from 'vitest';

import { zodImportScope } from '../zod-import-scope.js';

import { buildNoDuplicateSchemaMethodsCreate } from './no-duplicate-schema-methods.js';

describe('buildNoDuplicateSchemaMethodsCreate', () => {
  it('accepts exclusions the rule can reach', () => {
    const create = buildNoDuplicateSchemaMethodsCreate(zodImportScope, ['check', 'refine']);
    expect(create).toBeTypeOf('function');
  });

  it('rejects a type-changing method, which starts a new segment before exclusions are read', () => {
    // @ts-expect-error -- `and` starts a new chain segment, so excluding it is dead code
    const create = buildNoDuplicateSchemaMethodsCreate(zodImportScope, ['check', 'and']);
    expect(create).toBeTypeOf('function');
  });

  it('leaves a list typed as plain strings unchecked', () => {
    const excluded: ReadonlyArray<string> = ['and'];
    const create = buildNoDuplicateSchemaMethodsCreate(zodImportScope, excluded);
    expect(create).toBeTypeOf('function');
  });
});
