import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noNumberSchemaWithFinite } from './no-number-schema-with-finite.js';

const ruleTester = new RuleTester();

ruleTester.run(noNumberSchemaWithFinite.name, noNumberSchemaWithFinite, {
  valid: [
    {
      name: 'number without .finite()',
      code: dedent`
        import * as z from 'zod';
        z.number();
      `,
    },
    {
      name: 'unrelated to zod',
      code: 'n.finite()',
    },
    {
      name: 'number factory aliased to `finite`, with a trailing method',
      code: dedent`
        import { number as finite } from 'zod';
        finite().min(0);
      `,
    },
  ],
  invalid: [
    {
      name: 'z.number().finite()',
      code: dedent`
        import * as z from 'zod';
        z.number().finite();
      `,
      errors: [{ messageId: 'removeFinite' }],
      output: dedent`
        import * as z from 'zod';
        z.number();
      `,
    },
    {
      name: 'z.number().min(0).finite()',
      code: dedent`
        import * as z from 'zod';
        z.number().min(0).finite();
      `,
      errors: [{ messageId: 'removeFinite' }],
      output: dedent`
        import * as z from 'zod';
        z.number().min(0);
      `,
    },
    {
      name: 'z.number().finite().min(0) — reported even when not the last call',
      code: dedent`
        import * as z from 'zod';
        z.number().finite().min(0);
      `,
      errors: [{ messageId: 'removeFinite' }],
      output: dedent`
        import * as z from 'zod';
        z.number().min(0);
      `,
    },
    {
      name: 'named import number().finite() — can fix',
      code: dedent`
        import { number } from 'zod';
        number().finite();
      `,
      errors: [{ messageId: 'removeFinite' }],
      output: dedent`
        import { number } from 'zod';
        number();
      `,
    },
    {
      name: 'computed factory — reported but not fixed, the chain walker cannot name it',
      code: dedent`
        import * as z from 'zod';
        z['number']().finite();
      `,
      errors: [{ messageId: 'removeFinite' }],
      output: null,
    },
    {
      name: 'parenthesized receiver — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        (z.number()).finite();
      `,
      errors: [{ messageId: 'removeFinite' }],
      output: null,
    },
    {
      name: 'comment in the rewritten text — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.number()
          // keep
          .finite();
      `,
      errors: [{ messageId: 'removeFinite' }],
      output: null,
    },
    {
      name: 'chain that ends in a property access',
      code: dedent`
        import * as z from 'zod';
        z.number().finite().safeParse(1).success;
      `,
      errors: [{ messageId: 'removeFinite' }],
      output: dedent`
        import * as z from 'zod';
        z.number().safeParse(1).success;
      `,
    },
    {
      name: 'z.int().finite() — every number factory chains it',
      code: dedent`
        import * as z from 'zod';
        z.int().finite();
      `,
      errors: [{ messageId: 'removeFinite' }],
      output: dedent`
        import * as z from 'zod';
        z.int();
      `,
    },
    {
      name: 'z.float32().min(0).finite()',
      code: dedent`
        import * as z from 'zod';
        z.float32().min(0).finite();
      `,
      errors: [{ messageId: 'removeFinite' }],
      output: dedent`
        import * as z from 'zod';
        z.float32().min(0);
      `,
    },
    {
      name: 'int32().finite() — named import',
      code: dedent`
        import { int32 } from 'zod';
        int32().finite();
      `,
      errors: [{ messageId: 'removeFinite' }],
      output: dedent`
        import { int32 } from 'zod';
        int32();
      `,
    },
  ],
});
