import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noOptionalAndDefaultTogether } from './no-optional-and-default-together.js';

const ruleTester = new RuleTester();

ruleTester.run(noOptionalAndDefaultTogether.name, noOptionalAndDefaultTogether, {
  valid: [
    {
      name: 'optional and default on either side of a type change',
      code: dedent`
          import * as z from 'zod';
          z.string().optional().array().default([]);
          z.string().default("x").array().optional();
        `,
    },
    {
      name: 'schema with only default',
      code: dedent`
          import { string } from 'zod';
          z.string().default("Hello World")
        `,
    },
    {
      name: 'schema with only default (named)',
      code: dedent`
          import { string } from 'zod';
          string().default("Hello World")
        `,
    },
    {
      name: 'schema with only default (named z)',
      code: dedent`
          import { z } from 'zod';
          z.string().default("Hello World")
        `,
    },
    {
      name: 'schema with only optional',
      code: dedent`
          import { string } from 'zod';
          z.string().optional();
        `,
    },
    {
      name: 'schema with neither default nor optional',
      code: dedent`
          import * as z from 'zod';
          z.string();
        `,
    },
    {
      name: 'schema with other methods',
      code: dedent`
          import * as z from 'zod';
          z.string().min(5).max(10);
        `,
    },
    {
      name: 'complex schema with only default',
      code: dedent`
          import * as z from 'zod';
          z.string().trim().toLowerCase().default("hello")
        `,
    },
    {
      name: 'complex schema with only optional',
      code: dedent`
          import * as z from 'zod';
          z.string().trim().toLowerCase().optional();
        `,
    },
    {
      name: 'object schema with different properties',
      code: dedent`
          import * as z from 'zod';
          z.object({ a: z.string().optional(), b: z.string().default("b") });
        `,
    },
    {
      name: 'with nullable - should not error',
      code: dedent`
          import * as z from 'zod';
          z.string().nullable().default("hello")
        `,
    },
    {
      name: 'with nullish - should not error',
      code: dedent`
          import * as z from 'zod';
          z.string().nullish();
        `,
    },
    {
      name: 'with nullish - should not error (named)',
      code: dedent`
          import { string } from 'zod';
          string().nullish();
        `,
    },
    {
      name: 'should not report non-z chaining',
      code: dedent`
          import * as z from 'zod';
          something.string().optional().default("Test")
        `,
    },
    {
      // `exactOptional` rejects an explicit `undefined`;
      // `.default()` accepts and replaces it — not a redundancy
      name: 'exactOptional with default - should not error',
      code: dedent`
          import * as z from 'zod';
          z.exactOptional(z.string()).default("Test")
        `,
    },
    {
      name: 'computed factory access yields no walkable chain',
      code: dedent`
          import * as z from 'zod';
          z['string']();
        `,
    },
  ],
  invalid: [
    {
      name: 'optional then default - preferredMethod: none (explicit)',
      code: dedent`
          import * as z from 'zod';
          z.string().optional().default("Hello World")
        `,
      options: [{ preferredMethod: 'none' }],
      errors: [{ messageId: 'noOptionalAndDefaultTogether' }],
      output: null,
    },
    {
      name: 'optional then default - preferredMethod: none (explicit)',
      code: dedent`
          import { z } from 'zod';
          z.string().optional().default("Hello World")
        `,
      options: [{ preferredMethod: 'none' }],
      errors: [{ messageId: 'noOptionalAndDefaultTogether' }],
      output: null,
    },
    {
      name: 'optional then default - preferredMethod: none (explicit)',
      code: dedent`
          import { string } from 'zod';
          string().optional().default("Hello World")
        `,
      options: [{ preferredMethod: 'none' }],
      errors: [{ messageId: 'noOptionalAndDefaultTogether' }],
      output: null,
    },
    {
      name: 'optional then default - default option (no fix)',
      code: dedent`
          import * as z from 'zod';
          z.string().optional().default("Hello World")
        `,
      errors: [{ messageId: 'noOptionalAndDefaultTogether' }],
      output: null,
    },
    {
      name: 'default then optional - default option (no fix)',
      code: dedent`
          import * as z from 'zod';
          z.string().default("Hello World").optional()
        `,
      errors: [{ messageId: 'noOptionalAndDefaultTogether' }],
      output: null,
    },
    {
      name: 'optional then default - preferredMethod: default',
      code: dedent`
          import * as z from 'zod';
          z.string().optional().default("Hello World")
        `,
      options: [{ preferredMethod: 'default' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'optional' },
        },
      ],
      output: dedent`
          import * as z from 'zod';
          z.string().default("Hello World")
        `,
    },
    {
      name: 'default then optional - preferredMethod: default',
      code: dedent`
          import * as z from 'zod';
          z.string().default("Hello World").optional();
        `,
      options: [{ preferredMethod: 'default' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'optional' },
        },
      ],
      output: dedent`
          import * as z from 'zod';
          z.string().default("Hello World");
        `,
    },
    {
      name: 'optional then default - preferredMethod: optional',
      code: dedent`
          import * as z from 'zod';
          z.string().optional().default("Hello World");
        `,
      options: [{ preferredMethod: 'optional' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'default' },
        },
      ],
      output: dedent`
          import * as z from 'zod';
          z.string().optional();
        `,
    },
    {
      name: 'default then optional - preferredMethod: optional',
      code: dedent`
          import * as z from 'zod';
          z.string().default("Hello World").optional();
        `,
      options: [{ preferredMethod: 'optional' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'default' },
        },
      ],
      output: dedent`
          import * as z from 'zod';
          z.string().optional();
        `,
    },
    {
      name: 'with other methods in between - preferredMethod: default',
      code: dedent`
          import * as z from 'zod';
          z.string().optional().describe("Greeting").default("Hello World");
        `,
      options: [{ preferredMethod: 'default' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'optional' },
        },
      ],
      output: dedent`
          import * as z from 'zod';
          z.string().describe("Greeting").default("Hello World");
        `,
    },
    {
      name: 'with other methods in between - preferredMethod: optional',
      code: dedent`
          import * as z from 'zod';
          z.string().default("Hello World").describe("Greeting").optional();
        `,
      options: [{ preferredMethod: 'optional' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'default' },
        },
      ],
      output: dedent`
          import * as z from 'zod';
          z.string().describe("Greeting").optional();
        `,
    },
    {
      name: 'complex chain - optional then default - preferredMethod: default',
      code: dedent`
          import * as z from 'zod';
          z.string().trim().toLowerCase().optional().default("hello");
        `,
      options: [{ preferredMethod: 'default' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'optional' },
        },
      ],
      output: dedent`
          import * as z from 'zod';
          z.string().trim().toLowerCase().default("hello");
        `,
    },
    {
      name: 'complex chain - default then optional - preferredMethod: optional',
      code: dedent`
          import * as z from 'zod';
          z.string().trim().toLowerCase().default("hello").optional();
        `,
      options: [{ preferredMethod: 'optional' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'default' },
        },
      ],
      output: dedent`
          import * as z from 'zod';
          z.string().trim().toLowerCase().optional();
        `,
    },
    {
      name: 'number schema - optional then default',
      code: dedent`
          import * as z from 'zod';
          z.number().optional().default(42);
        `,
      options: [{ preferredMethod: 'default' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'optional' },
        },
      ],
      output: dedent`
          import * as z from 'zod';
          z.number().default(42);
        `,
    },
    {
      name: 'boolean schema - default then optional',
      code: dedent`
          import * as z from 'zod';
          z.boolean().default(true).optional();
        `,
      options: [{ preferredMethod: 'default' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'optional' },
        },
      ],
      output: dedent`
          import * as z from 'zod';
          z.boolean().default(true);
        `,
    },
    {
      name: 'optional wrapper then default - preferredMethod: default (reported without a fix)',
      code: dedent`
          import * as z from 'zod';
          z.optional(z.string()).default("Hello World");
        `,
      options: [{ preferredMethod: 'default' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'optional' },
        },
      ],
      output: null,
    },
    {
      name: 'optional wrapper then default - preferredMethod: default (named import)',
      code: dedent`
          import { optional, string } from 'zod';
          optional(string()).default("Hello World");
        `,
      options: [{ preferredMethod: 'default' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'optional' },
        },
      ],
      output: null,
    },
    {
      name: 'optional wrapper then default - preferredMethod: optional',
      code: dedent`
          import * as z from 'zod';
          z.optional(z.string()).default("Hello World");
        `,
      options: [{ preferredMethod: 'optional' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'default' },
        },
      ],
      output: dedent`
          import * as z from 'zod';
          z.optional(z.string());
        `,
    },
    {
      name: 'default then optional after a property access - preferredMethod: optional',
      code: dedent`
          import * as z from 'zod';
          z.object({ a: z.string() }).shape.a.default("Hello World").optional();
        `,
      options: [{ preferredMethod: 'optional' }],
      errors: [
        {
          messageId: 'noOptionalAndDefaultTogetherRemoveMethod',
          data: { method: 'default' },
        },
      ],
      output: dedent`
          import * as z from 'zod';
          z.object({ a: z.string() }).shape.a.optional();
        `,
    },
    {
      name: 'comment inside the removed method — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.string() /* keep */ .optional().default('a');
      `,
      options: [{ preferredMethod: 'default' }],
      errors: [
        { messageId: 'noOptionalAndDefaultTogetherRemoveMethod', data: { method: 'optional' } },
      ],
      output: null,
    },
  ],
});
