import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferTupleOverArrayLength } from './prefer-tuple-over-array-length.js';

const ruleTester = new RuleTester();

ruleTester.run(preferTupleOverArrayLength.name, preferTupleOverArrayLength, {
  valid: [
    {
      name: 'checks after unwrap() bound another schema',
      code: dedent`
        import * as z from 'zod';
        z.array(z.array(z.string())).unwrap().length(2);
      `,
    },
    {
      name: 'checks after apply() bound another schema',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).apply((schema) => schema).length(2);
      `,
    },
    {
      name: 'length check after a type-changing method bounds the outer array',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).array().min(2);
      `,
    },
    {
      name: 'already a tuple',
      code: dedent`
        import * as z from 'zod';
        z.tuple([z.string(), z.string()])
      `,
    },
    {
      name: 'array without a length constraint',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string())
      `,
    },
    {
      name: 'nonempty is the idiomatic typed variant',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).nonempty()
      `,
    },
    {
      name: 'length constraint on a non-array schema',
      code: dedent`
        import * as z from 'zod';
        z.string().min(2).max(5)
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { array } from 'not-zod';
        array(string()).length(2)
      `,
    },
    {
      name: 'length check on a schema reached through a property access',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).element.trim().length(2);
      `,
    },
  ],
  invalid: [
    {
      name: 'no fix when a variable holding the array reads its element',
      code: dedent`
        import * as z from 'zod';
        const a = z.array(z.string()).length(2);
        a.element;
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'no fix before unwrap(), which a tuple does not have',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).length(2).unwrap();
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'property read from the schema — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).length(2).element;
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'length() autofixes to a tuple',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).length(2)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod';
        z.tuple([z.string(), z.string()])
      `,
    },
    {
      name: 'length(0) autofixes to an empty tuple',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).length(0)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod';
        z.tuple([])
      `,
    },
    {
      name: 'preserves trailing chain methods',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).length(2).readonly()
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod';
        z.tuple([z.string(), z.string()]).readonly()
      `,
    },
    {
      name: 'namespace import different from z',
      code: dedent`
        import * as zod from 'zod';
        zod.array(zod.string()).length(2)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as zod from 'zod';
        zod.tuple([zod.string(), zod.string()])
      `,
    },
    {
      name: 'nested inside an object schema',
      code: dedent`
        import * as z from 'zod';
        z.object({
          pair: z.array(z.string()).length(2),
        });
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod';
        z.object({
          pair: z.tuple([z.string(), z.string()]),
        });
      `,
    },
    {
      name: 'min() autofixes to a rest tuple',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).min(2)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod';
        z.tuple([z.string(), z.string()], z.string())
      `,
    },
    {
      name: 'min(1) autofixes to a single-element rest tuple',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).min(1)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod';
        z.tuple([z.string()], z.string())
      `,
    },
    {
      name: 'max() is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).max(5)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'equal min()/max() bounds autofix to a fixed tuple',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).min(2).max(2)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod';
        z.tuple([z.string(), z.string()])
      `,
    },
    {
      name: 'unequal min()/max() bounds is report-only (no tuple equivalent)',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).min(2).max(5)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'non-literal length is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod';
        const n = 2;
        z.array(z.string()).length(n)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'non-literal min is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod';
        const n = 2;
        z.array(z.string()).min(n)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'non-integer literal length is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).length(2.5)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'named import is report-only (no autofix)',
      code: dedent`
        import { array, string } from 'zod';
        array(string()).length(2)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'array without an element schema is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod';
        z.array().length(2)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'length without an argument is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).length()
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'spread element schema is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod';
        declare const args: [z.ZodString];
        z.array(...args).length(2)
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'parenthesized receiver — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        (z.array(z.string())).length(2);
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'length check with a custom error — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).length(2, 'two');
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'large count — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).length(11);
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'comment in the rewritten text — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string())
          // keep
          .length(2);
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'length bound after a check that rewrites the array — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).overwrite((items) => [...new Set(items)]).min(2);
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
  ],
});
