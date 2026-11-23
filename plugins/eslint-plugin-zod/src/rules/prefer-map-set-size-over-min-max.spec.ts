import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferMapSetSizeOverMinMax } from './prefer-map-set-size-over-min-max.js';

const ruleTester = new RuleTester();

ruleTester.run(preferMapSetSizeOverMinMax.name, preferMapSetSizeOverMinMax, {
  valid: [
    {
      name: 'bounds on either side of unwrap()',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).min(3).optional().unwrap().max(3);
      `,
    },
    {
      name: 'bounds on either side of apply()',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).min(3).apply((schema) => schema).max(3);
      `,
    },
    {
      name: 'already an exact size',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).size(3)
      `,
    },
    {
      name: 'different bounds',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).min(3).max(5)
      `,
    },
    {
      name: 'lower bound only',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).min(3)
      `,
    },
    {
      name: 'upper bound only',
      code: dedent`
        import * as z from 'zod';
        z.map(z.string(), z.number()).max(3)
      `,
    },
    {
      name: 'non-literal bounds',
      code: dedent`
        import * as z from 'zod';
        const n = 3;
        z.set(z.string()).min(n).max(n)
      `,
    },
    {
      name: 'bounds carrying error messages',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).min(3, 'too few').max(3, 'too many')
      `,
    },
    {
      name: 'a mutating check between the bounds changes what the second sees',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).min(3).overwrite((value) => value).max(3)
      `,
    },
    {
      name: 'nonempty keeps its spelling',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).nonempty().max(1)
      `,
    },
    {
      name: 'equal value bounds on a number are not a size',
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
      name: 'equal length bounds on a string belong to prefer-string-length-over-min-max',
      code: dedent`
        import * as z from 'zod';
        z.string().min(2).max(2)
      `,
    },
    {
      name: 'a computed chain member is not analyzed',
      code: dedent`
        import * as z from 'zod';
        z['set'](z.string()).min(3).max(3)
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { set, string } from 'not-zod';
        set(string()).min(3).max(3)
      `,
    },
    {
      name: 'bounds on a schema reached through a property access',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).def.valueType.trim().min(3).max(3);
      `,
    },
  ],
  invalid: [
    {
      name: 'collapses equal bounds on a set to size()',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).min(3).max(3)
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod';
        z.set(z.string()).size(3)
      `,
    },
    {
      name: 'collapses equal bounds on a map to size()',
      code: dedent`
        import * as z from 'zod';
        z.map(z.string(), z.number()).min(2).max(2)
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod';
        z.map(z.string(), z.number()).size(2)
      `,
    },
    {
      name: 'collapses max() before min()',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).max(3).min(3)
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod';
        z.set(z.string()).size(3)
      `,
    },
    {
      name: 'collapses zero-size bounds',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).min(0).max(0)
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod';
        z.set(z.string()).size(0)
      `,
    },
    {
      name: 'keeps surrounding chain methods',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).min(3).max(3).optional()
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod';
        z.set(z.string()).size(3).optional()
      `,
    },
    {
      name: 'keeps a non-mutating check between the bounds',
      code: dedent`
        import * as z from 'zod';
        z.set(z.string()).min(3).describe('ids').max(3)
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod';
        z.set(z.string()).size(3).describe('ids')
      `,
    },
    {
      name: 'fires on a named factory import',
      code: dedent`
        import { set, string } from 'zod';
        set(string()).min(3).max(3)
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import { set, string } from 'zod';
        set(string()).size(3)
      `,
    },
    {
      name: 'fires on a nested schema',
      code: dedent`
        import * as z from 'zod';
        z.object({ ids: z.set(z.string()).min(3).max(3) })
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod';
        z.object({ ids: z.set(z.string()).size(3) })
      `,
    },
  ],
});
