import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noNumberSchemaWithStep } from './no-number-schema-with-step.js';

const ruleTester = new RuleTester();

ruleTester.run(noNumberSchemaWithStep.name, noNumberSchemaWithStep, {
  valid: [
    {
      name: 'z.number() with multipleOf',
      code: dedent`
        import * as z from 'zod';
        z.number().multipleOf(2);
      `,
    },
    {
      name: 'number() with multipleOf — named import',
      code: dedent`
        import { number } from 'zod';
        number().multipleOf(2);
      `,
    },
    {
      name: 'z.number() with multipleOf — named z import',
      code: dedent`
        import { z } from 'zod';
        z.number().multipleOf(2);
      `,
    },
    {
      name: 'number factory aliased to `step` — the call is the schema, not a `.step()` method',
      code: dedent`
        import { number as step } from 'zod';
        step();
      `,
    },
    {
      name: 'number factory aliased to `step`, with a trailing method',
      code: dedent`
        import { number as step } from 'zod';
        step().min(0);
      `,
    },
  ],
  invalid: [
    {
      name: 'z.number().step(2)',
      code: dedent`
        import * as z from 'zod';
        z.number().step(2);
      `,
      errors: [{ messageId: 'useMultipleOf' }],
      output: dedent`
        import * as z from 'zod';
        z.number().multipleOf(2);
      `,
    },
    {
      name: 'z.number().min(0).step(0.1, "err")',
      code: dedent`
        import * as z from 'zod';
        z.number().min(0).step(0.1, 'err');
      `,
      errors: [{ messageId: 'useMultipleOf' }],
      output: dedent`
        import * as z from 'zod';
        z.number().min(0).multipleOf(0.1, 'err');
      `,
    },
    {
      name: 'z.number().step(0.1).min(0) — renames `step`, not the outermost call',
      code: dedent`
        import * as z from 'zod';
        z.number().step(0.1).min(0);
      `,
      errors: [{ messageId: 'useMultipleOf' }],
      output: dedent`
        import * as z from 'zod';
        z.number().multipleOf(0.1).min(0);
      `,
    },
    {
      name: 'number().step(1) named import',
      code: dedent`
        import { number } from 'zod';
        number().step(1);
      `,
      errors: [{ messageId: 'useMultipleOf' }],
      output: dedent`
        import { number } from 'zod';
        number().multipleOf(1);
      `,
    },
    {
      name: 'z.number().step(2) — named z import',
      code: dedent`
        import { z } from 'zod';
        z.number().step(2);
      `,
      errors: [{ messageId: 'useMultipleOf' }],
      output: dedent`
        import { z } from 'zod';
        z.number().multipleOf(2);
      `,
    },
    {
      name: 'computed factory — reported but not fixed, the chain walker cannot name it',
      code: dedent`
        import * as z from 'zod';
        z['number']().step(2);
      `,
      errors: [{ messageId: 'useMultipleOf' }],
      output: null,
    },
    {
      name: 'number factory aliased to `step`, chaining a real `.step()`',
      code: dedent`
        import { number as step } from 'zod';
        step().step(5);
      `,
      errors: [{ messageId: 'useMultipleOf' }],
      output: dedent`
        import { number as step } from 'zod';
        step().multipleOf(5);
      `,
    },
    {
      name: 'z.int().step(2) — every number factory chains it',
      code: dedent`
        import * as z from 'zod';
        z.int().step(2);
      `,
      errors: [{ messageId: 'useMultipleOf' }],
      output: dedent`
        import * as z from 'zod';
        z.int().multipleOf(2);
      `,
    },
    {
      name: 'z.uint32().step(5)',
      code: dedent`
        import * as z from 'zod';
        z.uint32().step(5);
      `,
      errors: [{ messageId: 'useMultipleOf' }],
      output: dedent`
        import * as z from 'zod';
        z.uint32().multipleOf(5);
      `,
    },
  ],
});
