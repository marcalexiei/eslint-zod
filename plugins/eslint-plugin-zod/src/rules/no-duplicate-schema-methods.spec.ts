import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noDuplicateSchemaMethods } from './no-duplicate-schema-methods.js';

const ruleTester = new RuleTester();

ruleTester.run(noDuplicateSchemaMethods.name, noDuplicateSchemaMethods, {
  valid: [
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
      name: 'namespace - or called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod';
        z.string().or(z.number()).or(z.boolean());
      `,
    },
    {
      name: 'namespace - and called multiple times (excluded)',
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
      name: 'namespace - transform called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod';
        z.string().transform((s) => s.trim()).transform((s) => s.toLowerCase());
      `,
    },
    {
      name: 'namespace - pipe called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod';
        z.string().pipe(z.string().min(1)).pipe(z.string().max(10));
      `,
    },
    {
      name: 'namespace - check called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod';
        z.string().check((ctx) => {}).check((ctx) => {});
      `,
    },
    {
      name: 'namespace - array called multiple times for nested arrays (excluded)',
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
  ],
  invalid: [
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
      name: 'namespace - describe called twice',
      code: dedent`
        import * as z from 'zod';
        z.string().describe('foo').describe('bar');
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'describe' } }],
    },
  ],
});
