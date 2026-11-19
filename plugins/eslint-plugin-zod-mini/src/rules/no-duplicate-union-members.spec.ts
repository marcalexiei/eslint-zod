import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noDuplicateUnionMembers } from './no-duplicate-union-members.js';

const ruleTester = new RuleTester();

ruleTester.run(noDuplicateUnionMembers.name, noDuplicateUnionMembers, {
  valid: [
    {
      name: 'distinct union members',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.string(), z.number(), z.literal('a')]);
      `,
    },
    {
      name: 'members that differ only in arguments',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.literal('draft'), z.literal('published')]);
      `,
    },
    {
      name: 'distinct enum and literal values',
      code: dedent`
        import * as z from 'zod/mini';
        z.enum(['a', 'b']);
        z.literal(['a', 'b']);
        z.literal([1, 1n]);
        z.literal(['1', 1]);
      `,
    },
    {
      name: 'repeated non-literal enum values are not compared',
      code: dedent`
        import * as z from 'zod/mini';
        const a = 'a';
        z.enum([a, a]);
        z.literal([a, a]);
      `,
    },
    {
      name: 'spread in the member list',
      code: dedent`
        import * as z from 'zod/mini';
        const rest = [z.string()];
        z.union([z.string(), ...rest, z.string()]);
        z.enum(['a', ...['b'], 'a']);
      `,
    },
    {
      name: 'hole in the member list',
      code: dedent`
        import * as z from 'zod/mini';
        z.enum(['a', , 'a']);
      `,
    },
    {
      name: 'member list that is not an array literal',
      code: dedent`
        import * as z from 'zod/mini';
        const members = [z.string(), z.string()] as const;
        z.union(members);
        z.enum({ A: 'a', B: 'a' });
        z.literal('a');
      `,
    },
    {
      name: 'distinct discriminated union members',
      code: dedent`
        import * as z from 'zod/mini';
        const A = z.object({ kind: z.literal('a') });
        const B = z.object({ kind: z.literal('b') });
        z.discriminatedUnion('kind', [A, B]);
      `,
    },
    {
      name: 'discriminator equal to a member is not compared',
      code: dedent`
        import * as z from 'zod/mini';
        z.discriminatedUnion('kind', [z.object({ kind: z.literal('kind') })]);
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import * as z from 'other';
        z.union([z.string(), z.string()]);
        z.enum(['a', 'a']);
      `,
    },
  ],
  invalid: [
    {
      name: 'repeated enum value',
      code: dedent`
        import * as z from 'zod/mini';
        z.enum(['a', 'b', 'a']);
      `,
      output: dedent`
        import * as z from 'zod/mini';
        z.enum(['a', 'b']);
      `,
      errors: [{ messageId: 'duplicateMember', data: { line: 2 }, column: 19 }],
    },
    {
      name: 'enum value repeated with another quote style',
      code: dedent`
        import * as z from 'zod/mini';
        z.enum(['a', "a"]);
      `,
      output: dedent`
        import * as z from 'zod/mini';
        z.enum(['a']);
      `,
      errors: [{ messageId: 'duplicateMember', data: { line: 2 } }],
    },
    {
      name: 'enum value repeated across lines, with a trailing comma',
      code: dedent`
        import * as z from 'zod/mini';
        z.enum([
          'a',
          'b',
          'a',
        ]);
      `,
      output: dedent`
        import * as z from 'zod/mini';
        z.enum([
          'a',
          'b',
        ]);
      `,
      errors: [{ messageId: 'duplicateMember', data: { line: 3 }, line: 5 }],
    },
    {
      name: 'enum value repeated twice',
      code: dedent`
        import * as z from 'zod/mini';
        z.enum(['a', 'a', 'a']);
      `,
      output: [
        dedent`
          import * as z from 'zod/mini';
          z.enum(['a', 'a']);
        `,
        dedent`
          import * as z from 'zod/mini';
          z.enum(['a']);
        `,
      ],
      errors: [
        { messageId: 'duplicateMember', data: { line: 2 }, column: 14 },
        { messageId: 'duplicateMember', data: { line: 2 }, column: 19 },
      ],
    },
    {
      name: 'enum through a named import',
      code: dedent`
        import { enum as zEnum } from 'zod/mini';
        zEnum(['a', 'a']);
      `,
      output: dedent`
        import { enum as zEnum } from 'zod/mini';
        zEnum(['a']);
      `,
      errors: [{ messageId: 'duplicateMember', data: { line: 2 } }],
    },
    {
      name: 'comment in the removed range withholds the fix',
      code: dedent`
        import * as z from 'zod/mini';
        z.enum(['a', /* again */ 'a']);
      `,
      output: null,
      errors: [{ messageId: 'duplicateMember', data: { line: 2 } }],
    },
    {
      name: 'comment outside the removed range keeps the fix',
      code: dedent`
        import * as z from 'zod/mini';
        z.enum(['a' /* first */, 'a']);
      `,
      output: dedent`
        import * as z from 'zod/mini';
        z.enum(['a' /* first */]);
      `,
      errors: [{ messageId: 'duplicateMember', data: { line: 2 } }],
    },
    {
      name: 'parenthesized duplicate withholds the fix',
      code: dedent`
        import * as z from 'zod/mini';
        z.enum(['a', ('a')]);
      `,
      output: null,
      errors: [{ messageId: 'duplicateMember', data: { line: 2 } }],
    },
    {
      name: 'repeated literal value',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(['a', 1, 'a', 1.0]);
      `,
      errors: [
        {
          messageId: 'duplicateMember',
          data: { line: 2 },
          column: 20,
          suggestions: [
            {
              messageId: 'removeDuplicate',
              output: dedent`
                import * as z from 'zod/mini';
                z.literal(['a', 1, 1.0]);
              `,
            },
          ],
        },
        {
          messageId: 'duplicateMember',
          data: { line: 2 },
          column: 25,
          suggestions: [
            {
              messageId: 'removeDuplicate',
              output: dedent`
                import * as z from 'zod/mini';
                z.literal(['a', 1, 'a']);
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'repeated union member',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.string(), z.number(), z.string()]);
      `,
      errors: [
        {
          messageId: 'duplicateMember',
          data: { line: 2 },
          column: 34,
          suggestions: [
            {
              messageId: 'removeDuplicate',
              output: dedent`
                import * as z from 'zod/mini';
                z.union([z.string(), z.number()]);
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'repeated identifier in a wrapped union',
      code: dedent`
        import * as z from 'zod/mini';
        const A = z.string();
        z.optional(z.union([A, z.number(), A]));
      `,
      errors: [
        {
          messageId: 'duplicateMember',
          data: { line: 3 },
          suggestions: [
            {
              messageId: 'removeDuplicate',
              output: dedent`
                import * as z from 'zod/mini';
                const A = z.string();
                z.optional(z.union([A, z.number()]));
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'members equal but for whitespace and comments',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([
          z.object({ a: z.string() }),
          z.object({
            a: z.string(), // copied
          }),
        ]);
      `,
      errors: [{ messageId: 'duplicateMember', data: { line: 3 }, line: 4, suggestions: [] }],
    },
    {
      name: 'nested union',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.union([z.literal('a'), z.literal('a')]), z.number()]);
      `,
      errors: [
        {
          messageId: 'duplicateMember',
          data: { line: 2 },
          suggestions: [
            {
              messageId: 'removeDuplicate',
              output: dedent`
                import * as z from 'zod/mini';
                z.union([z.union([z.literal('a')]), z.number()]);
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'repeated discriminated union member',
      code: dedent`
        import * as z from 'zod/mini';
        const A = z.object({ kind: z.literal('a') });
        const B = z.object({ kind: z.literal('b') });
        z.discriminatedUnion('kind', [A, B, A]);
      `,
      errors: [
        {
          messageId: 'duplicateDiscriminatedUnionMember',
          data: { line: 4 },
          column: 37,
          suggestions: [
            {
              messageId: 'removeDuplicate',
              output: dedent`
                import * as z from 'zod/mini';
                const A = z.object({ kind: z.literal('a') });
                const B = z.object({ kind: z.literal('b') });
                z.discriminatedUnion('kind', [A, B]);
              `,
            },
          ],
        },
      ],
    },
  ],
});
