import { describe, expect, it } from 'vitest';

import type { ZodSchemaMeta } from './detect-zod-schema-root-node.js';
import {
  ZOD_NON_SCHEMA_HELPER_NAMES,
  isZodNonSchemaHelperCall,
} from './zod-non-schema-helper-names.js';
import { ZOD_NON_SCHEMA_PRODUCING_METHODS } from './zod-non-schema-producing-methods.js';

function namespaceMeta(schemaType: string, methods = [schemaType]): ZodSchemaMeta {
  return { schemaDecl: 'namespace', schemaType, methods };
}

describe('ZOD_NON_SCHEMA_HELPER_NAMES', () => {
  it('cannot be mutated at runtime', () => {
    expect(Object.isFrozen(ZOD_NON_SCHEMA_HELPER_NAMES)).toBe(true);
    expect(() => (ZOD_NON_SCHEMA_HELPER_NAMES as Array<string>).push('injected')).toThrow(
      TypeError,
    );
  });

  it('has no duplicates', () => {
    expect(new Set(ZOD_NON_SCHEMA_HELPER_NAMES).size).toBe(ZOD_NON_SCHEMA_HELPER_NAMES.length);
  });

  it('drops the names that are also schema factories', () => {
    expect(ZOD_NON_SCHEMA_PRODUCING_METHODS).toContain('codec');
    expect(ZOD_NON_SCHEMA_HELPER_NAMES).not.toContain('codec');
  });
});

describe('isZodNonSchemaHelperCall', () => {
  it.each(['toJSONSchema', 'registry', 'config', 'prettifyError', 'parse', 'safeParse'])(
    'recognizes z.%s()',
    (name) => {
      expect(isZodNonSchemaHelperCall(namespaceMeta(name))).toBe(true);
    },
  );

  it('recognizes a member of a helper namespace', () => {
    expect(isZodNonSchemaHelperCall(namespaceMeta('locales', ['locales', 'en']))).toBe(true);
    expect(
      isZodNonSchemaHelperCall(namespaceMeta('globalRegistry', ['globalRegistry', 'add'])),
    ).toBe(true);
  });

  it.each([
    // factories, including the one the parse-method list also names
    'string',
    'object',
    'codec',
    // a standalone check is not a factory, but it is still part of a schema expression
    'minLength',
    'refine',
  ])('leaves z.%s() alone', (name) => {
    expect(isZodNonSchemaHelperCall(namespaceMeta(name))).toBe(false);
  });
});
