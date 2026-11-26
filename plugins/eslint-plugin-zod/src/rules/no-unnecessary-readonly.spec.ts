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
      name: 'readonly after a rewrite of the frozen value',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).readonly().overwrite((v) => [...v]).readonly();
        z.array(z.string()).readonly().check((ctx) => { ctx.value = [...ctx.value]; }).readonly();
      `,
    },
    {
      name: 'readonly after unwrap() is not analyzed',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).readonly().unwrap().readonly();
      `,
    },
    {
      name: 'readonly past default() or catch(), whose value skips the inner one',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).readonly().default(['a']).readonly();
        z.array(z.string()).readonly().catch(['a']).readonly();
        z.readonly(z.array(z.string())).default(['a']).readonly();
        z.optional(z.array(z.string()).readonly()).default(['a']).readonly();
      `,
    },
    {
      name: 'readonly after apply() is not analyzed',
      code: dedent`
        import * as z from 'zod';
        z.string().apply((schema) => schema).readonly();
      `,
    },
    {
      name: 'readonly on an object schema is meaningful',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.string() }).readonly();
      `,
    },
    {
      name: 'readonly on an array schema is meaningful',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).readonly();
      `,
    },
    {
      name: 'readonly on a chained array() is meaningful',
      code: dedent`
        import * as z from 'zod';
        z.string().array().readonly();
      `,
    },
    {
      name: 'readonly on a date schema freezes the parsed Date',
      code: dedent`
        import * as z from 'zod';
        z.date().readonly();
      `,
    },
    {
      name: 'readonly on a map schema is meaningful',
      code: dedent`
        import * as z from 'zod';
        z.map(z.string(), z.number()).readonly();
      `,
    },
    {
      name: 'readonly after a transform is not analyzed',
      code: dedent`
        import * as z from 'zod';
        z.string().transform((s) => [s]).readonly();
      `,
    },
    {
      name: 'immutable schema without readonly',
      code: dedent`
        import * as z from 'zod';
        z.string().min(2);
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { string } from 'not-zod';
        string().readonly();
      `,
    },
    {
      name: 'computed factory with a type-changing method — the chain walker cannot see `.transform()`',
      code: dedent`
        import * as z from 'zod';
        z['string']().transform((s) => [s]).readonly();
      `,
    },
    {
      name: 'readonly on a schema reached through a property access',
      code: dedent`
        import * as z from 'zod';
        z.string().transform((value) => value.split(',')).pipe(z.array(z.string())).out.min(1).readonly();
      `,
    },
    {
      name: 'method called on the schema inside a readonly wrapper',
      code: dedent`
        import * as z from 'zod';
        z.readonly(z.array(z.string())).def.innerType.or(z.string());
      `,
    },
  ],
  invalid: [
    report(
      'no suggestion when a later unwrap() can reach the wrapper through array()',
      dedent`
        import * as z from 'zod';
        z.string().readonly().array().unwrap().unwrap();
      `,
    ),
    report(
      'no suggestion when a variable holding the schema is unwrapped',
      dedent`
        import * as z from 'zod';
        const s = z.string().readonly();
        s.unwrap();
      `,
    ),
    suggest(
      'suggested when a variable holding the schema is only parsed',
      dedent`
        import * as z from 'zod';
        const s = z.string().readonly();
        s.parse('a');
      `,
      dedent`
        import * as z from 'zod';
        const s = z.string();
        s.parse('a');
      `,
    ),
    report(
      'no suggestion when it would bring back a dropped description',
      dedent`
        import * as z from 'zod';
        z.string().describe('a').readonly();
      `,
    ),
    report(
      'no suggestion when it would bring back dropped metadata',
      dedent`
        import * as z from 'zod';
        z.string().meta({ title: 't' }).readonly();
      `,
    ),
    report(
      'no suggestion when a later describe() would inherit the dropped metadata',
      dedent`
        import * as z from 'zod';
        z.string().meta({ title: 't' }).readonly().describe('a');
      `,
    ),
    suggest(
      'suggested when a later wrapper drops the description anyway',
      dedent`
        import * as z from 'zod';
        z.string().describe('a').readonly().optional();
      `,
      dedent`
        import * as z from 'zod';
        z.string().describe('a').optional();
      `,
    ),
    report(
      'no suggestion before unwrap(), which reads the wrapper',
      dedent`
        import * as z from 'zod';
        z.string().readonly().unwrap();
      `,
    ),
    report(
      'no suggestion before apply(), whose callback can read the wrapper',
      dedent`
        import * as z from 'zod';
        z.string().readonly().apply((s) => s.unwrap());
      `,
    ),
    suggest(
      'refine() does not replace the frozen value',
      dedent`
        import * as z from 'zod';
        z.array(z.string()).readonly().refine(() => true).readonly();
      `,
      dedent`
        import * as z from 'zod';
        z.array(z.string()).readonly().refine(() => true);
      `,
    ),
    suggest(
      'readonly repeated right after the one past default()',
      dedent`
        import * as z from 'zod';
        z.array(z.string()).readonly().default(['a']).readonly().readonly();
      `,
      dedent`
        import * as z from 'zod';
        z.array(z.string()).readonly().default(['a']).readonly();
      `,
    ),
    suggest(
      'readonly past default() on an immutable schema',
      dedent`
        import * as z from 'zod';
        z.string().default('a').readonly();
      `,
      dedent`
        import * as z from 'zod';
        z.string().default('a');
      `,
    ),
    report(
      'property read from the schema — reported without a suggestion',
      dedent`
        import * as z from 'zod';
        z.string().readonly().def.innerType;
      `,
    ),
    suggest(
      'readonly on a string schema',
      dedent`
        import * as z from 'zod';
        z.string().readonly();
      `,
      dedent`
        import * as z from 'zod';
        z.string();
      `,
    ),
    suggest(
      'readonly on a number schema keeps its checks',
      dedent`
        import * as z from 'zod';
        z.number().min(2).readonly();
      `,
      dedent`
        import * as z from 'zod';
        z.number().min(2);
      `,
    ),
    suggest(
      'readonly on an enum schema',
      dedent`
        import * as z from 'zod';
        z.enum(['a', 'b']).readonly();
      `,
      dedent`
        import * as z from 'zod';
        z.enum(['a', 'b']);
      `,
    ),
    suggest(
      'readonly on a literal schema',
      dedent`
        import * as z from 'zod';
        z.literal('x').readonly();
      `,
      dedent`
        import * as z from 'zod';
        z.literal('x');
      `,
    ),
    suggest(
      'readonly on a top-level string format schema',
      dedent`
        import * as z from 'zod';
        z.creditCard().readonly();
      `,
      dedent`
        import * as z from 'zod';
        z.creditCard();
      `,
    ),
    suggest(
      'readonly in the middle of a chain keeps trailing methods',
      dedent`
        import * as z from 'zod';
        z.string().readonly().optional();
      `,
      dedent`
        import * as z from 'zod';
        z.string().optional();
      `,
    ),
    suggest(
      'doubled readonly on a mutable schema flags only the second',
      dedent`
        import * as z from 'zod';
        z.object({ a: z.string() }).readonly().readonly();
      `,
      dedent`
        import * as z from 'zod';
        z.object({ a: z.string() }).readonly();
      `,
    ),
    {
      name: 'doubled readonly on an immutable schema flags both',
      code: dedent`
        import * as z from 'zod';
        z.string().readonly().readonly();
      `,
      errors: [
        {
          messageId: 'unnecessaryReadonly',
          suggestions: [
            {
              messageId: 'removeReadonly',
              output: dedent`
          import * as z from 'zod';
          z.string().readonly();
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
          import * as z from 'zod';
          z.string().readonly();
        `,
            },
          ],
        },
      ],
    },
    suggest(
      'readonly nested inside an object schema',
      dedent`
        import * as z from 'zod';
        z.object({ foo: z.string().readonly() });
      `,
      dedent`
        import * as z from 'zod';
        z.object({ foo: z.string() });
      `,
    ),
    suggest(
      'named import',
      dedent`
        import { string } from 'zod';
        string().readonly();
      `,
      dedent`
        import { string } from 'zod';
        string();
      `,
    ),
    report(
      'parenthesized receiver — reported without a suggestion',
      dedent`
        import * as z from 'zod';
        (z.string()).readonly();
      `,
    ),
    report(
      'comment in the rewritten text — reported without a suggestion',
      dedent`
        import * as z from 'zod';
        z.string()
          // keep
          .readonly();
      `,
    ),
  ],
});
