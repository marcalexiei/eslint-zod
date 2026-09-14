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
        import * as z from 'zod';
        z.boolean();
      `,
    },
    {
      name: 'stringbool schema',
      code: dedent`
        import * as z from 'zod';
        z.stringbool();
      `,
    },
    {
      name: 'other coerced types',
      code: dedent`
        import * as z from 'zod';
        z.coerce.string();
        z.coerce.number();
        z.coerce.date();
        z.coerce.bigint();
      `,
    },
    {
      name: 'explicit string transform',
      code: dedent`
        import * as z from 'zod';
        z.string().transform((v) => v === 'true');
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
      name: 'coerce boolean from non-zod source',
      code: dedent`
        import * as z from 'zod-mini';
        z.coerce.boolean();
      `,
    },
  ],
  invalid: [
    suggest(
      'namespace import',
      dedent`
        import * as z from 'zod';
        z.coerce.boolean();
      `,
      dedent`
                import * as z from 'zod';
                z.stringbool();
              `,
    ),
    suggest(
      'default import',
      dedent`
        import z from 'zod';
        z.coerce.boolean();
      `,
      dedent`
                import z from 'zod';
                z.stringbool();
              `,
    ),
    suggest(
      'named z import',
      dedent`
        import { z } from 'zod';
        z.coerce.boolean();
      `,
      dedent`
                import { z } from 'zod';
                z.stringbool();
              `,
    ),
    suggest(
      'aliased namespace import',
      dedent`
        import * as zod from 'zod';
        zod.coerce.boolean();
      `,
      dedent`
                import * as zod from 'zod';
                zod.stringbool();
              `,
    ),
    report(
      'named coerce import (no suggestion)',
      dedent`
        import { coerce } from 'zod';
        coerce.boolean();
      `,
    ),
    suggest(
      'with chained method',
      dedent`
        import * as z from 'zod';
        z.coerce.boolean().optional();
      `,
      dedent`
                import * as z from 'zod';
                z.stringbool().optional();
              `,
    ),
    suggest(
      'inside object schema',
      dedent`
        import * as z from 'zod';
        z.object({ isUrgent: z.coerce.boolean().optional() });
      `,
      dedent`
                import * as z from 'zod';
                z.object({ isUrgent: z.stringbool().optional() });
              `,
    ),
    report(
      'computed coerced factory — reported without a suggestion, and must not crash',
      dedent`
        import * as z from 'zod';
        z.coerce['boolean']();
      `,
    ),
  ],
});
