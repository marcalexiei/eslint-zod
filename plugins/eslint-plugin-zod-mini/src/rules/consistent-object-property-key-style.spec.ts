import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { consistentObjectPropertyKeyStyle } from './consistent-object-property-key-style.js';

const ruleTester = new RuleTester();

ruleTester.run(consistentObjectPropertyKeyStyle.name, consistentObjectPropertyKeyStyle, {
  valid: [
    {
      name: 'valid camelCase',
      options: [{ style: 'camelCase' }],
      code: dedent`
        import { z } from 'zod/mini';
        z.object({ userName: z.string() });
      `,
    },
    {
      name: 'valid snake_case',
      options: [{ style: 'snake_case' }],
      code: dedent`
        import { z } from 'zod/mini';
        z.object({ user_name: z.string() });
      `,
    },
    {
      name: 'valid looseObject camelCase',
      options: [{ style: 'camelCase' }],
      code: dedent`
        import { z } from 'zod/mini';
        z.looseObject({ userName: z.string() });
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
      name: 'not triggered on zod import',
      code: dedent`
        import * as z from 'zod';
        z.object({ user_name: '123' });
      `,
    },
    {
      name: 'zod/v4-mini import',
      options: [{ style: 'camelCase' }],
      code: dedent`
        import * as z from 'zod/v4-mini';
        z.object({ userName: z.string() });
      `,
    },
    {
      name: 'spread element ignored',
      options: [{ style: 'camelCase' }],
      code: dedent`
        import { z } from 'zod/mini';
        const other = { foo: z.string() };
        z.object({ ...other, userName: z.string() });
      `,
    },
    {
      name: 'valid in z.array(z.object(...))',
      options: [{ style: 'camelCase' }],
      code: dedent`
        import { z } from 'zod/mini';
        z.array(z.object({ userName: z.string() }));
      `,
    },
    {
      name: 'valid in z.optional(z.object(...))',
      options: [{ style: 'camelCase' }],
      code: dedent`
        import { z } from 'zod/mini';
        z.optional(z.object({ userName: z.string() }));
      `,
    },
    {
      name: 'ignored looseObject when allow is [object]',
      options: [{ style: 'camelCase', allow: ['object'] }],
      code: dedent`
        import { z } from 'zod/mini';
        z.looseObject({ user_name: z.string() });
      `,
    },
    {
      name: 'ignored strictObject when allow is [object]',
      options: [{ style: 'camelCase', allow: ['object'] }],
      code: dedent`
        import { z } from 'zod/mini';
        z.strictObject({ user_name: z.string() });
      `,
    },
  ],
  invalid: [
    {
      name: 'invalid camelCase (snake found)',
      options: [{ style: 'camelCase' }],
      code: dedent`
        import { z } from 'zod/mini';
        z.object({ user_name: z.string() });
      `,
      errors: [
        {
          messageId: 'invalidStyle',
          data: { name: 'user_name', style: 'camelCase' },
        },
      ],
      output: dedent`
        import { z } from 'zod/mini';
        z.object({ userName: z.string() });
      `,
    },
    {
      name: 'invalid snake_case (camel found)',
      options: [{ style: 'snake_case' }],
      code: dedent`
        import { z } from 'zod/mini';
        z.object({ userName: z.string() });
      `,
      errors: [
        {
          messageId: 'invalidStyle',
          data: { name: 'userName', style: 'snake_case' },
        },
      ],
      output: dedent`
        import { z } from 'zod/mini';
        z.object({ user_name: z.string() });
      `,
    },
    {
      name: 'chained schema',
      options: [{ style: 'camelCase' }],
      code: dedent`
        import { z } from 'zod/mini';
        z.object({ user_name: z.string() }).brand('User');
      `,
      errors: [
        {
          messageId: 'invalidStyle',
          data: { name: 'user_name', style: 'camelCase' },
        },
      ],
      output: dedent`
        import { z } from 'zod/mini';
        z.object({ userName: z.string() }).brand('User');
      `,
    },
    {
      name: 'local variable',
      options: [{ style: 'camelCase' }],
      code: dedent`
        import { z } from 'zod/mini';
        const schema = { user_name: z.string() };
        z.object(schema);
      `,
      errors: [
        {
          messageId: 'invalidStyle',
          data: { name: 'user_name', style: 'camelCase' },
        },
      ],
      output: dedent`
        import { z } from 'zod/mini';
        const schema = { userName: z.string() };
        z.object(schema);
      `,
    },
    {
      name: 'string literal key fix',
      options: [{ style: 'snake_case' }],
      code: dedent`
        import { z } from 'zod/mini';
        z.object({ 'userName': z.string() });
      `,
      errors: [
        {
          messageId: 'invalidStyle',
          data: { name: 'userName', style: 'snake_case' },
        },
      ],
      output: dedent`
        import { z } from 'zod/mini';
        z.object({ 'user_name': z.string() });
      `,
    },
    {
      name: 'invalid in z.array(z.object(...))',
      options: [{ style: 'camelCase' }],
      code: dedent`
        import { z } from 'zod/mini';
        z.array(z.object({ user_name: z.string() }));
      `,
      errors: [
        {
          messageId: 'invalidStyle',
          data: { name: 'user_name', style: 'camelCase' },
        },
      ],
      output: dedent`
        import { z } from 'zod/mini';
        z.array(z.object({ userName: z.string() }));
      `,
    },
    {
      name: 'invalid in z.optional(z.object(...))',
      options: [{ style: 'camelCase' }],
      code: dedent`
        import { z } from 'zod/mini';
        z.optional(z.object({ user_name: z.string() }));
      `,
      errors: [
        {
          messageId: 'invalidStyle',
          data: { name: 'user_name', style: 'camelCase' },
        },
      ],
      output: dedent`
        import { z } from 'zod/mini';
        z.optional(z.object({ userName: z.string() }));
      `,
    },
    {
      name: 'enforces style on allowed strictObject',
      options: [{ style: 'camelCase', allow: ['strictObject'] }],
      code: dedent`
        import { z } from 'zod/mini';
        z.strictObject({ user_name: z.string() });
      `,
      errors: [
        {
          messageId: 'invalidStyle',
          data: { name: 'user_name', style: 'camelCase' },
        },
      ],
      output: dedent`
        import { z } from 'zod/mini';
        z.strictObject({ userName: z.string() });
      `,
    },
    {
      name: 'reports shared variable only once across multiple calls',
      options: [{ style: 'camelCase' }],
      code: dedent`
        import { z } from 'zod/mini';
        const schema = { user_name: z.string() };
        z.object(schema);
        z.object(schema);
      `,
      errors: [
        {
          messageId: 'invalidStyle',
          data: { name: 'user_name', style: 'camelCase' },
        },
      ],
      output: dedent`
        import { z } from 'zod/mini';
        const schema = { userName: z.string() };
        z.object(schema);
        z.object(schema);
      `,
    },
  ],
});
