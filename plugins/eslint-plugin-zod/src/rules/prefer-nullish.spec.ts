import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferNullish } from './prefer-nullish.js';

const ruleTester = new RuleTester();

ruleTester.run(preferNullish.name, preferNullish, {
  valid: [
    {
      name: 'factory aliased to `optional` is still a string schema',
      code: dedent`
        import { string as optional } from 'zod';
        optional().nullable();
      `,
    },
    {
      name: 'already using nullish',
      code: dedent`
        import * as z from 'zod';
        z.string().nullish();
      `,
    },
    {
      name: 'only optional',
      code: dedent`
        import * as z from 'zod';
        z.string().optional();
      `,
    },
    {
      name: 'only nullable',
      code: dedent`
        import * as z from 'zod';
        z.string().nullable();
      `,
    },
    {
      name: 'optional and nullable not adjacent',
      code: dedent`
        import * as z from 'zod';
        z.string().optional().describe('x').nullable();
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { string } from 'not-zod';
        string().optional().nullable();
      `,
    },
    {
      name: 'nullable passed to a method called after a property access',
      code: dedent`
        import * as z from 'zod';
        z.optional(z.string()).def.innerType.or(z.nullable(z.string()));
      `,
    },
  ],
  invalid: [
    {
      name: 'property read from the schema — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.string().optional().nullable().def.innerType;
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: null,
    },
    {
      name: 'optional then nullable',
      code: dedent`
        import * as z from 'zod';
        z.string().optional().nullable();
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: dedent`
        import * as z from 'zod';
        z.string().nullish();
      `,
    },
    {
      name: 'nullable then optional',
      code: dedent`
        import * as z from 'zod';
        z.string().nullable().optional();
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: dedent`
        import * as z from 'zod';
        z.string().nullish();
      `,
    },
    {
      name: 'keeps preceding checks',
      code: dedent`
        import * as z from 'zod';
        z.string().min(2).optional().nullable();
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: dedent`
        import * as z from 'zod';
        z.string().min(2).nullish();
      `,
    },
    {
      name: 'keeps trailing methods',
      code: dedent`
        import * as z from 'zod';
        z.string().optional().nullable().describe('x');
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: dedent`
        import * as z from 'zod';
        z.string().nullish().describe('x');
      `,
    },
    {
      name: 'nested inside an object schema',
      code: dedent`
        import * as z from 'zod';
        z.object({ foo: z.string().optional().nullable() });
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: dedent`
        import * as z from 'zod';
        z.object({ foo: z.string().nullish() });
      `,
    },
    {
      name: 'named import',
      code: dedent`
        import { string } from 'zod';
        string().optional().nullable();
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: dedent`
        import { string } from 'zod';
        string().nullish();
      `,
    },
    {
      name: 'named import used as an object — reported, but renaming the callee would delete the member call',
      code: dedent`
        import { optional, nullable, nullish, string } from 'zod';
        optional.call(nullable(string()));
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: null,
    },
    {
      name: 'comment in the rewritten text — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.string()
          // keep
          .optional()
          .nullable();
      `,
      errors: [{ messageId: 'preferNullish' }],
      output: null,
    },
  ],
});
