import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noNumberSchemaWithIsFinite } from './no-number-schema-with-is-finite.js';

const ruleTester = new RuleTester();

ruleTester.run(noNumberSchemaWithIsFinite.name, noNumberSchemaWithIsFinite, {
  valid: [
    {
      name: 'z.number() without isFinite',
      code: dedent`
        import * as z from 'zod';
        const n = z.number();
      `,
    },
    {
      name: 'number() without isFinite — named import',
      code: dedent`
        import { number } from 'zod';
        const n = number();
      `,
    },
    {
      name: 'z.number() without isFinite — named z import',
      code: dedent`
        import { z } from 'zod';
        const n = z.number();
      `,
    },
    {
      name: 'computed access with an `isFinite` variable is not the deprecated property',
      code: dedent`
        import * as z from 'zod';
        declare const isFinite: string;
        void z.number()[isFinite];
      `,
    },
    {
      name: 'private field named `isFinite`',
      code: dedent`
        class Counter {
          #isFinite = true;
          read() {
            return this.#isFinite;
          }
        }
      `,
    },
    {
      name: '`isFinite` on a plain object',
      code: dedent`
        import * as z from 'zod';
        const o = { isFinite: true };
        void o.isFinite;
      `,
    },
    {
      name: 'isFinite on a schema that is not a number, or not provably one',
      code: dedent`
        import * as z from 'zod';
        import { amount } from './schemas.js';
        const name = z.string();
        let count = z.number();
        count = z.number().int();
        void name.isFinite;
        void count.isFinite;
        void amount.isFinite;
      `,
    },
  ],
  invalid: [
    {
      name: 'number schema bound to a const or a let that is never reassigned',
      code: dedent`
        import * as z from 'zod';
        const amount = z.number();
        let positive = amount.min(0);
        void amount.isFinite;
        void positive.isFinite;
      `,
      errors: [
        { messageId: 'deprecated', line: 4 },
        { messageId: 'deprecated', line: 5 },
      ],
    },
    {
      name: 'z.number().isFinite',
      code: dedent`
        import * as z from 'zod';
        void z.number().isFinite;
      `,
      errors: [{ messageId: 'deprecated' }],
    },
    {
      name: 'z.number().min(0).isFinite',
      code: dedent`
        import * as z from 'zod';
        void z.number().min(0).isFinite;
      `,
      errors: [{ messageId: 'deprecated' }],
    },
    {
      name: 'number().isFinite — named import',
      code: dedent`
        import { number } from 'zod';
        void number().isFinite;
      `,
      errors: [{ messageId: 'deprecated' }],
    },
    {
      name: 'z.number().isFinite — named z import',
      code: dedent`
        import { z } from 'zod';
        void z.number().isFinite;
      `,
      errors: [{ messageId: 'deprecated' }],
    },
    {
      name: 'z.float64().isFinite — every number factory has it',
      code: dedent`
        import * as z from 'zod';
        void z.float64().isFinite;
      `,
      errors: [{ messageId: 'deprecated' }],
      output: null,
    },
    {
      name: 'isFinite on a local z.int() schema',
      code: dedent`
        import * as z from 'zod';
        const n = z.int();
        void n.isFinite;
      `,
      errors: [{ messageId: 'deprecated', line: 3 }],
      output: null,
    },
  ],
});
