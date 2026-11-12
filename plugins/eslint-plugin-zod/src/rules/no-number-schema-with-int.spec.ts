import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noNumberSchemaWithInt } from './no-number-schema-with-int.js';

const ruleTester = new RuleTester();

ruleTester.run(noNumberSchemaWithInt.name, noNumberSchemaWithInt, {
  valid: [
    {
      name: 'namespace import',
      code: dedent`
        import * as z from 'zod';
        z.int();
      `,
    },
    {
      name: 'named import',
      code: dedent`
        import { int } from 'zod';
        int();
      `,
    },
    {
      name: 'named z import',
      code: dedent`
        import { z } from 'zod';
        z.int();
      `,
    },
    {
      name: 'standard + chain method',
      code: dedent`
        import * as z from 'zod';
        z.int().min(5);
      `,
    },
    {
      name: 'number without .int()',
      code: dedent`
        import * as z from 'zod';
        z.number().optional();
      `,
    },
    {
      name: 'unrelated to zod',
      code: 'something.number().int().min(5)',
    },
    {
      name: 'nested valid usage',
      code: dedent`
        import * as z from 'zod';
        z.object({ age: z.int(), count: z.number() });
      `,
    },
    {
      name: 'z.int32() and z.float32() without .int()',
      code: dedent`
        import * as z from 'zod';
        z.int32();
        z.float32().min(0);
      `,
    },
  ],
  invalid: [
    {
      name: 'number + int (namespace import)',
      code: dedent`
        import * as z from 'zod';
        z.number().int();
      `,
      errors: [{ messageId: 'removeNumber' }],
      output: dedent`
        import * as z from 'zod';
        z.int();
      `,
    },
    {
      name: 'number + int with parameter (namespace import)',
      code: dedent`
        import * as z from 'zod';
        z.number().int('invalid int');
      `,
      errors: [{ messageId: 'removeNumber' }],
      output: dedent`
        import * as z from 'zod';
        z.int('invalid int');
      `,
    },
    {
      name: 'number + int (named import)',
      code: dedent`
        import { number } from 'zod';
        number().int();
      `,
      errors: [{ messageId: 'removeNumber' }],
      output: null,
    },
    {
      name: 'number + int (named z import)',
      code: dedent`
        import { z } from 'zod';
        z.number().int();
      `,
      errors: [{ messageId: 'removeNumber' }],
      output: dedent`
        import { z } from 'zod';
        z.int();
      `,
    },
    {
      name: 'number + int + other method',
      code: dedent`
        import * as z from 'zod';
        z.number().int().min(1);
      `,
      errors: [{ messageId: 'removeNumber' }],
      output: dedent`
        import * as z from 'zod';
        z.int().min(1);
      `,
    },
    {
      name: 'number + other method + int',
      code: dedent`
        import * as z from 'zod';
        z.number().min(1).int();
      `,
      errors: [{ messageId: 'removeNumber' }],
      output: dedent`
        import * as z from 'zod';
        z.int().min(1);
      `,
    },
    {
      name: 'nested in object',
      code: dedent`
        import * as z from 'zod';
        z.object({ age: z.number().int() });
      `,
      errors: [{ messageId: 'removeNumber' }],
      output: dedent`
        import * as z from 'zod';
        z.object({ age: z.int() });
      `,
    },
    {
      name: 'computed factory — reported but not fixed, the chain walker cannot name it',
      code: dedent`
        import * as z from 'zod';
        z['number']().int();
      `,
      errors: [{ messageId: 'removeNumber' }],
      output: null,
    },
    {
      name: 'factory called with params — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.number({ error: 'e' }).int();
      `,
      errors: [{ messageId: 'removeNumber' }],
      output: null,
    },
    {
      name: 'z.float32().int() — the safe-integer check makes it z.int()',
      code: dedent`
        import * as z from 'zod';
        z.float32().int();
      `,
      errors: [{ messageId: 'removeNumber', data: { factory: 'float32' } }],
      output: dedent`
        import * as z from 'zod';
        z.int();
      `,
    },
    {
      name: 'z.float64().min(0).int()',
      code: dedent`
        import * as z from 'zod';
        z.float64().min(0).int();
      `,
      errors: [{ messageId: 'removeNumber', data: { factory: 'float64' } }],
      output: dedent`
        import * as z from 'zod';
        z.int().min(0);
      `,
    },
    {
      name: 'z.float32() with params — the rewrite would drop them',
      code: dedent`
        import * as z from 'zod';
        z.float32({ error: 'nope' }).int();
      `,
      errors: [{ messageId: 'removeNumber' }],
      output: null,
    },
    {
      name: 'z.int32().int() — already an integer, so the call is removed',
      code: dedent`
        import * as z from 'zod';
        z.int32().int();
      `,
      errors: [{ messageId: 'redundantInt', data: { factory: 'int32' } }],
      output: dedent`
        import * as z from 'zod';
        z.int32();
      `,
    },
    {
      name: 'z.uint32().min(1).int().max(9)',
      code: dedent`
        import * as z from 'zod';
        z.uint32().min(1).int().max(9);
      `,
      errors: [{ messageId: 'redundantInt' }],
      output: dedent`
        import * as z from 'zod';
        z.uint32().min(1).max(9);
      `,
    },
    {
      name: 'z.int().int()',
      code: dedent`
        import * as z from 'zod';
        z.int().int();
      `,
      errors: [{ messageId: 'redundantInt', data: { factory: 'int' } }],
      output: dedent`
        import * as z from 'zod';
        z.int();
      `,
    },
    {
      name: 'int32().int() — named import, removal needs no namespace',
      code: dedent`
        import { int32 } from 'zod';
        int32().int();
      `,
      errors: [{ messageId: 'redundantInt' }],
      output: dedent`
        import { int32 } from 'zod';
        int32();
      `,
    },
    {
      name: 'z.int32().int() with a comment in the removed text — no fix',
      code: dedent`
        import * as z from 'zod';
        z.int32()./* why */int();
      `,
      errors: [{ messageId: 'redundantInt' }],
      output: null,
    },
  ],
});
