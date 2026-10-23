import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noSchemaWithIsOptional } from './no-schema-with-is-optional.js';

const ruleTester = new RuleTester();

ruleTester.run(noSchemaWithIsOptional.name, noSchemaWithIsOptional, {
  valid: [
    {
      name: 'z.string() without isOptional',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string().optional();
      `,
    },
    {
      name: 'schema bound to a binding that can change',
      code: dedent`
        import * as z from 'zod';
        import { userSchema } from './schemas.js';
        let schema = z.string().optional();
        void schema.isOptional();
        void userSchema.isOptional();
      `,
    },
    {
      name: 'isOptional on non-zod chain',
      code: dedent`
        const value = makeSchema().isOptional();
      `,
    },
    {
      name: 'string() without isOptional - named import',
      code: dedent`
        import { string } from 'zod';
        const schema = string().optional();
      `,
    },
    {
      name: 'non-schema producing zod method in chain',
      code: dedent`
        import * as z from 'zod';
        interface Column { isOptional(): boolean }
        void z.custom<Column>().parse(column).isOptional();
      `,
    },
    {
      name: 'z.string() without isOptional - named z import',
      code: dedent`
        import { z } from 'zod';
        const schema = z.string().optional();
      `,
    },
  ],
  invalid: [
    {
      name: 'schema bound to a const',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string().optional();
        const nested = schema.array();
        void schema.isOptional();
        void nested.optional().isOptional();
      `,
      errors: [
        { messageId: 'useSafeParse', line: 4 },
        { messageId: 'useSafeParse', line: 5 },
      ],
    },
    {
      name: 'z.string().isOptional()',
      code: dedent`
        import * as z from 'zod';
        void z.string().isOptional();
      `,
      errors: [{ messageId: 'useSafeParse' }],
    },
    {
      name: 'z.string().optional().isOptional()',
      code: dedent`
        import * as z from 'zod';
        void z.string().optional().isOptional();
      `,
      errors: [{ messageId: 'useSafeParse' }],
    },
    {
      name: 'string().isOptional() - named import',
      code: dedent`
        import { string } from 'zod';
        void string().isOptional();
      `,
      errors: [{ messageId: 'useSafeParse' }],
    },
    {
      name: 'z.string().isOptional() - named z import',
      code: dedent`
        import { z } from 'zod';
        void z.string().isOptional();
      `,
      errors: [{ messageId: 'useSafeParse' }],
    },
  ],
});
