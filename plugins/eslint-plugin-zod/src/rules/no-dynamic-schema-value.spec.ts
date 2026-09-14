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
        import * as z from 'zod';
        const schema = z.string().min(1, 'too short');
      `,
    },
    {
      name: 'imported bindings used as arguments',
      code: dedent`
        import * as z from 'zod';
        import { isValid, errorMessage } from './helpers.js';
        const schema = z.string().refine(isValid, errorMessage);
      `,
    },
    {
      name: 'top-level const whose initializer is itself static',
      code: dedent`
        import * as z from 'zod';
        import { errorMessage } from './helpers.js';
        const message = errorMessage;
        const schema = z.string().refine((value) => value.length > 0, message);
      `,
    },
    {
      name: 'inline callback passed to refine',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string().refine((value) => value.length > 0);
      `,
    },
    {
      // zod-compiler compiles a refine/transform/superRefine callback whether
      // or not it captures — a zero-capture one is inlined, a capturing one
      // called by reference — so the callback itself is never flagged.
      name: 'callback capturing a mutable outer variable',
      code: dedent`
        import * as z from 'zod';
        let threshold = 5;
        const schema = z.string().refine((value) => value.length > threshold);
      `,
    },
    {
      name: 'template literal interpolating a static value',
      code: dedent`
        import * as z from 'zod';
        import { errorMessage } from './helpers.js';
        const schema = z.string().min(1, \`error: \${errorMessage}\`);
      `,
    },
    {
      name: 'conditional expression with static branches',
      code: dedent`
        import * as z from 'zod';
        import { isDev, devMessage, prodMessage } from './helpers.js';
        const schema = z.string().min(1, isDev ? devMessage : prodMessage);
      `,
    },
    {
      name: 'logical and binary expressions with static operands',
      code: dedent`
        import * as z from 'zod';
        import { errorMessage } from './helpers.js';
        const schema = z.string().min(1, errorMessage && 'fallback');
        const schema2 = z.string().min(1, 'prefix: ' + errorMessage);
      `,
    },
    {
      name: 'unary expression with a static operand',
      code: dedent`
        import * as z from 'zod';
        const schema = z.number().default(-1);
      `,
    },
    {
      name: 'TS assertions on a static value',
      code: dedent`
        import * as z from 'zod';
        import { errorMessage } from './helpers.js';
        const schema = z.string().min(1, errorMessage as string);
        const schema2 = z.string().min(1, errorMessage!);
      `,
    },
    {
      name: 'nested schema declaration',
      code: dedent`
        import * as z from 'zod';
        const schema = z.object({ name: z.string() });
      `,
    },
    {
      name: 'array argument with a hole, a literal, and a static spread',
      code: dedent`
        import * as z from 'zod';
        import { rest } from './helpers.js';
        const schema = z.enum(['a', , ...rest]);
      `,
    },
  ],
  invalid: [
    {
      name: 'factory called with a dynamic value',
      code: dedent`
        import * as z from 'zod';
        function getErrorMessage() { return 'bad'; }
        const schema = z.string(getErrorMessage());
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'computed factory access called with a dynamic value',
      code: dedent`
        import * as z from 'zod';
        function getErrorMessage() { return 'bad'; }
        const schema = z['string'](getErrorMessage());
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'chained method called with a dynamic value',
      code: dedent`
        import * as z from 'zod';
        import { isValid } from './helpers.js';
        function getErrorMessage() { return 'bad'; }
        const schema = z.string().refine(isValid, getErrorMessage());
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'new expression as a default value',
      code: dedent`
        import * as z from 'zod';
        const schema = z.date().default(new Date());
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'this expression as an argument',
      code: dedent`
        import * as z from 'zod';
        import { isValid } from './helpers.js';
        class Validator {
          message = 'bad';
          build() {
            return z.string().refine(isValid, this.message);
          }
        }
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'mutable local variable used as an argument',
      code: dedent`
        import * as z from 'zod';
        import { isValid } from './helpers.js';
        let message = 'bad';
        const schema = z.string().refine(isValid, message);
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'function parameter used as an argument',
      code: dedent`
        import * as z from 'zod';
        import { isValid } from './helpers.js';
        function buildSchema(message) {
          return z.string().refine(isValid, message);
        }
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'optional member access as an argument',
      code: dedent`
        import * as z from 'zod';
        import { isValid, config } from './helpers.js';
        const schema = z.string().refine(isValid, config?.message);
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
    {
      name: 'unresolvable identifier used as an argument',
      code: dedent`
        import * as z from 'zod';
        import { isValid } from './helpers.js';
        const schema = z.string().refine(isValid, unknownGlobalValue);
      `,
      errors: [{ messageId: 'dynamicValue' }],
    },
  ],
});
