import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferValidate } from './prefer-validate.js';

const ruleTester = new RuleTester();

ruleTester.run(preferValidate.name, preferValidate, {
  valid: [
    {
      name: 'parsed data is used',
      code: dedent`
        import * as core from 'zod/v4/core';
        const result = core.safeParse(Schema, data);
        if (result.success) {
          accept(result.data);
        }
      `,
    },
    {
      name: 'already validates',
      code: dedent`
        import * as core from 'zod/v4/core';
        core.validate(Schema, data);
      `,
    },
    {
      name: 'parse is not safeParse',
      code: dedent`
        import * as core from 'zod/v4/core';
        core.parse(Schema, data);
      `,
    },
    {
      name: 'not a zod-core import',
      code: dedent`
        import * as core from '@custom';
        core.safeParse(Schema, data).success;
      `,
    },
    {
      name: 'other plugin source',
      code: dedent`
        import * as z from 'zod';
        z.safeParse(Schema, data).success;
      `,
    },
    {
      name: 'type-only import',
      code: dedent`
        import type { safeParse } from 'zod/v4/core';
        safeParse(Schema, data).success;
      `,
    },
    {
      name: 'namespace shadowed at the call site',
      code: dedent`
        import * as core from 'zod/v4/core';
        function f(core) {
          return core.safeParse(Schema, data).success;
        }
      `,
    },
    {
      name: 'unawaited async parse',
      code: dedent`
        import * as core from 'zod/v4/core';
        core.safeParseAsync(Schema, data).then((r) => r.success);
      `,
    },
    {
      name: 'result escapes',
      code: dedent`
        import * as core from 'zod/v4/core';
        const result = core.safeParse(Schema, data);
        use(result);
      `,
    },
    {
      name: 'missing data argument',
      code: dedent`
        import * as core from 'zod/v4/core';
        core.safeParse(Schema).success;
      `,
    },
  ],
  invalid: [
    {
      name: 'direct success access',
      code: dedent`
        import * as core from 'zod/v4/core';
        const ok = core.safeParse(Schema, data).success;
      `,
      errors: [
        {
          messageId: 'preferValidate',
          data: { method: 'validate' },
          suggestions: [
            {
              messageId: 'useValidate',
              data: { method: 'validate' },
              output: dedent`
                import * as core from 'zod/v4/core';
                const ok = core.validate(Schema, data);
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'success-only destructuring with an alias',
      code: dedent`
        import * as core from 'zod/v4/core';
        const { success: valid } = core.safeParse(Schema, data);
        use(valid);
      `,
      errors: [
        {
          messageId: 'preferValidate',
          data: { method: 'validate' },
          suggestions: [
            {
              messageId: 'useValidate',
              data: { method: 'validate' },
              output: dedent`
                import * as core from 'zod/v4/core';
                const valid = core.validate(Schema, data);
                use(valid);
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'result variable read only through success',
      code: dedent`
        import * as core from 'zod/v4/core';
        const result = core.safeParse(Schema, data);
        if (result.success) {
          accept(data);
        }
      `,
      errors: [
        {
          messageId: 'preferValidate',
          data: { method: 'validate' },
          suggestions: [
            {
              messageId: 'useValidate',
              data: { method: 'validate' },
              output: dedent`
                import * as core from 'zod/v4/core';
                const result = core.validate(Schema, data);
                if (result) {
                  accept(data);
                }
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'awaited async parse',
      code: dedent`
        import * as core from 'zod/v4/core';
        const result = await core.safeParseAsync(Schema, data);
        if (result.success) {
          accept(data);
        }
      `,
      errors: [
        {
          messageId: 'preferValidate',
          data: { method: 'validateAsync' },
          suggestions: [
            {
              messageId: 'useValidate',
              data: { method: 'validateAsync' },
              output: dedent`
                import * as core from 'zod/v4/core';
                const result = await core.validateAsync(Schema, data);
                if (result) {
                  accept(data);
                }
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'named import reuses the existing declaration',
      code: dedent`
        import { safeParse } from 'zod/v4/core';
        safeParse(Schema, data).success;
      `,
      errors: [
        {
          messageId: 'preferValidate',
          data: { method: 'validate' },
          suggestions: [
            {
              messageId: 'useValidate',
              data: { method: 'validate' },
              output: dedent`
                import { safeParse, validate } from 'zod/v4/core';
                validate(Schema, data);
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'named import avoids an existing binding',
      code: dedent`
        import { safeParse } from 'zod/v4/core';
        const validate = 1;
        safeParse(Schema, data).success;
      `,
      errors: [
        {
          messageId: 'preferValidate',
          data: { method: 'validate' },
          suggestions: [
            {
              messageId: 'useValidate',
              data: { method: 'validate' },
              output: dedent`
                import { safeParse, validate as validate2 } from 'zod/v4/core';
                const validate = 1;
                validate2(Schema, data);
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'aliased namespace import',
      code: dedent`
        import * as myCore from 'zod/v4/core';
        myCore.safeParse(Schema, data).success;
      `,
      errors: [
        {
          messageId: 'preferValidate',
          data: { method: 'validate' },
          suggestions: [
            {
              messageId: 'useValidate',
              data: { method: 'validate' },
              output: dedent`
                import * as myCore from 'zod/v4/core';
                myCore.validate(Schema, data);
              `,
            },
          ],
        },
      ],
    },
    {
      name: 'no suggestion when a comment would be discarded',
      code: dedent`
        import * as core from 'zod/v4/core';
        core.safeParse(Schema, data)./* keep */ success;
      `,
      errors: [{ messageId: 'preferValidate', data: { method: 'validate' }, suggestions: [] }],
    },
  ],
});
