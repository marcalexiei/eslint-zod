import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferNullish } from './prefer-nullish.js';

const ruleTester = new RuleTester();

ruleTester.run(preferNullish.name, preferNullish, {
  valid: [
    {
      name: 'already using nullish',
      code: dedent`
        import * as z from 'zod/mini';
        z.nullish(z.string());
      `,
    },
    {
      name: 'only optional',
      code: dedent`
        import * as z from 'zod/mini';
        z.optional(z.string());
      `,
    },
    {
      name: 'only nullable',
      code: dedent`
        import * as z from 'zod/mini';
        z.nullable(z.string());
      `,
    },
    {
      name: 'inner wrapper carries a check',
      code: dedent`
        import * as z from 'zod/mini';
        z.optional(z.nullable(z.string()).check(z.refine(() => true)));
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { optional, nullable, string } from 'not-zod';
        optional(nullable(string()));
      `,
    },
    {
      name: 'computed wrapper access yields no walkable chain',
      code: dedent`
        import * as z from 'zod/mini';
        z['optional'](z.nullable(z.string()));
      `,
    },
    {
      name: 'wrapper argument passed through a variable',
      code: dedent`
        import * as z from 'zod/mini';
        const inner = z.nullable(z.string());
        z.optional(inner);
      `,
    },
  ],
  invalid: [
    {
      name: 'wrapped argument that is not a plain schema call — still fixed inside the argument slot',
      code: dedent`
        import * as z from 'zod/mini';
        z.optional(z.nullable(isStrict ? strictSchema : looseSchema));
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.nullish(isStrict ? strictSchema : looseSchema);
      `,
    },
    {
      name: 'optional wrapping nullable',
      code: dedent`
        import * as z from 'zod/mini';
        z.optional(z.nullable(z.string()));
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.nullish(z.string());
      `,
    },
    {
      name: 'nullable wrapping optional',
      code: dedent`
        import * as z from 'zod/mini';
        z.nullable(z.optional(z.string()));
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.nullish(z.string());
      `,
    },
    {
      name: 'nested inside an object schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.object({ foo: z.optional(z.nullable(z.string())) });
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.object({ foo: z.nullish(z.string()) });
      `,
    },
    {
      name: 'named import',
      code: dedent`
        import { optional, nullable, nullish, string } from 'zod/mini';
        optional(nullable(string()));
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: dedent`
        import { optional, nullable, nullish, string } from 'zod/mini';
        nullish(string());
      `,
    },
    {
      name: 'named import without nullish reports but cannot fix',
      code: dedent`
        import { optional, nullable, string } from 'zod/mini';
        optional(nullable(string()));
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: null,
    },
    {
      name: 'named import used as an object — reported, but renaming the callee would delete the member call',
      code: dedent`
        import { optional, nullable, nullish, string } from 'zod/mini';
        optional.call(nullable(string()));
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: null,
    },
  ],
});
