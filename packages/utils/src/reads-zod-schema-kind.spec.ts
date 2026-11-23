import { parseCode } from '@eslint-zod/tooling/vitest/parse-code';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { readsZodSchemaKind } from './reads-zod-schema-kind.js';
import type { SourceCode } from './rule-types.js';

/** Whether the code reads the kind of the schema built by the `.readonly()` call. */
function readsKind(code: string): boolean {
  const { find, sourceCode } = parseCode(`import * as z from 'zod';\n${code}`);
  const call = find<TSESTree.CallExpression>('CallExpression[callee.property.name="readonly"]');
  return readsZodSchemaKind(sourceCode as unknown as SourceCode, call);
}

describe('readsZodSchemaKind', () => {
  it.each([
    'z.string().readonly().def;',
    'z.string().readonly().unwrap();',
    'z.string().readonly().apply((s) => s);',
    "z.string().readonly().default('a').removeDefault();",
    "z.string().readonly().catch('a').removeCatch();",
    'z.string().readonly().optional().unwrap();',
    'z.string().readonly().array().unwrap();',
    'z.string().readonly()["unwrap"]();',
    '(z.string().readonly() as any).unwrap();',
    '(<any>z.string().readonly()).unwrap();',
    '(z.string().readonly()?.optional()).unwrap();',
    'const s = z.string().readonly(); s.unwrap();',
    'const s = z.string().readonly(); s.def;',
    'const s = z.string().readonly(); const t = s; t.unwrap();',
    'const s = z.string().readonly(); const t = s.optional(); t.unwrap();',
    'const { def } = z.string().readonly();',
    'z.string().readonly() instanceof z.ZodReadonly;',
    'const s = z.string().readonly(); s instanceof z.ZodReadonly;',
    'z.object({ a: z.string().readonly() }).shape.a.unwrap();',
    'const f = (s) => s.unwrap(); f(z.string().readonly());',
    'const f = () => z.string().readonly(); f().unwrap();',
    'const s = Object.freeze(z.string().readonly()); s.unwrap();',
    '[z.string().readonly()].map((s) => s.unwrap());',
    'const o = { a: z.string().readonly() }; Object.values(o)[0].def;',
    'let s; s = z.string().readonly(); s.unwrap();',
    'const f = (s) => s instanceof z.ZodReadonly; f(z.string().readonly());',
  ])('is true for %s', (code) => {
    expect(readsKind(code)).toBe(true);
  });

  it.each([
    'z.string().readonly();',
    'z.string().readonly().optional();',
    "z.string().readonly().safeParse('a').success;",
    "z.string().readonly().parse('a').unwrap();",
    'z.string().optional().unwrap().readonly();',
    'const s = z.string().readonly();',
    "const s = z.string().readonly(); s.parse('a');",
    'const s = z.string().readonly(); const t = s.optional();',
    'var s = z.string().readonly(); var t = s; var s = t;',
    'export const s = z.string().readonly();',
    'const s = z.string().readonly(); export { s };',
    'const s = z.string().readonly(); type T = z.infer<typeof s>;',
    'z.ZodReadonly instanceof z.string().readonly();',
    'const schemas = { a: z.string().readonly() }; schemas.a.parse(1);',
    "import { useQuery } from './q'; const { data } = useQuery(z.string().readonly());",
    "import { Hono } from './h'; const app = new Hono(); app.post('/', z.string().readonly());",
    'module.exports = { s: z.string().readonly() };',
    'const f = (e) => e instanceof z.ZodError; f(z.string().readonly());',
  ])('is false for %s', (code) => {
    expect(readsKind(code)).toBe(false);
  });
});
