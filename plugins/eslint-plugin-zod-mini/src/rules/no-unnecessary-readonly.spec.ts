import { createSuggestionCases } from '@eslint-zod/tooling/vitest/rule-tester-cases';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noUnnecessaryReadonly } from './no-unnecessary-readonly.js';

const ruleTester = new RuleTester();

const { suggest, report } = createSuggestionCases(noUnnecessaryReadonly, {
  messageId: 'unnecessaryReadonly',
  suggestionMessageId: 'removeReadonly',
});

ruleTester.run(noUnnecessaryReadonly.name, noUnnecessaryReadonly, {
  valid: [
    {
      name: 'readonly around a rewrite of the frozen value',
      code: dedent`
        import * as z from 'zod/mini';
        z.readonly(z.readonly(z.array(z.string())).check(z.overwrite((v) => [...v])));
      `,
    },
    {
      name: 'readonly around _default() or catch(), whose value skips the inner one',
      code: dedent`
        import * as z from 'zod/mini';
        z.readonly(z._default(z.readonly(z.array(z.string())), ['a']));
        z.readonly(z.catch(z.readonly(z.array(z.string())), ['a']));
      `,
    },
    {
      name: 'readonly around apply() is not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        z.readonly(z.string().apply((schema) => schema));
      `,
    },
    {
      name: 'readonly on an object schema is meaningful',
      code: dedent`
        import * as z from 'zod/mini';
        z.readonly(z.object({ a: z.string() }));
      `,
    },
    {
      name: 'readonly on an array schema is meaningful',
      code: dedent`
        import * as z from 'zod/mini';
        z.readonly(z.array(z.string()));
      `,
    },
    {
      name: 'readonly on a map schema is meaningful',
      code: dedent`
        import * as z from 'zod/mini';
        z.readonly(z.map(z.string(), z.number()));
      `,
    },
    {
      name: 'readonly on a schema reference is not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        const inner = z.object({ a: z.string() });
        z.readonly(inner);
      `,
    },
    {
      name: 'readonly on a pipe is not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        z.readonly(z.pipe(z.string(), z.transform((s) => [s])));
      `,
    },
    {
      name: 'immutable schema without readonly',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(2));
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { readonly, string } from 'not-zod';
        readonly(string());
      `,
    },
    {
      name: 'readonly wrapping a non-zod call is not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        declare function buildSchema(): z.ZodMiniString;
        z.readonly(buildSchema());
      `,
    },
    {
      name: 'passthrough wrapper around a schema reference is not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        const inner = z.string();
        z.readonly(z.optional(inner));
      `,
    },
    {
      name: 'passthrough wrapper around a non-zod call is not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        declare function buildSchema(): z.ZodMiniString;
        z.readonly(z.optional(buildSchema()));
      `,
    },
    {
      name: 'readonly without an argument is not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        z.readonly();
      `,
    },
    {
      name: 'computed readonly wrapper — the chain walker cannot name it',
      code: dedent`
        import * as z from 'zod/mini';
        z['readonly'](z.string());
      `,
    },
  ],
  invalid: [
    suggest(
      'a bound inside check() does not replace the frozen value',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.readonly(z.array(z.string())).check(z.minLength(1)));
      `,
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.array(z.string())).check(z.minLength(1));
      `,
    ),
    report(
      'no suggestion when it would bring back a dropped description',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.string().check(z.describe('a')));
      `,
    ),
    report(
      'no suggestion when it would bring back dropped metadata',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.string().check(z.meta({ title: 't' })));
      `,
    ),
    report(
      'no suggestion when the schema is read through its parent',
      dedent`
        import * as z from 'zod/mini';
        z.object({ a: z.readonly(z.string()) }).shape.a.unwrap();
      `,
    ),
    report(
      'no suggestion when a variable holding the schema is read',
      dedent`
        import * as z from 'zod/mini';
        const s = z.readonly(z.string());
        s.def;
      `,
    ),
    report(
      'no suggestion before apply(), whose callback can read the wrapper',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.string()).apply((s) => s);
      `,
    ),
    suggest(
      'readonly around _default() on an immutable schema',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z._default(z.string(), 'a'));
      `,
      dedent`
        import * as z from 'zod/mini';
        z._default(z.string(), 'a');
      `,
    ),
    report(
      'property read from the schema — reported without a suggestion',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.string()).def.innerType;
      `,
    ),
    suggest(
      'readonly on a string schema',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.string());
      `,
      dedent`
        import * as z from 'zod/mini';
        z.string();
      `,
    ),
    suggest(
      'readonly on a string schema with checks keeps the checks',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.string().check(z.minLength(2)));
      `,
      dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(2));
      `,
    ),
    suggest(
      'readonly on a date schema',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.date());
      `,
      dedent`
        import * as z from 'zod/mini';
        z.date();
      `,
    ),
    suggest(
      'readonly on an enum schema',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.enum(['a', 'b']));
      `,
      dedent`
        import * as z from 'zod/mini';
        z.enum(['a', 'b']);
      `,
    ),
    suggest(
      'readonly on a literal schema',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.literal('x'));
      `,
      dedent`
        import * as z from 'zod/mini';
        z.literal('x');
      `,
    ),
    suggest(
      'readonly on a top-level string format schema',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.creditCard());
      `,
      dedent`
        import * as z from 'zod/mini';
        z.creditCard();
      `,
    ),
    suggest(
      'readonly on an optional-wrapped immutable schema',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.optional(z.string()));
      `,
      dedent`
        import * as z from 'zod/mini';
        z.optional(z.string());
      `,
    ),
    suggest(
      'readonly wrapper keeps its chained methods',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.string()).check(z.minLength(2));
      `,
      dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(2));
      `,
    ),
    suggest(
      'doubled readonly on a mutable schema flags only the outer',
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.readonly(z.object({ a: z.string() })));
      `,
      dedent`
        import * as z from 'zod/mini';
        z.readonly(z.object({ a: z.string() }));
      `,
    ),
    {
      name: 'doubled readonly on an immutable schema flags both',
      code: dedent`
        import * as z from 'zod/mini';
        z.readonly(z.readonly(z.string()));
      `,
      errors: [
        {
          messageId: 'unnecessaryReadonly',
          suggestions: [
            {
              messageId: 'removeReadonly',
              output: dedent`
          import * as z from 'zod/mini';
          z.readonly(z.string());
        `,
            },
          ],
        },
        {
          messageId: 'unnecessaryReadonly',
          suggestions: [
            {
              messageId: 'removeReadonly',
              output: dedent`
          import * as z from 'zod/mini';
          z.readonly(z.string());
        `,
            },
          ],
        },
      ],
    },
    suggest(
      'readonly nested inside an object schema',
      dedent`
        import * as z from 'zod/mini';
        z.object({ foo: z.readonly(z.string()) });
      `,
      dedent`
        import * as z from 'zod/mini';
        z.object({ foo: z.string() });
      `,
    ),
    suggest(
      'named import',
      dedent`
        import { readonly, string } from 'zod/mini';
        readonly(string());
      `,
      dedent`
        import { readonly, string } from 'zod/mini';
        string();
      `,
    ),
  ],
});
