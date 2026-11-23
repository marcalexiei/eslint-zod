import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noDuplicateSchemaMethods } from './no-duplicate-schema-methods.js';

const ruleTester = new RuleTester();

ruleTester.run(noDuplicateSchemaMethods.name, noDuplicateSchemaMethods, {
  valid: [
    {
      name: 'catch() and nonoptional() across a rewrite, which can make both calls matter',
      code: dedent`
        import * as z from 'zod';
        z.string().catch('a').overwrite((s) => s).catch('a');
        z.string().optional().nonoptional().overwrite(() => undefined).nonoptional();
      `,
    },
    {
      name: 'describe() across meta() with a variable, which can gain a description',
      code: dedent`
        import * as z from 'zod';
        const m = { title: 't' };
        m.description = 'b';
        z.string().describe('a').meta(m).describe('a');
      `,
    },
    {
      name: 'apply() starts a new segment',
      code: dedent`
        import * as z from 'zod';
        z.string().min(1).apply((schema) => schema).min(1);
      `,
    },
    {
      name: 'methods that are meant to repeat',
      code: dedent`
        import * as z from 'zod';
        z.object({}).extend(A.shape).extend(B.shape);
        z.object({}).safeExtend(A.shape).safeExtend(B.shape);
        z.object({}).merge(A).merge(B);
        z.object({ a: z.string(), b: z.string() }).omit({ a: true }).omit({ b: true });
        z.object({ a: z.string(), b: z.string() }).pick({ a: true, b: true }).pick({ a: true });
        z.number().multipleOf(4).multipleOf(6);
        z.string().meta({ a: 1 }).meta({ b: 2 });
        z.string().with((ctx) => {}).with((ctx) => {});
      `,
    },
    {
      name: 'namespace - no duplicate methods',
      code: dedent`
        import * as z from 'zod';
        z.string().trim().min(1);
      `,
    },
    {
      name: 'named - no duplicate methods',
      code: dedent`
        import { string } from 'zod';
        string().trim().min(1);
      `,
    },
    {
      name: 'named renamed - no duplicate methods',
      code: dedent`
        import { string as zString } from 'zod';
        zString().trim().min(1);
      `,
    },
    {
      name: 'namespace - or called multiple times (each starts a new segment)',
      code: dedent`
        import * as z from 'zod';
        z.string().or(z.number()).or(z.boolean());
      `,
    },
    {
      name: 'namespace - and called multiple times (each starts a new segment)',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.string() }).and(z.object({ b: z.number() })).and(z.object({ c: z.boolean() }));
      `,
    },
    {
      name: 'namespace - refine called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod';
        z.string().refine((s) => s.length > 0).refine((s) => s.includes('@'));
      `,
    },
    {
      name: 'namespace - superRefine called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod';
        z.string().superRefine((s, ctx) => {}).superRefine((s, ctx) => {});
      `,
    },
    {
      name: 'namespace - transform called multiple times (each starts a new segment)',
      code: dedent`
        import * as z from 'zod';
        z.string().transform((s) => s.trim()).transform((s) => s.toLowerCase());
      `,
    },
    {
      name: 'namespace - pipe called multiple times (each starts a new segment)',
      code: dedent`
        import * as z from 'zod';
        z.string().pipe(z.string().min(1)).pipe(z.string().max(10));
      `,
    },
    {
      name: 'namespace - check called multiple times (only its arguments are compared)',
      code: dedent`
        import * as z from 'zod';
        z.string().check((ctx) => {}).check((ctx) => {});
      `,
    },
    {
      name: 'namespace - array called multiple times for nested arrays (each starts a new segment)',
      code: dedent`
        import * as z from 'zod';
        z.string().nonempty().array().array();
      `,
    },
    {
      name: 'namespace - register called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod';
        const registryA = z.registry();
        const registryB = z.registry();
        z.string().register(registryA).register(registryB);
      `,
    },
    {
      name: 'namespace - regex called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod';
        const ASCII_RANGE = /^[ -~]*$/;
        const NON_LATIN = /^W/;
        z.string().regex(ASCII_RANGE).regex(NON_LATIN);
      `,
    },
    {
      name: 'namespace - includes called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod';
        z.string().includes('foo').includes('bar');
      `,
    },
    {
      name: 'namespace - startsWith called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod';
        z.string().startsWith('foo').startsWith('bar');
      `,
    },
    {
      name: 'namespace - endsWith called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod';
        z.string().endsWith('foo').endsWith('bar');
      `,
    },
    {
      name: 'namespace - overwrite called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod';
        z.number().overwrite((n) => n + 1).overwrite((n) => n * 2);
      `,
    },
    {
      name: 'namespace - min after array applies to the array, not the string',
      code: dedent`
        import * as z from 'zod';
        z.string().min(1).array().min(1);
      `,
    },
    {
      name: 'namespace - min repeated across nested array layers',
      code: dedent`
        import * as z from 'zod';
        z.string().min(1).array().min(1).array().min(1);
      `,
    },
    {
      name: 'non-zod code is not flagged',
      code: dedent`
        const obj = { trim: () => obj, min: () => obj };
        obj.trim().trim();
      `,
    },
    {
      name: 'namespace - min and max each called once',
      code: dedent`
        import * as z from 'zod';
        z.string().min(1).max(10);
      `,
    },
    {
      name: 'a value check repeated after a check that may undo it',
      code: dedent`
        import * as z from 'zod';
        z.string().trim().overwrite((s) => \` \${s} \`).trim();
        z.string().trim().superRefine((s, ctx) => {}).trim();
        z.string().trim().check((ctx) => {}).trim();
        z.string().trim().apply((schema) => schema).trim();
        z.string().toLowerCase().toUpperCase().toLowerCase();
        z.string().normalize('NFC').normalize('NFD').normalize('NFC');
        z.string().normalize().toUpperCase().normalize();
        z.string().trim().normalize('NFKC').trim();
        z.string().toLowerCase().normalize('NFKD').toLowerCase();
      `,
    },
    {
      name: 'normalize forms that are not constants',
      code: dedent`
        import * as z from 'zod';
        declare function nextForm(): string;
        z.string().normalize(nextForm()).normalize(nextForm());
      `,
    },
    {
      name: 'a validator repeated after the value changed',
      code: dedent`
        import * as z from 'zod';
        z.string().min(3).trim().min(3);
        z.string().lowercase().toUpperCase().lowercase();
      `,
    },
    {
      name: 'slugify() repeated after another rewrite',
      code: dedent`
        import * as z from 'zod';
        z.string().slugify().toUpperCase().slugify();
        z.string().slugify().overwrite((s) => \` \${s}\`).slugify();
      `,
    },
    {
      name: 'describe() on a schema and on its wrapper',
      code: dedent`
        import * as z from 'zod';
        z.string().describe('inner').optional().describe('outer');
        z.string().describe('inner').nullable().describe('outer');
        z.string().describe('inner').default('a').describe('outer');
      `,
    },
    {
      name: 'describe() restoring what meta() or register() replaced',
      code: dedent`
        import * as z from 'zod';
        declare const extra: { description?: string };
        z.string().describe('a').meta({ description: 'b' }).describe('a');
        z.string().describe('a').meta({ ...extra }).describe('a');
        z.string().describe('a').meta(extra).describe('a');
        z.string().describe('a').register(z.globalRegistry, { description: 'b' }).describe('a');
      `,
    },
    {
      name: 'methods whose repeated calls accumulate',
      code: dedent`
        import * as z from 'zod';
        z.enum(['a', 'b', 'c']).exclude(['a']).exclude(['b']);
        z.enum(['a', 'b', 'c']).extract(['a', 'b']).extract(['a']);
        z.object({ a: z.string(), b: z.string() }).partial({ a: true }).partial({ b: true });
        z.object({ a: z.string().optional(), b: z.string().optional() })
          .required({ a: true })
          .required({ b: true });
        z.string().brand('A').brand('B');
        z.number().step(2).step(3);
        z.object({ a: z.string(), b: z.string() }).exactPartial({ a: true }).exactPartial({ b: true });
      `,
    },
    {
      name: 'string methods called on a parsed value',
      code: dedent`
        import * as z from 'zod';
        z.string().trim().parse(' a ').trim();
      `,
    },
    {
      name: 'a method returning another schema starts a new segment',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).min(1).unwrap().min(1);
        z.string().optional().nullable().unwrap().unwrap();
        z.object({ a: z.string() }).describe('o').keyof().describe('k');
        z.string().default('a').removeDefault().default('b');
        z.string().catch('a').removeCatch().catch('b');
      `,
    },
    {
      name: 'describe() after a method that drops the description',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.string() }).describe('d').partial().describe('d');
        z.object({ a: z.string() }).describe('d').pick({ a: true }).describe('d');
        z.object({ a: z.string() }).describe('d').extend({ b: z.string() }).describe('d');
        z.object({ a: z.string() }).describe('d').strict().describe('d');
        z.tuple([z.string()]).describe('d').rest(z.number()).describe('d');
      `,
    },
    {
      name: 'describe() restoring what a custom check may have replaced',
      code: dedent`
        import * as z from 'zod';
        declare const custom: z.core.$ZodCheck<string>;
        z.string().describe('a').check(custom).describe('a');
      `,
    },
    {
      name: 'a repeated wrapper that a later call peels one at a time',
      code: dedent`
        import * as z from 'zod';
        z.string().optional().optional().unwrap();
        z.string().default('a').default('b').removeDefault();
        z.string().catch('a').catch('b').removeCatch();
        const s = z.string().nullable().nullable();
        s.unwrap();
      `,
    },
  ],
  invalid: [
    {
      name: 'readonly() repeated past default() or catch(), the earlier call being redundant',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).readonly().default(['a']).readonly();
        z.array(z.string()).readonly().catch(['a']).readonly();
      `,
      errors: [
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'readonly' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'readonly' } },
      ],
    },
    {
      name: 'a method repeated after its opposite, the earlier call being redundant',
      code: dedent`
        import * as z from 'zod';
        z.string().optional().nonoptional().optional();
        z.string().nullish().nonoptional().nullish();
        z.object({}).strict().loose().strict();
        z.object({}).strict().merge(z.object({})).strict();
        z.object({}).strict().catchall(z.string()).strict();
      `,
      errors: [
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'optional' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'nullish' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'strict' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'strict' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'strict' } },
      ],
    },
    {
      name: 'a repeated wrapper leaving the file is still reported',
      code: dedent`
        import * as z from 'zod';
        const build = () => z.string().optional().optional();
        export const schema = z.string().nullable().nullable();
      `,
      errors: [
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'optional' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'nullable' } },
      ],
    },
    {
      name: 'a wrapper repeated across a value change, the earlier call being redundant',
      code: dedent`
        import * as z from 'zod';
        z.string().optional().overwrite((s) => s).optional();
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'optional' } }],
    },
    {
      name: 'a wrapper repeated across refine(), the earlier call being redundant',
      code: dedent`
        import * as z from 'zod';
        z.string().nullable().refine((s) => s !== null).nullable();
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'nullable' } }],
    },
    {
      name: 'readonly() repeated across a value change, the earlier call being redundant',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).readonly().overwrite((v) => [...v]).readonly();
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'readonly' } }],
    },
    {
      name: 'catch() repeated across refine(), which does not rewrite the value',
      code: dedent`
        import * as z from 'zod';
        z.string().catch('a').refine((s) => s !== 'a').catch('a');
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'catch' } }],
    },
    {
      name: 'a value check repeated across refine() is still reported',
      code: dedent`
        import * as z from 'zod';
        z.string().trim().refine((s) => s.length > 0).trim();
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } }],
    },
    {
      name: 'a value-independent method repeated across a value change',
      code: dedent`
        import * as z from 'zod';
        z.object({}).strict().superRefine(() => {}).strict();
        z.string().clone().trim().clone();
      `,
      errors: [
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'strict' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'clone' } },
      ],
    },
    {
      name: 'readonly() repeated across a wrapper that runs the inner schema',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).readonly().optional().readonly();
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'readonly' } }],
    },
    {
      name: 'a repeat before parse() is still reported',
      code: dedent`
        import * as z from 'zod';
        z.string().trim().trim().parse(' a ');
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } }],
    },
    {
      name: 'trim() repeated across a rewrite that keeps the value trimmed',
      code: dedent`
        import * as z from 'zod';
        z.string().trim().toLowerCase().trim();
        z.string().trim().toUpperCase().trim();
        z.string().trim().slugify().trim();
      `,
      errors: [
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } },
      ],
    },
    {
      name: 'slugify() repeated while still in effect',
      code: dedent`
        import * as z from 'zod';
        z.string().slugify().slugify();
        z.string().slugify().trim().slugify();
      `,
      errors: [
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'slugify' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'slugify' } },
      ],
    },
    {
      name: 'a no-op repeat does not reset the validators',
      code: dedent`
        import * as z from 'zod';
        z.string().toLowerCase().min(1).toLowerCase().min(1);
      `,
      errors: [
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'toLowerCase' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'min' } },
      ],
    },
    {
      name: 'describe() across meta() that leaves the description alone',
      code: dedent`
        import * as z from 'zod';
        z.string().describe('a').meta({ title: 'b' }).describe('c');
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'describe' } }],
    },
    {
      name: 'a repeat before apply() is still reported',
      code: dedent`
        import * as z from 'zod';
        z.string().min(1).min(2).apply((schema) => schema);
        z.string().describe('a').describe('b').apply((schema) => schema);
      `,
      errors: [
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'min' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'describe' } },
      ],
    },
    {
      name: 'namespace - trim called twice',
      code: dedent`
        import * as z from 'zod';
        z.string().trim().min(1).max(5).trim();
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } }],
    },
    {
      name: 'named - trim called twice',
      code: dedent`
        import { string } from 'zod';
        string().trim().min(1).max(5).trim();
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } }],
    },
    {
      name: 'named z - trim called twice',
      code: dedent`
        import { z } from 'zod';
        z.string().trim().min(1).max(5).trim();
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } }],
    },
    {
      name: 'namespace - min called twice',
      code: dedent`
        import * as z from 'zod';
        z.string().min(1).max(10).min(5);
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'min' } }],
    },
    {
      name: 'namespace - max called twice',
      code: dedent`
        import * as z from 'zod';
        z.string().min(1).max(10).max(5);
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'max' } }],
    },
    {
      name: 'namespace - multiple duplicate methods in one chain',
      code: dedent`
        import * as z from 'zod';
        z.string().trim().min(1).trim().min(5);
      `,
      errors: [
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'min' } },
      ],
    },
    {
      name: 'namespace - optional called twice',
      code: dedent`
        import * as z from 'zod';
        z.string().optional().optional();
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'optional' } }],
    },
    {
      name: 'namespace - duplicate within the segment after array',
      code: dedent`
        import * as z from 'zod';
        z.string().array().min(1).max(5).min(2);
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'min' } }],
    },
    {
      name: 'namespace - describe called twice',
      code: dedent`
        import * as z from 'zod';
        z.string().describe('foo').describe('bar');
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'describe' } }],
    },
    {
      name: 'normalize repeated with the same form',
      code: dedent`
        import * as z from 'zod';
        const form = 'NFC';
        z.string().normalize().normalize(form);
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'normalize' } }],
    },
    {
      name: 'checks that do not rewrite the value keep a repeat reported',
      code: dedent`
        import * as z from 'zod';
        z.string().toLowerCase().trim().refine((s) => s.length > 0).toLowerCase();
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'toLowerCase' } }],
    },
    {
      name: 'normalize form with a type assertion',
      code: dedent`
        import * as z from 'zod';
        z.string().normalize('NFD' as const).normalize('NFD');
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'normalize' } }],
    },
    {
      name: 'overwrite does not undo describe',
      code: dedent`
        import * as z from 'zod';
        z.string().describe('foo').overwrite((s) => s).describe('foo');
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'describe' } }],
    },
  ],
});
