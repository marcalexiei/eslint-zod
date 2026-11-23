import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferMapSetSizeOverMinMax } from './prefer-map-set-size-over-min-max.js';

const ruleTester = new RuleTester();

ruleTester.run(preferMapSetSizeOverMinMax.name, preferMapSetSizeOverMinMax, {
  valid: [
    {
      name: 'bounds on either side of apply()',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.minSize(3)).apply((schema) => schema).check(z.maxSize(3));
      `,
    },
    {
      name: 'already an exact size',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.size(3))
      `,
    },
    {
      name: 'different bounds',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.minSize(3), z.maxSize(5))
      `,
    },
    {
      name: 'lower bound only',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.minSize(3))
      `,
    },
    {
      name: 'upper bound only',
      code: dedent`
        import * as z from 'zod/mini';
        z.map(z.string(), z.number()).check(z.maxSize(3))
      `,
    },
    {
      name: 'non-literal bounds',
      code: dedent`
        import * as z from 'zod/mini';
        const n = 3;
        z.set(z.string()).check(z.minSize(n), z.maxSize(n))
      `,
    },
    {
      name: 'bounds carrying error messages',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.minSize(3, 'too few'), z.maxSize(3, 'too many'))
      `,
    },
    {
      name: 'a mutating check between the bounds changes what the second sees',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.minSize(3), z.overwrite((value) => value), z.maxSize(3))
      `,
    },
    {
      name: 'equal value bounds on a number are not a size',
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
      name: 'equal length bounds on a string belong to prefer-string-length-over-min-max',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(2), z.maxLength(2))
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { set, string, minSize, maxSize } from 'not-zod';
        set(string()).check(minSize(3), maxSize(3))
      `,
    },
  ],
  invalid: [
    {
      name: 'collapses equal bounds on a set to z.size()',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.minSize(3), z.maxSize(3))
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.size(3))
      `,
    },
    {
      name: 'collapses equal bounds on a map to z.size()',
      code: dedent`
        import * as z from 'zod/mini';
        z.map(z.string(), z.number()).check(z.minSize(2), z.maxSize(2))
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.map(z.string(), z.number()).check(z.size(2))
      `,
    },
    {
      name: 'collapses the upper bound written first',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.maxSize(3), z.minSize(3))
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.size(3))
      `,
    },
    {
      name: 'collapses zero-size bounds',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.minSize(0), z.maxSize(0))
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.size(0))
      `,
    },
    {
      name: 'keeps the other arguments of the same check call',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.minSize(3), z.describe('ids'), z.maxSize(3))
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.size(3), z.describe('ids'))
      `,
    },
    {
      name: 'drops the whole check call when the removed bound was alone in it',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.minSize(3)).check(z.maxSize(3))
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.size(3))
      `,
    },
    {
      name: 'removes a leading bound argument with its separator',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.minSize(3)).check(z.maxSize(3), z.describe('ids'))
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z.size(3)).check(z.describe('ids'))
      `,
    },
    {
      name: 'fires on named imports when size is imported',
      code: dedent`
        import { maxSize, minSize, set, size, string } from 'zod/mini';
        set(string()).check(minSize(3), maxSize(3))
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import { maxSize, minSize, set, size, string } from 'zod/mini';
        set(string()).check(size(3))
      `,
    },
    {
      name: 'reports without a fix when size is not imported',
      code: dedent`
        import { maxSize, minSize, set, string } from 'zod/mini';
        set(string()).check(minSize(3), maxSize(3))
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: null,
    },
    {
      name: 'reports without a fix when a bound is called through a computed member',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(z['minSize'](3), z.maxSize(3))
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: null,
    },
    {
      name: 'respects an aliased size import',
      code: dedent`
        import { maxSize, minSize, set, size as exactSize, string } from 'zod/mini';
        set(string()).check(minSize(3), maxSize(3))
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import { maxSize, minSize, set, size as exactSize, string } from 'zod/mini';
        set(string()).check(exactSize(3))
      `,
    },
    {
      name: 'fires on a nested schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.object({ ids: z.set(z.string()).check(z.minSize(3), z.maxSize(3)) })
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.object({ ids: z.set(z.string()).check(z.size(3)) })
      `,
    },
    {
      name: 'comment in the rewritten text — reported without a fix',
      code: dedent`
        import * as z from 'zod/mini';
        z.set(z.string()).check(
          z.minSize(2),
          // keep
          z.maxSize(2),
        );
      `,
      errors: [{ messageId: 'preferMapSetSize' }],
      output: null,
    },
  ],
});
