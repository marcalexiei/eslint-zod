import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferEnumOverLiteralUnion } from './prefer-enum-over-literal-union.js';

const ruleTester = new RuleTester();

ruleTester.run(preferEnumOverLiteralUnion.name, preferEnumOverLiteralUnion, {
  valid: [
    {
      name: 'literal with a check — its argument is not the member value',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.literal('a').check(z.describe('first')), z.literal('b')]);
      `,
    },
    {
      name: 'literal with params',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.literal('a', { error: 'e' }), z.literal('b')]);
      `,
    },
    {
      name: 'empty union',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([]);
      `,
    },
    {
      name: 'namespace import',
      code: dedent`
        import * as z from 'zod/mini';
        z.enum(['foo', 'bar'])
      `,
    },
    {
      name: 'named z import',
      code: dedent`
        import { z } from 'zod/mini';
        z.enum(['foo', 'bar'])
      `,
    },
    {
      name: 'union with a member that is not a call (identifier reference)',
      code: dedent`
        import * as z from 'zod/mini';
        const Other = z.string();
        z.union([z.literal('foo'), Other])
      `,
    },
    {
      name: 'union with a non-literal element',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.literal('foo'), z.literal('bar'), z.int()])
      `,
    },
    {
      name: 'should error only for literal strings',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.literal('foo'), z.literal(5)])
      `,
    },
    {
      name: 'not triggered on zod import',
      code: dedent`
        import * as z from 'zod';
        z.union([z.literal('foo'), z.literal('bar')])
      `,
    },
    {
      name: 'zod/v4-mini import',
      code: dedent`
        import * as z from 'zod/v4-mini';
        z.enum(['foo', 'bar'])
      `,
    },
    {
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.string(), z.number()])
      `,
    },
    {
      code: dedent`
        import * as z from 'zod/mini';
        z.looseObject({
          modifiedTime: z.optional(z.string()),
          size: z.union([z.string(), z.number()]),
        });
      `,
    },
    {
      name: 'computed union access yields no walkable chain',
      code: dedent`
        import * as z from 'zod/mini';
        z['union']([z.literal('foo'), z.literal('bar')]);
      `,
    },
    {
      name: 'members passed through a variable instead of an array literal',
      code: dedent`
        import * as z from 'zod/mini';
        const members = [z.literal('foo'), z.literal('bar')] as const;
        z.union(members);
      `,
    },
    {
      name: 'argument-less `z.literal()` — invalid zod, valid JS, must not crash',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.literal(), z.literal('bar')]);
      `,
    },
    {
      name: 'sparse member array',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.literal('foo'), , z.literal('bar')]);
      `,
    },
  ],
  invalid: [
    {
      name: 'no fix before apply(), whose callback can read the union',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.literal('a'), z.literal('b')]).apply((s) => s);
      `,
      errors: [{ messageId: 'useEnum' }],
      output: null,
    },
    {
      name: 'property read from the schema — reported without a fix',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.literal('a'), z.literal('b')]).def.options;
      `,
      errors: [{ messageId: 'useEnum' }],
      output: null,
    },
    {
      name: 'namespace import',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.literal('foo'), z.literal('bar')])
      `,
      errors: [{ messageId: 'useEnum' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.enum(['foo', 'bar'])
      `,
    },
    {
      name: 'namespace import (keeps original string format)',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.literal("foo"), z.literal('bar')])
      `,
      errors: [{ messageId: 'useEnum' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.enum(["foo", 'bar'])
      `,
    },
    {
      name: 'namespace import different from z',
      code: dedent`
        import * as zod from 'zod/mini';
        zod.union([zod.literal('foo'), zod.literal('bar')])
      `,
      errors: [{ messageId: 'useEnum' }],
      output: dedent`
        import * as zod from 'zod/mini';
        zod.enum(['foo', 'bar'])
      `,
    },
    {
      name: 'named import',
      code: dedent`
        import { union, literal } from 'zod/mini';
        union([literal('foo'), literal('bar')])
      `,
      errors: [{ messageId: 'useEnum' }],
      output: null,
    },
    {
      name: 'named z import',
      code: dedent`
        import { z } from 'zod/mini';
        z.union([z.literal('foo'), z.literal('bar')])
      `,
      errors: [{ messageId: 'useEnum' }],
      output: dedent`
        import { z } from 'zod/mini';
        z.enum(['foo', 'bar'])
      `,
    },
    {
      name: 'zod/v4-mini import',
      code: dedent`
        import * as z from 'zod/v4-mini';
        z.union([z.literal('foo'), z.literal('bar')])
      `,
      errors: [{ messageId: 'useEnum' }],
      output: dedent`
        import * as z from 'zod/v4-mini';
        z.enum(['foo', 'bar'])
      `,
    },
    {
      name: 'with check method (namespace import)',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.literal('foo'), z.literal('bar')]).check(z.refine(() => true));
      `,
      errors: [{ messageId: 'useEnum' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.enum(['foo', 'bar']).check(z.refine(() => true));
      `,
    },
    {
      name: 'nested (namespace import)',
      code: dedent`
        import * as z from 'zod/mini';
        z.looseObject({
          size: z.union([z.literal('foo'), z.literal('bar')]),
        });
      `,
      errors: [{ messageId: 'useEnum' }],
      output: dedent`
        import * as z from 'zod/mini';
        z.looseObject({
          size: z.enum(['foo', 'bar']),
        });
      `,
    },
    {
      name: 'union imported under an alias',
      code: dedent`
        import { union as u, literal } from 'zod/mini';
        u([literal('a'), literal('b')]);
      `,
      errors: [{ messageId: 'useEnum' }],
      output: null,
    },
  ],
});
