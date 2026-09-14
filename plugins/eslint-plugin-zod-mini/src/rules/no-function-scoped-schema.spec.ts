import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noFunctionScopedSchema } from './no-function-scoped-schema.js';

const ruleTester = new RuleTester();

ruleTester.run(noFunctionScopedSchema.name, noFunctionScopedSchema, {
  valid: [
    {
      name: 'not zod',
      code: 'const schema = something();',
    },
    {
      name: 'module-scoped schema',
      code: dedent`
        import * as z from 'zod/mini';
        const schema = z.string();
      `,
    },
    {
      name: 'module-scoped nested schema',
      code: dedent`
        import * as z from 'zod/mini';
        const schema = z.object({ name: z.string() });
      `,
    },
    {
      name: 'module-scoped schema used inside a function',
      code: dedent`
        import * as z from 'zod/mini';
        const schema = z.string();
        function validate(value) {
          return schema.parse(value);
        }
      `,
    },
  ],
  invalid: [
    {
      name: 'arrow function returning a schema',
      code: dedent`
        import * as z from 'zod/mini';
        const getSchema = () => z.string();
      `,
      errors: [{ messageId: 'functionScopedSchema' }],
    },
    {
      name: 'schema declared in an arrow function block',
      code: dedent`
        import * as z from 'zod/mini';
        const validate = (value) => {
          const schema = z.string();
          return schema.parse(value);
        };
      `,
      errors: [{ messageId: 'functionScopedSchema' }],
    },
    {
      name: 'schema declared in a function declaration',
      code: dedent`
        import * as z from 'zod/mini';
        function validate(value) {
          const schema = z.string();
          return schema.parse(value);
        }
      `,
      errors: [{ messageId: 'functionScopedSchema' }],
    },
    {
      name: 'nested schema built inside a function reports once',
      code: dedent`
        import * as z from 'zod/mini';
        function buildSchema() {
          return z.object({ name: z.string() });
        }
      `,
      errors: [{ messageId: 'functionScopedSchema' }],
    },
  ],
});
