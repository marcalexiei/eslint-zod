import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noDuplicateSchemaMethods } from './no-duplicate-schema-methods.js';

const ruleTester = new RuleTester();

ruleTester.run(noDuplicateSchemaMethods.name, noDuplicateSchemaMethods, {
  valid: [
    {
      name: 'with() is the alias of check()',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().with(z.minLength(1)).with(z.maxLength(10));
      `,
    },
    {
      name: 'namespace - no duplicate methods',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().brand('MyBrand');
      `,
    },
    {
      name: 'named - no duplicate methods',
      code: dedent`
        import { string } from 'zod/mini';
        string().brand('MyBrand');
      `,
    },
    {
      name: 'namespace - check called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(1)).check(z.maxLength(10));
      `,
    },
    {
      name: 'namespace - register called multiple times (excluded)',
      code: dedent`
        import * as z from 'zod/mini';
        const registryA = z.registry();
        const registryB = z.registry();
        z.string().register(registryA).register(registryB);
      `,
    },
    {
      name: 'check arguments - each compared check once',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.trim(), z.toLowerCase()).check(z.describe('d'));
      `,
    },
    {
      name: 'check arguments - normalize with different forms',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.normalize('NFD'), z.normalize('NFC'));
      `,
    },
    {
      name: 'check arguments - normalize with different identifiers',
      code: dedent`
        import * as z from 'zod/mini';
        const a = 'NFC';
        const b = 'NFD';
        z.string().check(z.normalize(a), z.normalize(b));
      `,
    },
    {
      name: 'check arguments - other checks are not compared',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.regex(/a/), z.regex(/a/), z.refine(() => true), z.refine(() => true));
        z.string().check(z.meta({ a: 1 }), z.meta({ b: 2 }));
        z.number().check(z.multipleOf(2), z.multipleOf(3));
      `,
    },
    {
      name: 'check arguments - bounds are left to no-conflicting-checks',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(1), z.minLength(1));
      `,
    },
    {
      name: 'check arguments - separate schemas are compared separately',
      code: dedent`
        import * as z from 'zod/mini';
        z.object({
          a: z.string().check(z.trim()),
          b: z.string().check(z.trim()),
        });
        z.pipe(z.string().check(z.trim()), z.string().check(z.trim()));
      `,
    },
    {
      name: 'check arguments - overwrite between repeats rewrites the value',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.trim(), z.overwrite((s) => \` \${s}\`), z.trim());
      `,
    },
    {
      name: 'check arguments - custom check between repeats may rewrite the value',
      code: dedent`
        import * as z from 'zod/mini';
        declare const padCheck: z.core.$ZodCheck<string>;
        z.string().check(z.trim()).check(padCheck).check(z.trim());
      `,
    },
    {
      name: 'check arguments - callback check between repeats may rewrite the value',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.toLowerCase(), z.superRefine(() => {}), z.toLowerCase());
      `,
    },
    {
      name: 'check arguments - opposite case between repeats',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.toUpperCase(), z.toLowerCase(), z.toUpperCase());
      `,
    },
    {
      name: 'check arguments - other normalize form between repeats',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.normalize('NFD'), z.normalize('NFC'), z.normalize('NFD'));
      `,
    },
    {
      name: 'check arguments - unknown normalize form between repeats',
      code: dedent`
        import * as z from 'zod/mini';
        declare const form: () => 'NFC';
        z.string().check(z.normalize('NFD'), z.normalize(form()), z.normalize('NFD'));
      `,
    },
    {
      name: 'check arguments - normalize forms that are not constants are not compared',
      code: dedent`
        import * as z from 'zod/mini';
        declare const nextForm: () => 'NFC' | 'NFD';
        z.string().check(z.normalize(nextForm()), z.normalize(nextForm()));
      `,
    },
    {
      name: 'check arguments - apply() may return another schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.string()
          .check(z.trim())
          .apply((schema) => z.pipe(schema, z.string()))
          .check(z.trim());
      `,
    },
    {
      name: 'non-zod code is not flagged',
      code: dedent`
        const obj = { brand: () => obj };
        obj.brand().brand();
      `,
    },
  ],
  invalid: [
    {
      name: 'check arguments - normalize form read from a constant',
      code: dedent`
        import * as z from 'zod/mini';
        const form = 'NFC';
        z.string().check(z.normalize(form), z.normalize());
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'normalize' } }],
    },
    {
      name: 'check arguments - overwrite does not reset describe',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.describe('a'), z.overwrite((s) => s), z.describe('b'));
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'describe' } }],
    },
    {
      name: 'check arguments - case and trim are independent',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.trim(), z.toUpperCase(), z.normalize(), z.trim());
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } }],
    },
    {
      name: 'check arguments - refine does not rewrite the value',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.trim(), z.refine(() => true), z.trim());
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } }],
    },
    {
      name: 'check arguments - trim repeated in one check',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.trim(), z.toLowerCase(), z.trim());
      `,
      errors: [
        {
          messageId: 'noDuplicateSchemaMethod',
          data: { method: 'trim' },
          line: 2,
          column: 45,
          endColumn: 53,
        },
      ],
    },
    {
      name: 'check arguments - trim repeated across two checks',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.trim()).check(z.trim());
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } }],
    },
    {
      name: 'check arguments - with() is the alias of check()',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().with(z.toUpperCase()).check(z.toUpperCase());
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'toUpperCase' } }],
    },
    {
      name: 'check arguments - toLowerCase repeated three times',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.toLowerCase(), z.toLowerCase(), z.toLowerCase());
      `,
      errors: [
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'toLowerCase' } },
        { messageId: 'noDuplicateSchemaMethod', data: { method: 'toLowerCase' } },
      ],
    },
    {
      name: 'check arguments - describe repeated',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.describe('a')).check(z.describe('b'));
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'describe' } }],
    },
    {
      name: 'check arguments - normalize with the same form',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.normalize('NFD'), z.normalize('NFD'));
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'normalize' } }],
    },
    {
      name: 'check arguments - normalize() defaults to NFC',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.normalize(), z.normalize('NFC'));
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'normalize' } }],
    },
    {
      name: 'check arguments - normalize with the same identifier',
      code: dedent`
        import * as z from 'zod/mini';
        const form = 'NFKC';
        z.string().check(z.normalize(form), z.normalize(form));
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'normalize' } }],
    },
    {
      name: 'check arguments - named imports',
      code: dedent`
        import { string, trim } from 'zod/mini';
        string().check(trim(), trim());
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } }],
    },
    {
      name: 'check arguments - inside a wrapper',
      code: dedent`
        import * as z from 'zod/mini';
        z.optional(z.string().check(z.trim(), z.trim()));
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'trim' } }],
    },
    {
      name: 'namespace - brand called twice',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().brand('Foo').brand('Bar');
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'brand' } }],
    },
    {
      name: 'named - brand called twice',
      code: dedent`
        import { string } from 'zod/mini';
        string().brand('Foo').brand('Bar');
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'brand' } }],
    },
    {
      name: 'named z - brand called twice',
      code: dedent`
        import { z } from 'zod/mini';
        z.string().brand('Foo').brand('Bar');
      `,
      errors: [{ messageId: 'noDuplicateSchemaMethod', data: { method: 'brand' } }],
    },
  ],
});
