import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { consistentSchemaVarName } from './consistent-schema-var-name.js';

const ruleTester = new RuleTester();

ruleTester.run(consistentSchemaVarName.name, consistentSchemaVarName, {
  valid: [
    {
      name: 'valid (default suffix)',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.string();
      `,
    },
    {
      name: 'valid suffix only (default suffix)',
      code: dedent`
        import * as z from 'zod/mini';
        const schema = z.string();
        const Schema = z.string();
        const SCHEMA = z.string();
      `,
    },
    {
      name: 'named import',
      code: dedent`
        import { string } from 'zod/mini';
        const userSchema = string();
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
      name: 'with parse()',
      code: dedent`
        import * as z from 'zod/mini';
        const value = z.string().parse("asd")
      `,
    },
    {
      name: 'ignores z.validate / z.validateAsync (namespace import)',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ name: z.string() });
        const isValid = z.validate(userSchema, input);
        const isValidLater = z.validateAsync(userSchema, input);
      `,
    },
    {
      name: 'ignores validate / validateAsync (named import)',
      code: dedent`
        import { object, string, validate, validateAsync } from 'zod/mini';
        const userSchema = object({ name: string() });
        const isValid = validate(userSchema, input);
        const isValidLater = validateAsync(userSchema, input);
      `,
    },
    {
      name: 'ignores non-zod/mini',
      code: dedent`
        import * as z from 'zod/mini';
        const myVar = 1
      `,
    },
    {
      name: 'not triggered on zod import',
      code: dedent`
        import * as z from 'zod';
        const myVar = z.string();
      `,
    },
    {
      name: 'custom suffix',
      code: dedent`
        import * as z from 'zod/mini';
        const userVar = z.string();
      `,
      options: [{ after: 'Var' }],
    },
    {
      name: 'custom suffix bare token (case-insensitive)',
      code: dedent`
        import * as z from 'zod/mini';
        const bar = z.string();
        const Bar = z.string();
        const BAR = z.string();
      `,
      options: [{ after: 'Bar' }],
    },
    {
      name: 'prefix only',
      code: dedent`
        import * as z from 'zod/mini';
        const $user = z.string();
      `,
      options: [{ before: '$', after: '' }],
    },
    {
      name: 'prefix only (case-insensitive)',
      code: dedent`
        import * as z from 'zod/mini';
        const foo = z.string();
        const Foo = z.string();
        const FOO = z.string();
      `,
      options: [{ before: 'foo', after: '' }],
    },
    {
      name: 'both prefix and suffix',
      code: dedent`
        import * as z from 'zod/mini';
        const $userSchema = z.string();
      `,
      options: [{ before: '$', after: 'Schema' }],
    },
    {
      name: 'zod/v4-mini import',
      code: dedent`
        import * as z from 'zod/v4-mini';
        const userSchema = z.string();
      `,
    },
    {
      name: 'non-schema helper results are not schemas',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.string();
        const json = z.toJSONSchema(userSchema);
        const reg = z.registry();
        const loc = z.locales.en();
      `,
    },
    {
      name: 'a standalone check is not a schema',
      code: dedent`
        import * as z from 'zod/mini';
        const atLeastOne = z.minLength(1);
      `,
    },
  ],

  invalid: [
    {
      name: 'namespace (missing suffix)',
      code: dedent`
        import * as z from 'zod/mini';
        const myVar = z.string();
      `,
      errors: [{ messageId: 'invalidName', data: { expected: 'myVarSchema' } }],
      output: null,
    },
    {
      name: 'named import (missing suffix)',
      code: dedent`
        import { string } from 'zod/mini';
        const myVar = string();
      `,
      errors: [{ messageId: 'invalidName', data: { expected: 'myVarSchema' } }],
      output: null,
    },
    {
      name: 'missing prefix only',
      code: dedent`
        import * as z from 'zod/mini';
        const user = z.string();
      `,
      options: [{ before: '$', after: '' }],
      errors: [{ messageId: 'invalidName', data: { expected: '$user' } }],
      output: null,
    },
    {
      name: 'missing prefix with default suffix',
      code: dedent`
        import * as z from 'zod/mini';
        const schema = z.string();
      `,
      options: [{ before: '$', after: 'Schema' }],
      errors: [{ messageId: 'invalidName', data: { expected: '$Schema' } }],
      output: null,
    },
    {
      name: 'missing suffix with bare prefix token',
      code: dedent`
        import * as z from 'zod/mini';
        const foo = z.string();
      `,
      options: [{ before: 'Foo', after: 'Schema' }],
      errors: [{ messageId: 'invalidName', data: { expected: 'FooSchema' } }],
      output: null,
    },
    {
      name: 'missing both prefix and suffix',
      code: dedent`
        import * as z from 'zod/mini';
        const user = z.string();
      `,
      options: [{ before: '$', after: 'Schema' }],
      errors: [{ messageId: 'invalidName', data: { expected: '$userSchema' } }],
      output: null,
    },
    {
      name: 'zod/v4-mini import (missing suffix)',
      code: dedent`
        import * as z from 'zod/v4-mini';
        const myVar = z.string();
      `,
      errors: [{ messageId: 'invalidName', data: { expected: 'myVarSchema' } }],
      output: null,
    },
  ],
});
