import { describe, expect, it } from 'vitest';

import type { ZodSchemaMeta } from './detect-zod-schema-root-node.js';
import { getZodSchemaFactoryName } from './get-zod-schema-factory-name.js';

function meta(
  schemaDecl: ZodSchemaMeta['schemaDecl'],
  schemaType: string,
  methods: Array<string>,
): ZodSchemaMeta {
  return { schemaDecl, schemaType, methods };
}

describe('getZodSchemaFactoryName', () => {
  it('returns the factory of a plain chain', () => {
    expect(getZodSchemaFactoryName(meta('namespace', 'number', ['number', 'min']))).toBe('number');
  });

  it('resolves a namespace `z.coerce.<name>()` to `<name>`', () => {
    expect(getZodSchemaFactoryName(meta('namespace', 'coerce', ['coerce', 'number', 'min']))).toBe(
      'number',
    );
  });

  it('resolves a named `coerce.<name>()` to `<name>`', () => {
    expect(getZodSchemaFactoryName(meta('named', 'coerce', ['number', 'min']))).toBe('number');
  });

  it('leaves `iso` alone', () => {
    expect(getZodSchemaFactoryName(meta('namespace', 'iso', ['iso', 'date']))).toBe('iso');
  });

  it('returns `null` when nothing is called on `coerce`', () => {
    expect(getZodSchemaFactoryName(meta('named', 'coerce', []))).toBeNull();
  });
});
