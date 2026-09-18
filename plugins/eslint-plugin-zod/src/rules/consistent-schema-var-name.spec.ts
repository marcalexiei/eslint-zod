import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { consistentSchemaVarName } from './consistent-schema-var-name.js';

const ruleTester = new RuleTester();

ruleTester.run(consistentSchemaVarName.name, consistentSchemaVarName, {
  valid: [
    {
      name: 'valid usage (default suffix)',
      code: dedent`
        import * as z from 'zod';
        const mySchema = z.string();
      `,
    },
    {
      name: 'valid suffix only (default suffix)',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const Schema = z.string();
        const SCHEMA = z.string();
      `,
    },
    {
      name: 'valid usage with multiple declarations',
      code: dedent`
        import * as z from 'zod';
        const mySchema = z.string(), addressSchema = z.object({ street: z.string() });
      `,
    },
    {
      name: 'with parse()',
      code: dedent`
        import * as z from 'zod';
        const value = z.string().parse("asd")
      `,
    },
    {
      name: 'with parse() (named)',
      code: dedent`
        import { string } from 'zod';
        const value = string().parse("asd")
      `,
    },
    {
      name: 'custom suffix',
      code: dedent`
        import * as z from 'zod';
        const myVar = z.string()
      `,
      options: [{ after: 'Var' }],
    },
    {
      name: 'custom suffix bare token (case-insensitive)',
      code: dedent`
        import * as z from 'zod';
        const bar = z.string();
        const Bar = z.string();
        const BAR = z.string();
      `,
      options: [{ after: 'Bar' }],
    },
    {
      name: 'ignores non-zod',
      code: dedent`
        import * as z from 'zod';
        const myVar = 1
      `,
    },
    {
      name: 'ignores z.codec',
      code: dedent`
        import * as z from 'zod';
        const stringToDate = z.codec(
          z.iso.datetime(),
          z.date(),
          {
            decode: (isoString) => new Date(isoString),
            encode: (date) => date.toISOString(),
          }
        );
      `,
    },
    {
      name: 'ignores z.validate / z.validateAsync (namespace import)',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.object({ name: z.string() });
        const isValid = z.validate(userSchema, input);
        const isValidLater = z.validateAsync(userSchema, input);
      `,
    },
    {
      name: 'ignores validate / validateAsync (named import)',
      code: dedent`
        import { object, string, validate, validateAsync } from 'zod';
        const userSchema = object({ name: string() });
        const isValid = validate(userSchema, input);
        const isValidLater = validateAsync(userSchema, input);
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod/issues/226
      name: 'ignores error utilities (namespace import)',
      code: dedent`
        import * as z from 'zod';
        const UserSchema = z.object({ email: z.email() });
        const result = UserSchema.safeParse({})
        if (!result.success) {
          const errors = [
            z.treeifyError(result.error),
            z.prettifyError(result.error),
            z.formatError(result.error),
            z.flattenError(result.error),
          ];
        }
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod/issues/226
      name: 'ignores error utilities (named import)',
      code: dedent`
        import { object } from 'zod';
        const UserSchema = object({ email: z.email() });
        const result = UserSchema.safeParse({})
        if (!result.success) {
          const errors = [
            z.treeifyError(result.error),
            z.prettifyError(result.error),
            z.formatError(result.error),
            z.flattenError(result.error),
          ];
        }
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod/issues/226
      name: 'ignores error utilities (named z import)',
      code: dedent`
        import {z} from 'zod';
        const UserSchema = z.object({ email: z.email() });
        const result = UserSchema.safeParse({})
        if (!result.success) {
          const errors = [
            z.treeifyError(result.error),
            z.prettifyError(result.error),
            z.formatError(result.error),
            z.flattenError(result.error),
          ];
        }
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod/issues/71
      name: 'should handle methods after parsing methods',
      code: dedent`
        import * as z from 'zod';
        const data1 = z.array(z.string()).parse([]).filter(() => true)
        const data2 = z.array(z.string()).safeParse([]).filter(() => true)
        const data3 = z.array(z.string()).encode([]).filter(() => true)
        const data4 = z.array(z.string()).decode([]).filter(() => true)
        const data5 = z.array(z.string()).safeEncode([]).filter(() => true)
        const data6 = z.array(z.string()).safeDecode([]).filter(() => true)
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod/issues/71
      name: 'should handle properties after `safeParse`',
      code: dedent`
        import * as z from 'zod';
        const data = z.array(z.string()).safeParse([]).success
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod/issues/71
      name: 'should handle methods after spa (alias for safeParseAsync)',
      code: dedent`
        import * as z from 'zod';
        const data = z.array(z.string()).spa([]).then(result => result.success)
      `,
    },
    {
      name: 'valid prefix only',
      code: dedent`
        import * as z from 'zod';
        const $user = z.string();
      `,
      options: [{ before: '$', after: '' }],
    },
    {
      name: 'valid prefix only (case-insensitive)',
      code: dedent`
        import * as z from 'zod';
        const foo = z.string();
        const Foo = z.string();
        const FOO = z.string();
      `,
      options: [{ before: 'foo', after: '' }],
    },
    {
      name: 'valid with both before and after',
      code: dedent`
        import * as z from 'zod';
        const $userSchema = z.string();
      `,
      options: [{ before: '$', after: 'Schema' }],
    },
    {
      name: 'destructured declaration has no single name to check',
      code: dedent`
        import * as z from 'zod';
        const { shape } = z.object({ a: z.string() });
      `,
    },
    {
      name: 'non-schema helper results are not schemas',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.string();
        const json = z.toJSONSchema(userSchema);
        const reg = z.registry();
        const loc = z.locales.en();
      `,
    },
  ],

  invalid: [
    {
      name: 'namespace (missing suffix)',
      code: dedent`
        import * as z from 'zod';
        const myVar = z.string();
      `,
      errors: [
        {
          messageId: 'invalidName',
          data: { expected: 'myVarSchema' },
        },
      ],
      output: null,
    },
    {
      name: 'named import (missing suffix)',
      code: dedent`
        import { string } from 'zod';
        const myVar = string();
      `,
      errors: [
        {
          messageId: 'invalidName',
          data: { expected: 'myVarSchema' },
        },
      ],
      output: null,
    },
    {
      name: 'named import with chained method (missing suffix)',
      code: dedent`
        import { string } from 'zod';
        const myVar = string().min(1);
      `,
      errors: [
        {
          messageId: 'invalidName',
          data: { expected: 'myVarSchema' },
        },
      ],
      output: null,
    },
    {
      name: 'schema with chained methods (missing suffix)',
      code: dedent`
        import * as z from 'zod';
        const myVar = z.string().min(1);
      `,
      errors: [
        {
          messageId: 'invalidName',
          data: { expected: 'myVarSchema' },
        },
      ],
      output: null,
    },
    {
      name: 'schema with chained methods (named, missing suffix)',
      code: dedent`
        import { string } from 'zod';
        const myVar = string().min(1);
      `,
      errors: [
        {
          messageId: 'invalidName',
          data: { expected: 'myVarSchema' },
        },
      ],
      output: null,
    },
    {
      name: 'snake_case suffix',
      code: dedent`
        import * as z from 'zod';
        const my_string = z.string()
      `,
      options: [{ after: '_schema' }],
      errors: [
        {
          messageId: 'invalidName',
          data: { expected: 'my_string_schema' },
        },
      ],
      output: null,
    },
    {
      name: 'snake_case suffix (named)',
      code: dedent`
        import { string } from 'zod';
        const my_string = string();
      `,
      options: [{ after: '_schema' }],
      errors: [
        {
          messageId: 'invalidName',
          data: { expected: 'my_string_schema' },
        },
      ],
      output: null,
    },
    {
      name: 'missing prefix only',
      code: dedent`
        import * as z from 'zod';
        const user = z.string();
      `,
      options: [{ before: '$', after: '' }],
      errors: [
        {
          messageId: 'invalidName',
          data: { expected: '$user' },
        },
      ],
      output: null,
    },
    {
      name: 'missing prefix (named import)',
      code: dedent`
        import { string } from 'zod';
        const user = string();
      `,
      options: [{ before: '$', after: '' }],
      errors: [
        {
          messageId: 'invalidName',
          data: { expected: '$user' },
        },
      ],
      output: null,
    },
    {
      name: 'missing prefix with default suffix',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
      `,
      options: [{ before: '$', after: 'Schema' }],
      errors: [{ messageId: 'invalidName', data: { expected: '$Schema' } }],
      output: null,
    },
    {
      name: 'missing suffix with bare prefix token',
      code: dedent`
        import * as z from 'zod';
        const foo = z.string();
      `,
      options: [{ before: 'Foo', after: 'Schema' }],
      errors: [{ messageId: 'invalidName', data: { expected: 'FooSchema' } }],
      output: null,
    },
    {
      name: 'missing both prefix and suffix',
      code: dedent`
        import * as z from 'zod';
        const user = z.string();
      `,
      options: [{ before: '$', after: 'Schema' }],
      errors: [
        {
          messageId: 'invalidName',
          data: { expected: '$userSchema' },
        },
      ],
      output: null,
    },
    {
      name: 'has suffix but missing prefix',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.string();
      `,
      options: [{ before: '$', after: 'Schema' }],
      errors: [
        {
          messageId: 'invalidName',
          data: { expected: '$userSchema' },
        },
      ],
      output: null,
    },
    {
      name: 'has prefix but missing suffix',
      code: dedent`
        import * as z from 'zod';
        const $user = z.string();
      `,
      options: [{ before: '$', after: 'Schema' }],
      errors: [
        {
          messageId: 'invalidName',
          data: { expected: '$userSchema' },
        },
      ],
      output: null,
    },
  ],
});
