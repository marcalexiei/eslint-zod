import { parseCode } from '@eslint-zod/tooling/vitest/parse-code';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { detectZodSchemaRootNode, isZodSchemaOfType } from './detect-zod-schema-root-node.js';
import type { ZodImports, ZodSchemaMeta } from './detect-zod-schema-root-node.js';

const imports: ZodImports = {
  namespaces: new Set(['z']),
  named: new Map([
    ['string', 'string'],
    ['number', 'number'],
    ['zodNativeEnum', 'nativeEnum'],
  ]),
};

/** The node `selector` picks; by default the statement's expression. */
function nodeOf(code: string, selector = 'ExpressionStatement > *'): TSESTree.Node {
  return parseCode(code).find(selector);
}

const detect = (code: string, selector?: string): ZodSchemaMeta | null =>
  detectZodSchemaRootNode(nodeOf(code, selector), imports);

const INNER = 'CallExpression[callee.property.name="number"]';

describe('detectZodSchemaRootNode', () => {
  it.each([
    ['z.string()', { schemaDecl: 'namespace', schemaType: 'string', methods: ['string'] }],
    [
      'z.number().min(1)',
      { schemaDecl: 'namespace', schemaType: 'number', methods: ['number', 'min'] },
    ],
    ['string()', { schemaDecl: 'named', schemaType: 'string', methods: [] }],
    ['string().optional()', { schemaDecl: 'named', schemaType: 'string', methods: ['optional'] }],
    ['zodNativeEnum()', { schemaDecl: 'named', schemaType: 'nativeEnum', methods: [] }],
    ["z['string']()", { schemaDecl: 'namespace', schemaType: 'string', methods: ['string'] }],
    ['z[`string`]()', { schemaDecl: 'namespace', schemaType: 'string', methods: ['string'] }],
  ])('detects %s', (code, expected) => {
    expect(detect(code)).toStrictEqual(expected);
  });

  it.each([
    ['a node that is not a call', 'z'],
    ['a call on something not imported', 'notZod.string()'],
    // eslint-disable-next-line no-template-curly-in-string -- the code is a template literal
    ['a template key with interpolations', 'z[`str${x}`]()'],
    ['a null key', 'z[null]()'],
    ['a non-static key', 'z[a + b]()'],
    ['a root that is not an identifier', '(a + b).string()'],
    ['a root bound locally', 'base.optional()'],
  ])('returns null for %s: %s', (_, code) => {
    expect(detect(code)).toBeNull();
  });

  it('returns null for an inner call: z.number() in z.number().min(1)', () => {
    expect(detect('z.number().min(1);', INNER)).toBeNull();
  });

  it('returns null for the callee of another call: z.function().implement(fn)(input)', () => {
    expect(
      detect('z.function().implement(fn)(input);', 'CallExpression > CallExpression'),
    ).toBeNull();
  });

  it('detects a call followed only by a property access: z.object({}).shape', () => {
    expect(detect('z.object({}).shape;', 'CallExpression')?.schemaType).toBe('object');
  });
});

describe('detectZodSchemaRootNode with a root resolver', () => {
  const base: ZodSchemaMeta = {
    schemaDecl: 'namespace',
    schemaType: 'string',
    methods: ['string'],
  };
  const resolveRoot = (root: TSESTree.Identifier): ZodSchemaMeta | null =>
    root.name === 'base' ? base : null;
  const resolve = (code: string): ZodSchemaMeta | null =>
    detectZodSchemaRootNode(nodeOf(code), imports, resolveRoot);

  it('appends the chained methods to the schema the root is bound to', () => {
    expect(resolve('base.nullable().isOptional()')).toStrictEqual({
      ...base,
      methods: ['string', 'nullable', 'isOptional'],
    });
  });

  it('returns null for a bare call, or a root the resolver does not know', () => {
    expect(resolve('base()')).toBeNull();
    expect(resolve('other.optional()')).toBeNull();
  });

  it('looks through a TS assertion only with a resolver', () => {
    const code = '(z.string() as never).optional()';
    expect(resolve(code)?.methods).toStrictEqual(['string', 'optional']);
    expect(detect(code)).toBeNull();
  });
});

describe('isZodSchemaOfType', () => {
  const isOfType = (code: string, schemaType: string, selector?: string): boolean =>
    isZodSchemaOfType(nodeOf(code, selector), schemaType, imports);

  it('matches the factory, for an inner call too', () => {
    expect(isOfType('z.number()', 'number')).toBe(true);
    expect(isOfType('number()', 'number')).toBe(true);
    expect(isOfType('z.number().min(1)', 'number', INNER)).toBe(true);
    expect(isOfType('z.string()', 'string')).toBe(true);
  });

  it('returns false for another factory, or a node that is not a call', () => {
    expect(isOfType('z.string()', 'number')).toBe(false);
    expect(isOfType('z', 'number')).toBe(false);
  });
});
