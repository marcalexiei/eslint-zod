import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noDuplicateUnionMembers } from './no-duplicate-union-members.js';

const ruleTester = new RuleTester();

ruleTester.run(noDuplicateUnionMembers.name, noDuplicateUnionMembers, {
  valid: [
    {
      name: 'distinct members',
      code: dedent`
        import * as core from 'zod/v4/core';
        core._union(core.$ZodUnion, [A, B]);
        core._enum(core.$ZodEnum, ['a', 'b']);
        core._literal(core.$ZodLiteral, ['a', 'b']);
        core._discriminatedUnion(core.$ZodDiscriminatedUnion, 'kind', [A, B]);
      `,
    },
    {
      name: 'the schema class is not a member',
      code: dedent`
        import * as core from 'zod/v4/core';
        core._enum(core.$ZodEnum, ['$ZodEnum']);
        core._literal(core.$ZodLiteral, 'a');
      `,
    },
    {
      name: 'spread in the member list',
      code: dedent`
        import * as core from 'zod/v4/core';
        core._union(core.$ZodUnion, [A, ...rest, A]);
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import * as core from 'other';
        core._union(core.$ZodUnion, [A, A]);
        core._enum(core.$ZodEnum, ['a', 'a']);
      `,
    },
  ],
  invalid: [
    {
      name: 'repeated enum value',
      code: dedent`
        import * as core from 'zod/v4/core';
        core._enum(core.$ZodEnum, ['a', 'b', 'a']);
      `,
      output: dedent`
        import * as core from 'zod/v4/core';
        core._enum(core.$ZodEnum, ['a', 'b']);
      `,
      errors: [{ messageId: 'duplicateMember', data: { line: 2 }, column: 38 }],
    },
    {
      name: 'comment in the removed range withholds the fix',
      code: dedent`
        import * as core from 'zod/v4/core';
        core._enum(core.$ZodEnum, ['a', /* again */ 'a']);
      `,
      output: null,
      errors: [{ messageId: 'duplicateMember', data: { line: 2 } }],
    },
    {
      name: 'repeated literal value',
      code: dedent`
        import * as core from 'zod/v4/core';
        core._literal(core.$ZodLiteral, ['a', 'a']);
      `,
      errors: [
        {
          messageId: 'duplicateMember',
          data: { line: 2 },
          suggestions: [
            {
              messageId: 'removeDuplicate',
              output: dedent`
                import * as core from 'zod/v4/core';
                core._literal(core.$ZodLiteral, ['a']);
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'repeated union member',
      code: dedent`
        import * as core from 'zod/v4/core';
        core._union(core.$ZodUnion, [
          core._string(core.$ZodString),
          core._string(core.$ZodString),
        ]);
      `,
      errors: [
        {
          messageId: 'duplicateMember',
          data: { line: 3 },
          line: 4,
          suggestions: [
            {
              messageId: 'removeDuplicate',
              output: dedent`
                import * as core from 'zod/v4/core';
                core._union(core.$ZodUnion, [
                  core._string(core.$ZodString),
                ]);
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'repeated discriminated union member',
      code: dedent`
        import * as core from 'zod/v4/core';
        core._discriminatedUnion(core.$ZodDiscriminatedUnion, 'kind', [A, B, A]);
      `,
      errors: [
        {
          messageId: 'duplicateDiscriminatedUnionMember',
          data: { line: 2 },
          column: 70,
          suggestions: [
            {
              messageId: 'removeDuplicate',
              output: dedent`
                import * as core from 'zod/v4/core';
                core._discriminatedUnion(core.$ZodDiscriminatedUnion, 'kind', [A, B]);
              `,
            },
          ],
        },
      ],
    },
  ],
});
