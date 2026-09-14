import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noDynamicSchemaValue } from './no-dynamic-schema-value.js';

const ruleTester = new RuleTester();

ruleTester.run(noDynamicSchemaValue.name, noDynamicSchemaValue, {
  valid: [
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
      name: 'optional member access as an argument',
      code: dedent`
        import * as z from 'zod/mini';
        import { isValid, config } from './helpers.js';
        const schema = z.string().check(z.refine(isValid, config?.message));
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
