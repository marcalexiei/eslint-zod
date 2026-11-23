import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferTupleOverArrayLength } from './prefer-tuple-over-array-length.js';

const ruleTester = new RuleTester();

ruleTester.run(preferTupleOverArrayLength.name, preferTupleOverArrayLength, {
  valid: [
    {
      name: 'checks after apply() bound another schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).apply((schema) => schema).check(z.length(2));
      `,
    },
    {
      name: 'already a tuple',
      code: dedent`
        import * as z from 'zod/mini';
        z.tuple([z.string(), z.string()])
      `,
    },
    {
      name: 'array without a length constraint',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string())
      `,
    },
    {
      name: 'check without a length constraint',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.refine(() => true))
      `,
    },
    {
      name: 'length constraint on a non-array schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(2))
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { array } from 'not-zod';
        array(string()).check(length(2))
      `,
    },
    {
      name: 'length check on a schema reached through a property access',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).def.element.check(z.trim()).check(z.length(2));
      `,
    },
  ],
  invalid: [
    {
      name: 'no fix before apply(), whose callback can read the array',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.length(2)).apply((s) => s);
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'property read from the schema — reported without a fix',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.length(2)).def.element;
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'check(z.length()) autofixes to a tuple',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.length(2))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.tuple([z.string(), z.string()])
      `,
    },
    {
      name: 'length(0) autofixes to an empty tuple',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.length(0))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.tuple([])
      `,
    },
    {
      name: 'preserves trailing chain methods',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.length(2)).brand('Pair')
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.tuple([z.string(), z.string()]).brand('Pair')
      `,
    },
    {
      name: 'namespace import different from z',
      code: dedent`
        import * as zod from 'zod/mini';
        zod.array(zod.string()).check(zod.length(2))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as zod from 'zod/mini';
        zod.tuple([zod.string(), zod.string()])
      `,
    },
    {
      name: 'nested inside an object schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.object({
          pair: z.array(z.string()).check(z.length(2)),
        });
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.object({
          pair: z.tuple([z.string(), z.string()]),
        });
      `,
    },
    {
      name: 'minLength() autofixes to a rest tuple',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.minLength(2))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.tuple([z.string(), z.string()], z.string())
      `,
    },
    {
      name: 'maxLength() is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.maxLength(5))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'sibling checks are report-only (no autofix)',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.minLength(1), z.length(2))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'equal minLength()/maxLength() bounds in one check autofix to a fixed tuple',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.minLength(2), z.maxLength(2))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.tuple([z.string(), z.string()])
      `,
    },
    {
      name: 'equal minLength()/maxLength() bounds across checks autofix to a fixed tuple',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.minLength(2)).check(z.maxLength(2))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.tuple([z.string(), z.string()])
      `,
    },
    {
      name: 'unequal minLength()/maxLength() bounds across checks is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.minLength(2)).check(z.maxLength(5))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'non-literal length is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod/mini';
        const n = 2;
        z.array(z.string()).check(z.length(n))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'non-literal minLength is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod/mini';
        const n = 2;
        z.array(z.string()).check(z.minLength(n))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'non-integer literal length is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.length(2.5))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'named import is report-only (no autofix)',
      code: dedent`
        import { array, string, length } from 'zod/mini';
        array(string()).check(length(2))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'array without an element schema is report-only (no autofix)',
      code: dedent`
        import * as z from 'zod/mini';
        z.array().check(z.length(2))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'removing the length check would orphan a sibling check (no autofix)',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.length(2), z.refine((value) => value.length > 0))
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'parenthesized receiver — reported without a fix',
      code: dedent`
        import * as z from 'zod/mini';
        (z.array(z.string())).check(z.length(2));
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'length check with a custom error — reported without a fix',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.length(2, 'two'));
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'large count — reported without a fix',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.length(11));
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
    {
      name: 'length check after a check that rewrites the array — reported without a fix',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.overwrite((items) => [...new Set(items)])).check(z.length(2));
      `,
      errors: [{ messageId: 'preferTuple' }],
      output: null,
    },
  ],
});
