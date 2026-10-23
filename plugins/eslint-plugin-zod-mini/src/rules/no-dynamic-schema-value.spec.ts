import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noDynamicSchemaValue } from './no-dynamic-schema-value.js';

const ruleTester = new RuleTester();

ruleTester.run(noDynamicSchemaValue.name, noDynamicSchemaValue, {
  valid: [
    {
      name: 'the input of a parse call is not a schema value',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().parse(process.env.FOO);
        z.string().safeParse(input);
      `,
    },
    {
      name: 'not zod',
      code: 'something(getErrorMessage());',
    },
    {
      name: 'literal arguments',
      code: dedent`
        import * as z from 'zod/mini';
        const schema = z.string().check(z.minLength(1));
      `,
    },
    {
      name: 'imported bindings used as arguments',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid, errorMessage } from './helpers.js';
        const schema = z.string().check(z.refine(isValid, errorMessage));
      `,
    },
    {
      name: 'top-level const whose initializer is itself static',
      code: dedent`
        import * as z from 'zod/mini';
        import { errorMessage } from './helpers.js';
        const message = errorMessage;
        const schema = z.string().check(z.refine((value) => value.length > 0, message));
      `,
    },
    {
      name: 'inline callback passed to refine',
      code: dedent`
        import * as z from 'zod/mini';
        const schema = z.string().check(z.refine((value) => value.length > 0));
      `,
    },
    {
      // zod-compiler compiles a refine/transform/superRefine callback whether
      // or not it captures — a zero-capture one is inlined, a capturing one
      // called by reference — so the callback itself is never flagged.
      name: 'callback capturing a mutable outer variable',
      code: dedent`
        import * as z from 'zod/mini';
        let threshold = 5;
        const schema = z.string().check(z.refine((value) => value.length > threshold));
      `,
    },
    {
      name: 'template literal interpolating a static value',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid, errorMessage } from './helpers.js';
        const schema = z.string().check(z.refine(isValid, \`error: \${errorMessage}\`));
      `,
    },
    {
      name: 'conditional expression with static branches',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid, isDev, devMessage, prodMessage } from './helpers.js';
        const schema = z.string().check(z.refine(isValid, isDev ? devMessage : prodMessage));
      `,
    },
    {
      name: 'logical and binary expressions with static operands',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid, errorMessage } from './helpers.js';
        const schema = z.string().check(z.refine(isValid, errorMessage && 'fallback'));
        const schema2 = z.string().check(z.refine(isValid, 'prefix: ' + errorMessage));
      `,
    },
    {
      name: 'unary expression with a static operand',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid } from './helpers.js';
        const schema = z.number().check(z.refine(isValid, -1));
      `,
    },
    {
      name: 'TS assertions on a static value',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid, errorMessage } from './helpers.js';
        const schema = z.string().check(z.refine(isValid, errorMessage as string));
        const schema2 = z.string().check(z.refine(isValid, errorMessage!));
      `,
    },
    {
      name: 'nested schema declaration',
      code: dedent`
        import * as z from 'zod/mini';
        const schema = z.object({ name: z.string() });
      `,
    },
    {
      name: 'array argument with a hole, a literal, and a static spread',
      code: dedent`
        import * as z from 'zod/mini';
        import { rest } from './helpers.js';
        const schema = z.enum(['a', , ...rest]);
      `,
    },
    {
      name: 'module-scope function declaration passed as an argument',
      code: dedent`
        import * as z from 'zod/mini';
        function isValid(value) { return value.length > 0; }
        const schema = z.string().check(z.refine(isValid));
      `,
    },
    {
      name: 'non-schema helpers take runtime values by design',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.string();
        const pretty = z.prettifyError(err);
        const json = z.toJSONSchema(userSchema);
        z.config({ customError: makeError() });
        z.globalRegistry.add(userSchema, { id: makeId() });
      `,
    },
    {
      name: 'input parsed by a schema reached through a property access',
      code: dedent`
        import * as z from 'zod/mini';
        const user = z.object({ name: z.string() });
        function parseName(input: unknown) {
          return user.shape.name.parse(input);
        }
        function parseInline(input: unknown) {
          return z.object({ name: z.string() }).shape.name.parse(input);
        }
      `,
    },
    {
      name: 'method called on a parse result',
      code: dedent`
        import * as z from 'zod/mini';
        function readTags(body: unknown, separator: string) {
          return z.object({ tags: z.string() }).parse(body).tags.split(separator);
        }
      `,
    },
    {
      name: 'schema method called on a local schema',
      code: dedent`
        import * as z from 'zod/mini';
        const base = z.object({});
        const branded = base.brand<'Base'>();
        const union = z.union([base, branded]);
        const name = z.string();
        const user = z.object({ name: name.check(z.minLength(1)) });
        const typed = z.object({}) satisfies z.ZodMiniObject;
        const wrapped = z.union([typed.brand<'Typed'>()]);
      `,
    },
    {
      name: 'shape of a local schema spread into another',
      code: dedent`
        import * as z from 'zod/mini';
        const base = z.object({ name: z.string() });
        const extended = z.object({ ...base.shape, age: z.number() });
      `,
    },
    {
      name: 'member access on a static value',
      code: dedent`
        import * as z from 'zod/mini';
        import { config } from './helpers.js';
        const messages = { short: 'too short' };
        const schema = z.string().check(z.minLength(1, config.message));
        const schema2 = z.string().check(z.minLength(1, messages['short']));
        const schema3 = z.string().check(z.minLength(1, config?.message));
      `,
    },
    {
      name: 'method on a local schema read through a literal key',
      code: dedent`
        import * as z from 'zod/mini';
        const base = z.object({});
        const computed = z.union([base['brand']()]);
      `,
    },
    {
      name: 'input parsed by a local schema',
      code: dedent`
        import * as z from 'zod/mini';
        import { input } from './helpers.js';
        const base = z.object({});
        base.parse(input);
        base.brand<'Base'>().safeParse(input);
      `,
    },
  ],

  invalid: [
    {
      name: 'factory called with a dynamic value',
      code: dedent`
        import * as z from 'zod/mini';
        function getErrorMessage() { return 'bad'; }
        const schema = z.string(getErrorMessage());
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'computed factory access called with a dynamic value',
      code: dedent`
        import * as z from 'zod/mini';
        function getErrorMessage() { return 'bad'; }
        const schema = z['string'](getErrorMessage());
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'check argument called with a dynamic value',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid } from './helpers.js';
        function getErrorMessage() { return 'bad'; }
        const schema = z.string().check(z.refine(isValid, getErrorMessage()));
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'new expression as an argument',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid } from './helpers.js';
        const schema = z.string().check(z.refine(isValid, new Date()));
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'this expression as an argument',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid } from './helpers.js';
        class Validator {
          message = 'bad';
          build() {
            return z.string().check(z.refine(isValid, this.message));
          }
        }
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'mutable local variable used as an argument',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid } from './helpers.js';
        let message = 'bad';
        const schema = z.string().check(z.refine(isValid, message));
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'function parameter used as an argument',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid } from './helpers.js';
        function buildSchema(message) {
          return z.string().check(z.refine(isValid, message));
        }
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'optional member access on a dynamic value',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid, getConfig } from './helpers.js';
        const schema = z.string().check(z.refine(isValid, getConfig()?.message));
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'computed member access with a dynamic key',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid, getKey } from './helpers.js';
        const messages = { short: 'too short' };
        const schema = z.string().check(z.refine(isValid, messages[getKey()]));
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'schema method on a local schema called with a dynamic value',
      code: dedent`
        import * as z from 'zod/mini';
        function getChecks() { return []; }
        const base = z.object({});
        const union = z.union([base, base.check(...getChecks())]);
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'local schema method called with a dynamic value at the top level',
      code: dedent`
        import * as z from 'zod/mini';
        function getChecks() { return []; }
        const base = z.object({});
        const extended = base.check(...getChecks());
        const union = z.union([extended]);
      `,
      errors: [{ messageId: 'dynamicValue', line: 4 }],
    },
    {
      name: 'parse results used as arguments',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid, input } from './helpers.js';
        const env = z.object({ HOST: z.string() }).parse(process.env);
        const host = z.string().parse(process.env.HOST);
        const result = z.string().safeParse(input);
        const schema = z.string().check(z.refine(isValid, env.HOST));
        const schema2 = z.string().check(z.refine(isValid, host));
        const schema3 = z.string().check(z.refine(isValid, result.data));
      `,
      errors: [
        { messageId: 'dynamicValue', line: 6 },
        { messageId: 'dynamicValue', line: 7 },
        { messageId: 'dynamicValue', line: 8 },
      ],
    },
    {
      name: 'method called on a helper result',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid, error } from './helpers.js';
        const message = z.prettifyError(error);
        const schema = z.string().check(z.refine(isValid, message.trim()));
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'method called on a const that is not a schema',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid } from './helpers.js';
        const helpers = { message: () => 'bad' };
        const schema = z.string().check(z.refine(isValid, helpers.message()));
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'parse result of a local schema used as an argument',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid, raw } from './helpers.js';
        const fallback = z.string();
        const schema = z.string().check(z.refine(isValid, fallback.parse(raw)));
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      // An import is not provably a schema, so a method called on one is not resolved.
      name: 'schema method called on an imported schema',
      code: dedent`
        import * as z from 'zod/mini';
        import { base } from './schemas.js';
        const user = z.object({ base: base.brand<'Base'>() });
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'unresolvable identifier used as an argument',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid } from './helpers.js';
        const schema = z.string().check(z.refine(isValid, unknownGlobalValue));
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'self-referential const does not recurse forever',
      code: dedent`
        import * as z from 'zod/mini';
        const message = message;
        const schema = z.string().check(z.minLength(1, message));
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
  ],
});
