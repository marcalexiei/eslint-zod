import { createSuggestionCases } from '@eslint-zod/tooling/vitest/rule-tester-cases';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferValidate } from './prefer-validate.js';

const { suggest, report } = createSuggestionCases(preferValidate, {
  messageId: 'preferValidate',
  suggestionMessageId: 'useValidate',
  data: {
    method: 'validate',
  },
});
const { suggest: suggestAsync } = createSuggestionCases(preferValidate, {
  messageId: 'preferValidate',
  suggestionMessageId: 'useValidate',
  data: {
    method: 'validateAsync',
  },
});

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
    suggest(
      'direct success access',
      dedent`
        import * as core from 'zod/v4/core';
        const ok = core.safeParse(Schema, data).success;
      `,
      dedent`
        import * as core from 'zod/v4/core';
        const ok = core.validate(Schema, data);
      `,
    ),
    suggest(
      'success-only destructuring with an alias',
      dedent`
        import * as core from 'zod/v4/core';
        const { success: valid } = core.safeParse(Schema, data);
        use(valid);
      `,
      dedent`
        import * as core from 'zod/v4/core';
        const valid = core.validate(Schema, data);
        use(valid);
      `,
    ),
    suggest(
      'result variable read only through success',
      dedent`
        import * as core from 'zod/v4/core';
        const result = core.safeParse(Schema, data);
        if (result.success) {
          accept(data);
        }
      `,
      dedent`
        import * as core from 'zod/v4/core';
        const result = core.validate(Schema, data);
        if (result) {
          accept(data);
        }
      `,
    ),
    suggestAsync(
      'awaited async parse',
      dedent`
        import * as core from 'zod/v4/core';
        const result = await core.safeParseAsync(Schema, data);
        if (result.success) {
          accept(data);
        }
      `,
      dedent`
        import * as core from 'zod/v4/core';
        const result = await core.validateAsync(Schema, data);
        if (result) {
          accept(data);
        }
      `,
    ),
    suggest(
      'named import reuses the existing declaration',
      dedent`
        import { safeParse } from 'zod/v4/core';
        safeParse(Schema, data).success;
      `,
      dedent`
        import { safeParse, validate } from 'zod/v4/core';
        validate(Schema, data);
      `,
    ),
    suggest(
      'named import avoids an existing binding',
      dedent`
        import { safeParse } from 'zod/v4/core';
        const validate = 1;
        safeParse(Schema, data).success;
      `,
      dedent`
        import { safeParse, validate as validate2 } from 'zod/v4/core';
        const validate = 1;
        validate2(Schema, data);
      `,
    ),
    suggest(
      'aliased namespace import',
      dedent`
        import * as myCore from 'zod/v4/core';
        myCore.safeParse(Schema, data).success;
      `,
      dedent`
        import * as myCore from 'zod/v4/core';
        myCore.validate(Schema, data);
      `,
    ),
    report(
      'no suggestion when a comment would be discarded',
      dedent`
        import * as core from 'zod/v4/core';
        core.safeParse(Schema, data)./* keep */ success;
      `,
    ),
  ],
});
