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
  ],
});
