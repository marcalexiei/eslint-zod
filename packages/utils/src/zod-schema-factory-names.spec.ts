import { describe, expect, it } from 'vitest';

import type { ZodSchemaMeta } from './detect-zod-schema-root-node.js';
import {
  ZOD_SCHEMA_FACTORY_NAMES,
  isZodSchemaFactoryCall,
  isZodSchemaFactoryName,
} from './zod-schema-factory-names.js';
import { ZOD_STRING_FORMAT_NAMES } from './zod-string-format-names.js';

describe('ZOD_SCHEMA_FACTORY_NAMES', () => {
  it('is frozen at runtime', () => {
    expect(Object.isFrozen(ZOD_SCHEMA_FACTORY_NAMES)).toBe(true);
  });

  it('has no duplicates', () => {
    expect(new Set(ZOD_SCHEMA_FACTORY_NAMES).size).toBe(ZOD_SCHEMA_FACTORY_NAMES.length);
  });

  it('spreads every top-level string format', () => {
    for (const name of ZOD_STRING_FORMAT_NAMES) {
      expect(isZodSchemaFactoryName(name)).toBe(true);
    }
  });
});

describe('isZodSchemaFactoryName', () => {
  it.each([
    'string',
    'object',
    'union',
    'optional',
    'codec',
    // missing from the hand-kept per-rule list this replaced
    'symbol',
    'exactOptional',
    'looseRecord',
    'preprocess',
    'stringFormat',
    'keyof',
    'xor',
    // `zod/mini` object transformers
    'pick',
    'partial',
  ])('recognizes %s', (name) => {
    expect(isZodSchemaFactoryName(name)).toBe(true);
  });

  it.each([
    // checks, not schemas
    'minLength',
    'refine',
    'check',
    'meta',
    'describe',
    // namespaces, never called themselves
    'iso',
    'coerce',
    // not zod
    'toJSONSchema',
    'safeParse',
    'notAZodExport',
  ])('rejects %s', (name) => {
    expect(isZodSchemaFactoryName(name)).toBe(false);
  });
});

describe('isZodSchemaFactoryCall', () => {
  it.each<[string, ZodSchemaMeta]>([
    ['z.string()', { schemaDecl: 'namespace', schemaType: 'string', methods: ['string'] }],
    [
      'z.object({}).optional()',
      { schemaDecl: 'namespace', schemaType: 'object', methods: ['object', 'optional'] },
    ],
    ['string()', { schemaDecl: 'named', schemaType: 'string', methods: [] }],
    // the `iso` / `coerce` members are the factories, and are absent from the name list
    [
      'z.iso.datetime()',
      { schemaDecl: 'namespace', schemaType: 'iso', methods: ['iso', 'datetime'] },
    ],
    ['iso.datetime()', { schemaDecl: 'named', schemaType: 'iso', methods: ['datetime'] }],
    [
      'z.coerce.number()',
      { schemaDecl: 'namespace', schemaType: 'coerce', methods: ['coerce', 'number'] },
    ],
  ])('accepts %s', (_, meta) => {
    expect(isZodSchemaFactoryCall(meta)).toBe(true);
  });

  it.each<[string, ZodSchemaMeta]>([
    [
      'z.toJSONSchema(schema)',
      { schemaDecl: 'namespace', schemaType: 'toJSONSchema', methods: ['toJSONSchema'] },
    ],
    ['prettifyError(err)', { schemaDecl: 'named', schemaType: 'prettifyError', methods: [] }],
  ])('rejects %s', (_, meta) => {
    expect(isZodSchemaFactoryCall(meta)).toBe(false);
  });
});
