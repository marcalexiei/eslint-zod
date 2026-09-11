import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { arrayStyle } from './array-style.js';

const ruleTester = new RuleTester();

ruleTester.run(`${arrayStyle.name} (function)`, arrayStyle, {
  valid: [
    {
      name: 'ignores a shadowed namespace in function style',
      code: 'import { z } from "zod"; function f(z) { return z.string().array(); }',
    },
    {
      name: 'ignores a type-only namespace in function style',
      code: 'import type { z } from "zod"; z.string().array();',
    },
    {
      name: 'namespace import',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string());
      `,
    },
    {
      name: 'named import',
      code: dedent`
        import { array, string } from 'zod';
        array(string());
      `,
    },
    {
      name: 'named z import',
      code: dedent`
        import { z } from 'zod';
        z.array(z.string());
      `,
    },
  ],
  invalid: [
    {
      name: 'namespace import',
      code: dedent`
        import * as z from 'zod';
        z.string().array();
      `,
      errors: [{ messageId: 'useFunction' }],
      output: dedent`
        import * as z from 'zod';
        z.array(z.string());
      `,
    },
    {
      name: 'named import',
      code: dedent`
        import { string } from 'zod';
        string().array();
      `,
      options: [{ style: 'function' }],
      errors: [{ messageId: 'useFunction' }],
      output: null,
    },
    {
      // https://github.com/marcalexiei/eslint-zod/issues/174
      name: 'named z import',
      code: dedent`
        import { z } from 'zod';
        z.string().array();
      `,
      errors: [{ messageId: 'useFunction' }],
      output: dedent`
        import { z } from 'zod';
        z.array(z.string());
      `,
    },
    {
      name: 'with method',
      code: dedent`
        import * as z from 'zod';
        z.string().trim().array();
      `,
      options: [{ style: 'function' }],
      errors: [{ messageId: 'useFunction' }],
      output: dedent`
        import * as z from 'zod';
        z.array(z.string().trim());
      `,
    },
    {
      name: 'named with method',
      code: dedent`
        import { string } from 'zod';
        string().trim().array();
      `,
      options: [{ style: 'function' }],
      errors: [{ messageId: 'useFunction' }],
      output: null,
    },
    {
      name: 'named with method followed by another method',
      code: dedent`
        import { string } from 'zod';
        string().trim().array().min(1);
      `,
      options: [{ style: 'function' }],
      errors: [{ messageId: 'useFunction' }],
      output: null,
    },
    {
      // https://github.com/marcalexiei/eslint-zod/issues/232
      name: 'should keep additional methods in the chain after running the fixer (named z)',
      code: dedent`
        import { z } from "zod";

        export const testSchema = z
          .object({
            id: z.uuid(),
          })
          .array()
          .optional();
      `,
      options: [{ style: 'function' }],
      errors: [{ messageId: 'useFunction' }],
      output: dedent`
        import { z } from "zod";

        export const testSchema = z.array(z
          .object({
            id: z.uuid(),
          }))
          .optional();
      `,
    },
  ],
});

ruleTester.run(`${arrayStyle.name} (method)`, arrayStyle, {
  valid: [
    {
      name: 'namespace',
      code: dedent`
        import * as z from 'zod';
        z.string().array();
      `,
      options: [{ style: 'method' }],
    },
    {
      name: 'named',
      code: dedent`
        import { string } from 'zod';
        string().array();
      `,
      options: [{ style: 'method' }],
    },
  ],
  invalid: [
    {
      name: 'namespace',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string());
      `,
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: dedent`
        import * as z from 'zod';
        z.string().array();
      `,
    },
    {
      name: 'named',
      code: dedent`
        import { array, string } from 'zod';
        array(string());
      `,
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: null,
    },
    {
      name: 'namespace with method',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string().trim());
      `,
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: dedent`
        import * as z from 'zod';
        z.string().trim().array();
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod/issues/148
      name: 'works with nested schema with chained methods',
      code: dedent`
        import * as z from 'zod';
        const Schema = z.object({
          items: z.array(z.string()).optional(),
        });
      `,
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: dedent`
        import * as z from 'zod';
        const Schema = z.object({
          items: z.string().array().optional(),
        });
      `,
    },
    {
      name: 'named with method',
      code: dedent`
        import { array, string } from 'zod';
        array(string().trim());
      `,
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: null,
    },
    {
      name: 'computed access is reported but not fixed — the chain walker cannot name it',
      code: dedent`
        import * as z from 'zod';
        z['array'](z.string());
      `,
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: null,
    },
    {
      name: 'z.array() without an inner schema is reported but not fixed',
      code: dedent`
        import * as z from 'zod';
        z.array();
      `,
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: null,
    },
  ],
});

ruleTester.run(`${arrayStyle.name} (method fix safety)`, arrayStyle, {
  valid: [],
  invalid: [
    {
      name: 'preserves array creation parameters',
      code: 'import { z } from "zod"; z.array(z.string(), { error: "Expected a list" });',
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: null,
    },
    {
      name: 'preserves v3 array creation parameters',
      code: 'import { z } from "zod/v3"; z.array(z.string(), { invalid_type_error: "Expected a list" });',
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: null,
    },
    {
      name: 'does not turn a spread argument into an invalid expression',
      code: 'import { z } from "zod"; z.array(...schemas);',
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: null,
    },
    {
      name: 'preserves explicitly widened element schema types',
      code: 'import { z } from "zod"; z.array<z.ZodType<string>>(z.literal("x"));',
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: null,
    },
    {
      name: 'does not discard comments around the element schema',
      code: 'import { z } from "zod"; z.array(/* keep this */ z.string());',
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: null,
    },
    {
      name: 'does not change conditional expression precedence',
      code: 'import { z } from "zod"; z.array(flag ? z.string() : z.number());',
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: null,
    },
    {
      name: 'does not change sequence expression precedence',
      code: 'import { z } from "zod"; z.array((record(), z.string()));',
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: null,
    },
    {
      name: 'does not move a type assertion onto the array schema',
      code: 'import { z } from "zod"; z.array(schema as z.ZodString);',
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: null,
    },
    {
      name: 'preserves comments inside the element schema',
      code: 'import { z as schema } from "zod"; schema.array(schema.string(/* keep this */));',
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: 'import { z as schema } from "zod"; schema.string(/* keep this */).array();',
    },
    {
      name: 'keeps fixing a parenthesized factory call',
      code: 'import { z } from "zod"; z.array((z.string())).optional();',
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: 'import { z } from "zod"; z.string().array().optional();',
    },
    ...[
      'z.array?.(z.string())',
      'z?.array(z.string())',
      'z.array(factory?.())',
      'z.array(schemas?.element)',
      'z.array(z.string() /* keep this */)',
      'z./* keep this */array(z.string())',
    ].map((expression) => ({
      name: `does not fix ${expression}`,
      code: `import { z } from "zod"; ${expression};`,
      options: [{ style: 'method' }] as const,
      errors: [{ messageId: 'useMethod' as const }],
      output: null,
    })),
    ...['schema', 'schemas.element'].map((expression) => ({
      name: `fixes ${expression}`,
      code: `import { z } from "zod"; z.array(${expression});`,
      options: [{ style: 'method' }] as const,
      errors: [{ messageId: 'useMethod' as const }],
      output: `import { z } from "zod"; ${expression}.array();`,
    })),
  ],
});

ruleTester.run(`${arrayStyle.name} (import scope)`, arrayStyle, {
  valid: [
    'import { z } from "zod"; function f(z) { return z.array(schema); }',
    'import * as z from "zod"; { const z = other; z.array(schema); }',
    'import { z } from "zod"; { z.array(schema); const z = other; }',
    'import { z } from "zod"; try {} catch (z) { z.array(schema); }',
    'import { array } from "zod"; function f(array) { return array(schema); }',
    'import type { z } from "zod"; z.array(schema);',
    'import { type z } from "zod"; z.array(schema);',
    'import type * as z from "zod"; z.array(schema);',
    'import type z from "zod"; z.array(schema);',
  ].map((code) => ({ code, options: [{ style: 'method' }] })),
  invalid: [
    {
      name: 'a shadowed use does not hide a real import use',
      code: 'import { z } from "zod"; function f(z) { return z.array(schema); } z.array(schema);',
      options: [{ style: 'method' }],
      errors: [{ messageId: 'useMethod' }],
      output: 'import { z } from "zod"; function f(z) { return z.array(schema); } schema.array();',
    },
    ...['import z from "zod";', 'import * as z from "zod/v4";', 'import { z } from "zod/v3";'].map(
      (statement) => ({
        code: `${statement} z.array(schema);`,
        options: [{ style: 'method' }] as const,
        errors: [{ messageId: 'useMethod' as const }],
        output: `${statement} schema.array();`,
      }),
    ),
  ],
});
