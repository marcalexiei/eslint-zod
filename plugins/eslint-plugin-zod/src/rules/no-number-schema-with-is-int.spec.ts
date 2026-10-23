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
        void name.isInt;
        void count.isInt;
        void amount.isInt;
      `,
    },
  ],
  invalid: [
    {
      name: 'number schema bound to a const',
      code: dedent`
        import * as z from 'zod';
        const amount = z.number();
        const positive = amount.min(0);
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
  ],
});
