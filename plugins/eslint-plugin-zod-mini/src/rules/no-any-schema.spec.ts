import { createSuggestionCases } from '@eslint-zod/tooling/vitest/rule-tester-cases';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noAnySchema } from './no-any-schema.js';

const { suggest, report } = createSuggestionCases(noAnySchema, {
  messageId: 'noZAny',
  suggestionMessageId: 'useUnknown',
});

const ruleTester = new RuleTester();

ruleTester.run(noAnySchema.name, noAnySchema, {
  valid: [
    {
      name: 'not triggered with another schema',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.string();
      `,
    },
    {
      name: 'named z import',
      code: dedent`
        import { z } from 'zod/mini';
        const userSchema = z.string();
      `,
    },
    {
      name: 'nested schema declaration',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ name: z.string() });
      `,
    },
    {
      name: 'not zod',
      code: 'something.any()',
    },
    {
      name: 'not triggered on zod import',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.any();
      `,
    },
  ],
  invalid: [
    suggest(
      'namespace import',
      dedent`
        import * as z from 'zod/mini';
        const userSchema = z.any();
      `,
      dedent`
                import * as z from 'zod/mini';
                const userSchema = z.unknown();
              `,
    ),
    suggest(
      'named z import',
      dedent`
        import { z } from 'zod/mini';
        const userSchema = z.any();
      `,
      dedent`
                import { z } from 'zod/mini';
                const userSchema = z.unknown();
              `,
    ),
    {
      name: 'named import',
      code: dedent`
        import { any } from 'zod/mini';
        const userSchema = any();
      `,
      errors: [{ messageId: 'noZAny' }],
    },
    suggest(
      'namespace import within an object',
      dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ prop: z.any() });
      `,
      dedent`
                import * as z from 'zod/mini';
                const userSchema = z.object({ prop: z.unknown() });
              `,
    ),
    suggest(
      'zod/v4-mini import',
      dedent`
        import * as z from 'zod/v4-mini';
        const userSchema = z.any();
      `,
      dedent`
                import * as z from 'zod/v4-mini';
                const userSchema = z.unknown();
              `,
    ),
    suggest(
      'chained method',
      dedent`
        import * as z from 'zod/mini';
        const userSchema = z.any().check((value) => value)
      `,
      dedent`
                import * as z from 'zod/mini';
                const userSchema = z.unknown().check((value) => value)
              `,
    ),
    report(
      'named import with a chained method — reported without a rename suggestion',
      dedent`
        import { any, check } from 'zod/mini';
        const userSchema = any().check((value) => value);
      `,
    ),
    report(
      'computed factory access — reported without a rename suggestion',
      dedent`
        import * as z from 'zod/mini';
        const userSchema = z['any']();
      `,
    ),
  ],
});
