import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noNumberSchemaWithSafe } from './no-number-schema-with-safe.js';

const ruleTester = new RuleTester();

ruleTester.run(noNumberSchemaWithSafe.name, noNumberSchemaWithSafe, {
  valid: [
    {
      name: 'z.int()',
      code: dedent`
        import * as z from 'zod';
        z.int();
      `,
    },
    {
      name: 'int() — named import',
      code: dedent`
        import { int } from 'zod';
        int();
      `,
    },
    {
      name: 'z.int() — named z import',
      code: dedent`
        import { z } from 'zod';
        z.int();
      `,
    },
    {
      name: 'number schema without `.safe()`',
      code: dedent`
        import * as z from 'zod';
        z.number().min(0);
      `,
    },
    {
      name: 'named import aliased to `safe` — the factory is not a `.safe()` call',
      code: dedent`
        import { number as safe } from 'zod';
        safe().min(0);
      `,
    },
    {
      name: 'z.float32() without .safe()',
      code: dedent`
        import * as z from 'zod';
        z.float32().min(0);
      `,
    },
  ],
  invalid: [
    {
      name: 'z.number().safe()',
      code: dedent`
        import * as z from 'zod';
        z.number().safe();
      `,
      errors: [{ messageId: 'useInt' }],
      output: dedent`
        import * as z from 'zod';
        z.int();
      `,
    },
    {
      name: 'z.number().safe with message',
      code: dedent`
        import * as z from 'zod';
        z.number().safe('nope');
      `,
      errors: [{ messageId: 'useInt' }],
      output: dedent`
        import * as z from 'zod';
        z.int('nope');
      `,
    },
    {
      name: 'z.number().safe().min(0) — reported even when not the last call',
      code: dedent`
        import * as z from 'zod';
        z.number().safe().min(0);
      `,
      errors: [{ messageId: 'useInt' }],
      output: dedent`
        import * as z from 'zod';
        z.int().min(0);
      `,
    },
    {
      name: 'named import number().safe() — no fix',
      code: dedent`
        import { number } from 'zod';
        number().safe();
      `,
      errors: [{ messageId: 'useInt' }],
      output: null,
    },
    {
      name: 'z.number().safe() — named z import',
      code: dedent`
        import { z } from 'zod';
        z.number().safe();
      `,
      errors: [{ messageId: 'useInt' }],
      output: dedent`
        import { z } from 'zod';
        z.int();
      `,
    },
    {
      name: 'computed factory — reported but not fixed, the chain walker cannot name it',
      code: dedent`
        import * as z from 'zod';
        z['number']().safe();
      `,
      errors: [{ messageId: 'useInt' }],
      output: null,
    },
    {
      name: 'z.float64().safe() — the safe-integer check makes it z.int()',
      code: dedent`
        import * as z from 'zod';
        z.float64().safe();
      `,
      errors: [{ messageId: 'useInt', data: { factory: 'float64' } }],
      output: dedent`
        import * as z from 'zod';
        z.int();
      `,
    },
    {
      name: 'z.int().safe() — already a safe integer, so the call is removed',
      code: dedent`
        import * as z from 'zod';
        z.int().safe();
      `,
      errors: [{ messageId: 'removeSafe', data: { factory: 'int' } }],
      output: dedent`
        import * as z from 'zod';
        z.int();
      `,
    },
    {
      name: 'z.int32().safe() with a message',
      code: dedent`
        import * as z from 'zod';
        z.int32().safe('nope');
      `,
      errors: [{ messageId: 'removeSafe', data: { factory: 'int32' } }],
      output: dedent`
        import * as z from 'zod';
        z.int32();
      `,
    },
    {
      name: 'uint32().safe() — named import',
      code: dedent`
        import { uint32 } from 'zod';
        uint32().safe();
      `,
      errors: [{ messageId: 'removeSafe' }],
      output: dedent`
        import { uint32 } from 'zod';
        uint32();
      `,
    },
  ],
});
