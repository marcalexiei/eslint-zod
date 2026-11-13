import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noNumberSchemaWithIsInt } from './no-number-schema-with-is-int.js';

const ruleTester = new RuleTester();

ruleTester.run(noNumberSchemaWithIsInt.name, noNumberSchemaWithIsInt, {
  valid: [
    {
      name: 'z.number() without isInt',
      code: dedent`
        import * as z from 'zod';
        const n = z.number();
      `,
    },
    {
      name: 'isInt on non-zod',
      code: 'const o = { isInt: true }; o.isInt',
    },
    {
      name: 'number() without isInt — named import',
      code: dedent`
        import { number } from 'zod';
        const n = number();
      `,
    },
    {
      name: 'z.number() without isInt — named z import',
      code: dedent`
        import { z } from 'zod';
        const n = z.number();
      `,
    },
    {
      name: 'computed access with an `isInt` variable is not the deprecated property',
      code: dedent`
        import * as z from 'zod';
        declare const isInt: string;
        void z.number()[isInt];
      `,
    },
    {
      name: 'private field named `isInt`',
      code: dedent`
        class Counter {
          #isInt = true;
          read() {
            return this.#isInt;
          }
        }
      `,
    },
    {
      name: 'isInt on a schema that is not a number, or not provably one',
      code: dedent`
        import * as z from 'zod';
        import { amount } from './schemas.js';
        const name = z.string();
        let count = z.number();
        count = z.number().int();
        void name.isInt;
        void count.isInt;
        void amount.isInt;
      `,
    },
    {
      name: 'isInt on z.coerce.string() — not a number schema',
      code: dedent`
        import * as z from 'zod';
        void z.coerce.string().isInt;
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
        void amount.isInt;
        void positive.isInt;
      `,
      errors: [
        { messageId: 'useFormat', line: 4 },
        { messageId: 'useFormat', line: 5 },
      ],
    },
    {
      name: 'z.number().isInt',
      code: dedent`
        import * as z from 'zod';
        const _x = z.number().isInt;
      `,
      errors: [{ messageId: 'useFormat' }],
    },
    {
      name: 'z.number().min(0).isInt',
      code: dedent`
        import * as z from 'zod';
        void z.number().min(0).isInt;
      `,
      errors: [{ messageId: 'useFormat' }],
    },
    {
      name: 'number().isInt — named import',
      code: dedent`
        import { number } from 'zod';
        void number().isInt;
      `,
      errors: [{ messageId: 'useFormat' }],
    },
    {
      name: 'z.number().isInt — named z import',
      code: dedent`
        import { z } from 'zod';
        void z.number().isInt;
      `,
      errors: [{ messageId: 'useFormat' }],
    },
    {
      name: 'z.int().isInt — every number factory has it',
      code: dedent`
        import * as z from 'zod';
        void z.int().isInt;
      `,
      errors: [{ messageId: 'useFormat' }],
      output: null,
    },
    {
      name: 'isInt on a local z.int32() schema',
      code: dedent`
        import * as z from 'zod';
        const n = z.int32();
        void n.isInt;
      `,
      errors: [{ messageId: 'useFormat', line: 3 }],
      output: null,
    },
    {
      name: 'z.coerce.number().isInt',
      code: dedent`
        import * as z from 'zod';
        void z.coerce.number().isInt;
      `,
      errors: [{ messageId: 'useFormat' }],
      output: null,
    },
  ],
});
