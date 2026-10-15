import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noSchemaWithIsNullable } from './no-schema-with-is-nullable.js';

const ruleTester = new RuleTester();

ruleTester.run(noSchemaWithIsNullable.name, noSchemaWithIsNullable, {
  valid: [
    {
      name: 'z.string() without isNullable',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string().nullable();
      `,
    },
    {
      name: 'schema variable is not modeled',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string().nullable();
        void schema.isNullable();
      `,
    },
    {
      name: 'isNullable on non-zod chain',
      code: dedent`
        const value = makeSchema().isNullable();
      `,
    },
    {
      name: 'string() without isNullable - named import',
      code: dedent`
        import { string } from 'zod';
        const schema = string().nullable();
      `,
    },
    {
      name: 'non-schema producing zod method in chain',
      code: dedent`
        import * as z from 'zod';
        interface Column { isNullable(): boolean }
        void z.custom<Column>().parse(column).isNullable();
      `,
    },
    {
      name: 'z.string() without isNullable - named z import',
      code: dedent`
        import { z } from 'zod';
        const schema = z.string().nullable();
      `,
    },
  ],
  invalid: [
    {
      name: 'z.string().isNullable()',
      code: dedent`
        import * as z from 'zod';
        void z.string().isNullable();
      `,
      errors: [{ messageId: 'useSafeParse' }],
    },
    {
      name: 'z.string().nullable().isNullable()',
      code: dedent`
        import * as z from 'zod';
        void z.string().nullable().isNullable();
      `,
      errors: [{ messageId: 'useSafeParse' }],
    },
    {
      name: 'string().isNullable() - named import',
      code: dedent`
        import { string } from 'zod';
        void string().isNullable();
      `,
      errors: [{ messageId: 'useSafeParse' }],
    },
    {
      name: 'z.string().isNullable() - named z import',
      code: dedent`
        import { z } from 'zod';
        void z.string().isNullable();
      `,
      errors: [{ messageId: 'useSafeParse' }],
    },
  ],
});
