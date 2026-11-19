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
      name: 'check arguments - each setter check once',
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
      name: 'check arguments - accumulating checks are left alone',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(
          z.regex(/a/),
          z.regex(/a/),
          z.includes('a'),
          z.includes('b'),
          z.startsWith('a'),
          z.startsWith('a'),
          z.endsWith('a'),
          z.endsWith('a'),
          z.overwrite((s) => s),
          z.overwrite((s) => s),
          z.refine(() => true),
          z.refine(() => true),
          z.superRefine(() => {}),
          z.superRefine(() => {}),
          z.meta({ a: 1 }),
          z.meta({ b: 2 }),
        );
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
      name: 'zod imports are out of scope',
      code: dedent`
        import * as z from 'zod';
        z.string().brand('Foo').brand('Bar');
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
      name: 'check arguments - trim repeated in one check',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.trim(), z.toLowerCase(), z.trim());
      `,
      errors: [
        {
          messageId: 'noDuplicateCheckArgument',
          data: { check: 'trim' },
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
      errors: [{ messageId: 'noDuplicateCheckArgument', data: { check: 'trim' } }],
    },
    {
      name: 'check arguments - with() is the alias of check()',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().with(z.toUpperCase()).check(z.toUpperCase());
      `,
      errors: [{ messageId: 'noDuplicateCheckArgument', data: { check: 'toUpperCase' } }],
    },
    {
      name: 'check arguments - toLowerCase repeated three times',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.toLowerCase(), z.toLowerCase(), z.toLowerCase());
      `,
      errors: [
        { messageId: 'noDuplicateCheckArgument', data: { check: 'toLowerCase' } },
        { messageId: 'noDuplicateCheckArgument', data: { check: 'toLowerCase' } },
      ],
    },
    {
      name: 'check arguments - describe repeated',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.describe('a')).check(z.describe('b'));
      `,
      errors: [{ messageId: 'noDuplicateCheckArgument', data: { check: 'describe' } }],
    },
    {
      name: 'check arguments - normalize with the same form',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.normalize('NFD'), z.normalize('NFD'));
      `,
      errors: [{ messageId: 'noDuplicateCheckArgument', data: { check: 'normalize' } }],
    },
    {
      name: 'check arguments - normalize() defaults to NFC',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.normalize(), z.normalize('NFC'));
      `,
      errors: [{ messageId: 'noDuplicateCheckArgument', data: { check: 'normalize' } }],
    },
    {
      name: 'check arguments - normalize with the same identifier',
      code: dedent`
        import * as z from 'zod/mini';
        const form = 'NFKC';
        z.string().check(z.normalize(form), z.normalize(form));
      `,
      errors: [{ messageId: 'noDuplicateCheckArgument', data: { check: 'normalize' } }],
    },
    {
      name: 'check arguments - named imports',
      code: dedent`
        import { string, trim } from 'zod/mini';
        string().check(trim(), trim());
      `,
      errors: [{ messageId: 'noDuplicateCheckArgument', data: { check: 'trim' } }],
    },
    {
      name: 'check arguments - inside a wrapper',
      code: dedent`
        import * as z from 'zod/mini';
        z.optional(z.string().check(z.trim(), z.trim()));
      `,
      errors: [{ messageId: 'noDuplicateCheckArgument', data: { check: 'trim' } }],
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
