import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferStringLengthOverMinMax } from './prefer-string-length-over-min-max.js';

const ruleTester = new RuleTester();

ruleTester.run(preferStringLengthOverMinMax.name, preferStringLengthOverMinMax, {
  valid: [
    {
      name: 'bounds on either side of apply()',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(3)).apply((schema) => schema).check(z.maxLength(3));
      `,
    },
    {
      name: 'opaque check between the bounds — it may mutate the value',
      code: dedent`
        import * as z from 'zod/mini';
        const trimIt = z.trim();
        z.string().check(z.minLength(3), trimIt, z.maxLength(3));
      `,
    },
    {
      name: 'already an exact length',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.length(3))
      `,
    },
    {
      name: 'different bounds',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(3), z.maxLength(5))
      `,
    },
    {
      name: 'lower bound only',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(3))
      `,
    },
    {
      name: 'upper bound only',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.maxLength(3))
      `,
    },
    {
      name: 'non-literal bounds',
      code: dedent`
        import * as z from 'zod/mini';
        const n = 3;
        z.string().check(z.minLength(n), z.maxLength(n))
      `,
    },
    {
      name: 'bounds carrying error messages',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(3, 'too short'), z.maxLength(3, 'too long'))
      `,
    },
    {
      name: 'a mutating check between the bounds changes what the second sees',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(3), z.trim(), z.maxLength(3))
      `,
    },
    {
      name: 'equal value bounds on a number are not a length',
      code: dedent`
        import * as z from 'zod/mini';
        z.number().check(z.gte(3), z.lte(3))
      `,
    },
    {
      name: 'equal length bounds on an array belong to prefer-tuple-over-array-length',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.minLength(2), z.maxLength(2))
      `,
    },
    {
      name: 'equal size bounds on a set belong to the size rule',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.minSize(2), z.maxSize(2))
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { string, minLength, maxLength } from 'not-zod';
        string().check(minLength(3), maxLength(3))
      `,
    },
    {
      name: 'callback check between the two bounds may rewrite the value',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(
          z.minLength(6),
          z.check((ctx) => {
            ctx.value = ctx.value.trim();
          }),
          z.maxLength(6),
        );
      `,
    },
  ],
  invalid: [
    {
      name: 'collapses equal bounds to z.length()',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(3), z.maxLength(3))
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.length(3))
      `,
    },
    {
      name: 'collapses the upper bound written first',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.maxLength(3), z.minLength(3))
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.length(3))
      `,
    },
    {
      name: 'collapses zero-length bounds',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(0), z.maxLength(0))
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.length(0))
      `,
    },
    {
      name: 'keeps the other arguments of the same check call',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(3), z.regex(/a/), z.maxLength(3))
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.length(3), z.regex(/a/))
      `,
    },
    {
      name: 'drops the whole check call when the removed bound was alone in it',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(3)).check(z.maxLength(3))
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.length(3))
      `,
    },
    {
      name: 'removes a leading bound argument with its separator',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(3)).check(z.maxLength(3), z.regex(/a/))
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.length(3)).check(z.regex(/a/))
      `,
    },
    {
      name: 'fires on a top-level string format',
      code: dedent`
        import * as z from 'zod/mini';
        z.email().check(z.minLength(3), z.maxLength(3))
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.email().check(z.length(3))
      `,
    },
    {
      name: 'fires on a credit card schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.creditCard().check(z.minLength(16), z.maxLength(16))
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.creditCard().check(z.length(16))
      `,
    },
    {
      name: 'fires on named imports when length is imported',
      code: dedent`
        import { length, maxLength, minLength, string } from 'zod/mini';
        string().check(minLength(3), maxLength(3))
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import { length, maxLength, minLength, string } from 'zod/mini';
        string().check(length(3))
      `,
    },
    {
      name: 'reports without a fix when length is not imported',
      code: dedent`
        import { maxLength, minLength, string } from 'zod/mini';
        string().check(minLength(3), maxLength(3))
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: null,
    },
    {
      name: 'reports without a fix when a bound is called through a computed member',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z['minLength'](3), z.maxLength(3))
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: null,
    },
    {
      name: 'respects an aliased length import',
      code: dedent`
        import { length as exactLength, maxLength, minLength, string } from 'zod/mini';
        string().check(minLength(3), maxLength(3))
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import { length as exactLength, maxLength, minLength, string } from 'zod/mini';
        string().check(exactLength(3))
      `,
    },
    {
      name: 'fires on a nested schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.object({ code: z.string().check(z.minLength(3), z.maxLength(3)) })
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.object({ code: z.string().check(z.length(3)) })
      `,
    },
  ],
});
