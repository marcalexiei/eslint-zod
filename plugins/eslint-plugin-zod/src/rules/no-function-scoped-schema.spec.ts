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
        import * as z from 'zod';
        const schema = z.string();
      `,
    },
    {
      name: 'module-scoped nested schema',
      code: dedent`
        import * as z from 'zod';
        const schema = z.object({ name: z.string() });
      `,
    },
    {
      name: 'module-scoped schema used inside a function',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        function validate(value) {
          return schema.parse(value);
        }
      `,
    },
    {
      name: 'module-scoped recursive schema using a getter',
      code: dedent`
        import * as z from 'zod';
        const Category = z.object({
          name: z.string(),
          get subcategories() {
            return z.array(Category);
          },
        });
      `,
    },
    {
      name: 'module-scoped schema wrapped in z.lazy',
      code: dedent`
        import * as z from 'zod';
        const Category = z.lazy(() => z.object({ name: z.string() }));
      `,
    },
    {
      name: 'non-schema helpers called inside a function',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        function toJson() {
          return z.toJSONSchema(schema);
        }
        function format(err) {
          return z.prettifyError(err);
        }
      `,
    },
    {
      name: 'named non-schema helper called inside a function',
      code: dedent`
        import { prettifyError } from 'zod';
        function format(err) {
          return prettifyError(err);
        }
      `,
    },
    {
      name: 'module-scoped iso schema',
      code: dedent`
        import * as z from 'zod';
        const schema = z.iso.datetime();
      `,
    },
  ],
  invalid: [
    {
      name: 'arrow function returning a schema',
      code: dedent`
        import * as z from 'zod';
        const getSchema = () => z.string();
      `,
      errors: [{ messageId: 'functionScopedSchema' }],
    },
    {
      name: 'schema declared in an arrow function block',
      code: dedent`
        import * as z from 'zod';
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
        import * as z from 'zod';
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
        import * as z from 'zod';
        function buildSchema() {
          return z.object({ name: z.string() });
        }
      `,
      errors: [{ messageId: 'functionScopedSchema' }],
    },
    {
      name: 'recursive getter schema declared inside a function',
      code: dedent`
        import * as z from 'zod';
        function buildSchema() {
          const Category = z.object({
            name: z.string(),
            get subcategories() {
              return z.array(Category);
            },
          });
          return Category;
        }
      `,
      errors: [{ messageId: 'functionScopedSchema' }],
    },
    {
      name: 'z.lazy schema declared inside a function',
      code: dedent`
        import * as z from 'zod';
        function buildSchema() {
          return z.lazy(() => z.object({ name: z.string() }));
        }
      `,
      errors: [{ messageId: 'functionScopedSchema' }],
    },
    {
      name: 'iso schema built inside a function',
      code: dedent`
        import * as z from 'zod';
        function buildSchema() {
          return z.iso.datetime();
        }
      `,
      errors: [{ messageId: 'functionScopedSchema' }],
    },
    {
      name: 'schema passed to a non-schema helper inside a function',
      code: dedent`
        import * as z from 'zod';
        function toJson() {
          return z.toJSONSchema(z.string());
        }
      `,
      errors: [{ messageId: 'functionScopedSchema' }],
    },
  ],
});
