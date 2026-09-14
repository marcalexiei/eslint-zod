import { createSuggestionCases } from '@eslint-zod/tooling/vitest/rule-tester-cases';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noCoerceBoolean } from './no-coerce-boolean.js';

const { suggest, report } = createSuggestionCases(noCoerceBoolean, {
  messageId: 'noCoerceBoolean',
  suggestionMessageId: 'useStringbool',
});

const ruleTester = new RuleTester();

ruleTester.run(noCoerceBoolean.name, noCoerceBoolean, {
  valid: [
    {
      name: 'plain boolean schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.boolean();
      `,
    },
    {
      name: 'stringbool schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.stringbool();
      `,
    },
    {
      name: 'other coerced types',
      code: dedent`
        import * as z from 'zod/mini';
        z.coerce.string();
        z.coerce.number();
        z.coerce.date();
        z.coerce.bigint();
      `,
    },
    {
      name: 'explicit string transform via pipe',
      code: dedent`
        import * as z from 'zod/mini';
        z.pipe(z.string(), z.transform((v) => v === 'true'));
      `,
    },
    {
      name: 'unrelated coerce helper from another package',
      code: dedent`
        import { coerce } from 'something-else';
        coerce.boolean();
      `,
    },
    {
      name: 'coerce boolean from non-zod-mini source',
      code: dedent`
        import * as z from 'zod';
        z.coerce.boolean();
      `,
    },
  ],
  invalid: [
    suggest(
      'namespace import',
      dedent`
        import * as z from 'zod/mini';
        z.coerce.boolean();
      `,
      dedent`
                import * as z from 'zod/mini';
                z.stringbool();
              `,
    ),
    suggest(
      'default import',
      dedent`
        import z from 'zod/mini';
        z.coerce.boolean();
      `,
      dedent`
                import z from 'zod/mini';
                z.stringbool();
              `,
    ),
    suggest(
      'named z import',
      dedent`
        import { z } from 'zod/mini';
        z.coerce.boolean();
      `,
      dedent`
                import { z } from 'zod/mini';
                z.stringbool();
              `,
    ),
    report(
      'named coerce import (no suggestion)',
      dedent`
        import { coerce } from 'zod/mini';
        coerce.boolean();
      `,
    ),
    report(
      'computed coerced factory — reported without a suggestion, and must not crash',
      dedent`
        import * as z from 'zod/mini';
        z.coerce['boolean']();
      `,
    ),
    suggest(
      'with chained optional',
      dedent`
        import * as z from 'zod/mini';
        z.optional(z.coerce.boolean());
      `,
      dedent`
                import * as z from 'zod/mini';
                z.optional(z.stringbool());
              `,
    ),
    suggest(
      'inside object schema',
      dedent`
        import * as z from 'zod/mini';
        z.object({ isUrgent: z.optional(z.coerce.boolean()) });
      `,
      dedent`
                import * as z from 'zod/mini';
                z.object({ isUrgent: z.optional(z.stringbool()) });
              `,
    ),
  ],
});
