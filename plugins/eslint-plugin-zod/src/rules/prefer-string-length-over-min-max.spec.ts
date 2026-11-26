import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferStringLengthOverMinMax } from './prefer-string-length-over-min-max.js';

const ruleTester = new RuleTester();

ruleTester.run(preferStringLengthOverMinMax.name, preferStringLengthOverMinMax, {
  valid: [
    {
      name: 'bounds on either side of unwrap()',
      code: dedent`
        import * as z from 'zod';
        z.string().min(3).optional().unwrap().max(3);
      `,
    },
    {
      name: 'bounds on either side of apply()',
      code: dedent`
        import * as z from 'zod';
        z.string().min(3).apply((schema) => schema).max(3);
      `,
    },
    {
      name: 'type-changing method between the bounds — the second one bounds the array',
      code: dedent`
        import * as z from 'zod';
        z.string().min(3).array().max(3);
      `,
    },
    {
      name: 'slugify between the bounds',
      code: dedent`
        import * as z from 'zod';
        z.string().min(3).slugify().max(3);
      `,
    },
    {
      name: 'already an exact length',
      code: dedent`
        import * as z from 'zod';
        z.string().length(3)
      `,
    },
    {
      name: 'different bounds',
      code: dedent`
        import * as z from 'zod';
        z.string().min(3).max(5)
      `,
    },
    {
      name: 'lower bound only',
      code: dedent`
        import * as z from 'zod';
        z.string().min(3)
      `,
    },
    {
      name: 'upper bound only',
      code: dedent`
        import * as z from 'zod';
        z.string().max(3)
      `,
    },
    {
      name: 'non-literal bounds',
      code: dedent`
        import * as z from 'zod';
        const n = 3;
        z.string().min(n).max(n)
      `,
    },
    {
      name: 'bounds carrying error messages',
      code: dedent`
        import * as z from 'zod';
        z.string().min(3, 'too short').max(3, 'too long')
      `,
    },
    {
      name: 'a mutating check between the bounds changes what the second sees',
      code: dedent`
        import * as z from 'zod';
        z.string().min(3).trim().max(3)
      `,
    },
    {
      name: 'nonempty keeps its spelling',
      code: dedent`
        import * as z from 'zod';
        z.string().nonempty().max(1)
      `,
    },
    {
      name: 'equal value bounds on a number are not a length',
      code: dedent`
        import * as z from 'zod';
        z.number().min(3).max(3)
      `,
    },
    {
      name: 'equal length bounds on an array belong to prefer-tuple-over-array-length',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).min(2).max(2)
      `,
    },
    {
      name: 'equal size bounds on a set belong to the size rule',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).min(2).max(2)
      `,
    },
    {
      name: 'a computed chain member is not analyzed',
      code: dedent`
        import * as z from 'zod';
        z['string']().min(3).max(3)
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { string } from 'not-zod';
        string().min(3).max(3)
      `,
    },
  ],
  invalid: [
    {
      name: 'collapses equal bounds to length()',
      code: dedent`
        import * as z from 'zod';
        z.string().min(3).max(3)
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod';
        z.string().length(3)
      `,
    },
    {
      name: 'collapses max() before min()',
      code: dedent`
        import * as z from 'zod';
        z.string().max(3).min(3)
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod';
        z.string().length(3)
      `,
    },
    {
      name: 'collapses zero-length bounds',
      code: dedent`
        import * as z from 'zod';
        z.string().min(0).max(0)
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod';
        z.string().length(0)
      `,
    },
    {
      name: 'keeps surrounding chain methods',
      code: dedent`
        import * as z from 'zod';
        z.string().trim().min(3).max(3).optional()
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod';
        z.string().trim().length(3).optional()
      `,
    },
    {
      name: 'keeps a non-mutating check between the bounds',
      code: dedent`
        import * as z from 'zod';
        z.string().min(3).regex(/a/).max(3)
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod';
        z.string().length(3).regex(/a/)
      `,
    },
    {
      name: 'fires on a top-level string format',
      code: dedent`
        import * as z from 'zod';
        z.email().min(3).max(3)
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod';
        z.email().length(3)
      `,
    },
    {
      name: 'fires on a credit card schema',
      code: dedent`
        import * as z from 'zod';
        z.creditCard().min(16).max(16)
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod';
        z.creditCard().length(16)
      `,
    },
    {
      name: 'fires on a named factory import',
      code: dedent`
        import { string } from 'zod';
        string().min(3).max(3)
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import { string } from 'zod';
        string().length(3)
      `,
    },
    {
      name: 'fires on a nested schema',
      code: dedent`
        import * as z from 'zod';
        z.object({ code: z.string().min(3).max(3) })
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: dedent`
        import * as z from 'zod';
        z.object({ code: z.string().length(3) })
      `,
    },
    {
      name: 'parenthesized receiver — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        (z.string().min(3)).max(3);
      `,
      errors: [{ messageId: 'preferStringLength' }],
      output: null,
    },
  ],
});
