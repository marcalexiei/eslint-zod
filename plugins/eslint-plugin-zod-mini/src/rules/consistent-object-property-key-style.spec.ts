import { RuleTester } from '@typescript-eslint/rule-tester';
import type { InvalidTestCase } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { consistentObjectPropertyKeyStyle } from './consistent-object-property-key-style.js';

type Case = InvalidTestCase<
  'invalidStyle' | 'renameKey',
  typeof consistentObjectPropertyKeyStyle.defaultOptions
>;
type Style = NonNullable<Case['options']>[0]['style'];

/** A case reporting `name`, whose suggestion renames it to `replacement`; no suggestion without `output`. */
function rename(
  { name, replacement, style = 'camelCase' }: { name: string; replacement: string; style?: Style },
  code: string,
  output?: string,
): Case {
  return {
    name: `${name} → ${replacement}${output === undefined ? ' (no suggestion)' : ''}`,
    code,
    output: null,
    options: [{ style }],
    errors: [
      {
        messageId: 'invalidStyle',
        data: { name, style },
        suggestions:
          output === undefined ? [] : [{ messageId: 'renameKey', data: { replacement }, output }],
      },
    ],
  };
}

const ruleTester = new RuleTester();

ruleTester.run(consistentObjectPropertyKeyStyle.name, consistentObjectPropertyKeyStyle, {
  valid: [
    {
      name: 'camelCase keys, by default',
      code: dedent`
        import * as z from 'zod/mini';
        z.object({ userName: z.string() });
      `,
    },
    {
      name: 'snake_case keys',
      options: [{ style: 'snake_case' }],
      code: dedent`
        import * as z from 'zod/mini';
        z.object({ user_name: z.string() });
      `,
    },
    {
      name: 'one-word keys fit both styles',
      options: [{ style: 'snake_case' }],
      code: dedent`
        import * as z from 'zod/mini';
        z.object({ id: z.string(), name: z.string() });
      `,
    },
    {
      name: 'keys in neither style',
      code: dedent`
        import * as z from 'zod/mini';
        z.object({ _id: z.string(), 'Content-Type': z.string(), userID: z.string(), 0: z.string() });
      `,
    },
    {
      name: 'a PascalCase key in snake_case mode',
      options: [{ style: 'snake_case' }],
      code: dedent`
        import * as z from 'zod/mini';
        z.object({ UserName: z.string() });
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { object } from 'other';
        object({ user_name: 123 });
      `,
    },
    {
      name: "another plugin's import source",
      code: dedent`
        import * as z from 'zod';
        z.object({ user_name: z.string() });
      `,
    },
    {
      name: 'zod/v4-mini import',
      code: dedent`
        import * as z from 'zod/v4-mini';
        z.object({ userName: z.string() });
      `,
    },
    {
      name: 'a spread element',
      code: dedent`
        import * as z from 'zod/mini';
        const other = { user_name: z.string() };
        z.object({ ...other, userName: z.string() });
      `,
    },
    {
      name: 'a shape that is not an object literal',
      code: dedent`
        import * as z from 'zod/mini';
        let shape = { user_name: z.string() };
        shape = {};
        z.object(shape);
        z.object(makeShape());
      `,
    },
    {
      name: 'a method left out of allow',
      options: [{ allow: ['object'] }],
      code: dedent`
        import * as z from 'zod/mini';
        z.looseObject({ user_name: z.string() });
        z.strictObject({ user_name: z.string() });
      `,
    },
  ],
  invalid: [
    rename(
      { name: 'user_name', replacement: 'userName' },
      dedent`
        import * as z from 'zod/mini';
        z.object({ user_name: z.string() });
      `,
      dedent`
        import * as z from 'zod/mini';
        z.object({ userName: z.string() });
      `,
    ),
    rename(
      { name: 'userName', replacement: 'user_name', style: 'snake_case' },
      dedent`
        import * as z from 'zod/mini';
        z.strictObject({ userName: z.string() });
      `,
      dedent`
        import * as z from 'zod/mini';
        z.strictObject({ user_name: z.string() });
      `,
    ),
    rename(
      { name: 'is_active', replacement: 'isActive' },
      dedent`
        import * as z from 'zod/mini';
        z.optional(z.looseObject({ is_active: z.boolean() }));
      `,
      dedent`
        import * as z from 'zod/mini';
        z.optional(z.looseObject({ isActive: z.boolean() }));
      `,
    ),
    rename(
      { name: 'user_name', replacement: 'userName' },
      dedent`
        import { object, optional, string } from 'zod/mini';
        optional(object({ user_name: string() }));
      `,
      dedent`
        import { object, optional, string } from 'zod/mini';
        optional(object({ userName: string() }));
      `,
    ),
    rename(
      { name: 'user_name', replacement: 'userName' },
      dedent`
        import * as z from 'zod/mini';
        z.array(z.object({ user_name: z.string() }));
      `,
      dedent`
        import * as z from 'zod/mini';
        z.array(z.object({ userName: z.string() }));
      `,
    ),
    {
      ...rename(
        { name: 'user_name', replacement: 'userName' },
        dedent`
          import * as z from 'zod/mini';
          const shape = { user_name: z.string() };
          z.object(shape);
          z.strictObject(shape);
        `,
        dedent`
          import * as z from 'zod/mini';
          const shape = { userName: z.string() };
          z.object(shape);
          z.strictObject(shape);
        `,
      ),
      name: 'a shape shared by two schemas, reported once',
    },
    {
      ...rename(
        { name: 'user_name', replacement: 'userName' },
        dedent`
          import * as z from 'zod/mini';
          const shape = { user_name: z.string() } as const;
          z.object(shape as typeof shape);
        `,
        dedent`
          import * as z from 'zod/mini';
          const shape = { userName: z.string() } as const;
          z.object(shape as typeof shape);
        `,
      ),
      name: 'a shape behind type assertions',
    },
    rename(
      { name: 'user_name', replacement: 'userName' },
      dedent`
        import * as z from 'zod/mini';
        z.object({ "user_name": z.string() });
      `,
      dedent`
        import * as z from 'zod/mini';
        z.object({ "userName": z.string() });
      `,
    ),
    rename(
      { name: 'first_name', replacement: 'firstName' },
      dedent`
        import * as z from 'zod/mini';
        z.object({ ['first_name']: z.string() });
      `,
      dedent`
        import * as z from 'zod/mini';
        z.object({ ['firstName']: z.string() });
      `,
    ),
    rename(
      { name: 'user_name', replacement: 'userName' },
      dedent`
        import * as z from 'zod/mini';
        const user_name = z.string();
        z.object({ user_name });
      `,
      dedent`
        import * as z from 'zod/mini';
        const user_name = z.string();
        z.object({ userName: user_name });
      `,
    ),
    rename(
      { name: 'user_name', replacement: 'userName' },
      dedent`
        import * as z from 'zod/mini';
        z.object({ user_name: z.string(), userName: z.string() });
      `,
    ),
  ],
});
