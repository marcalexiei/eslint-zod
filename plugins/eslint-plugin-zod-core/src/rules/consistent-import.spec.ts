import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { consistentImport } from './consistent-import.js';

const ruleTester = new RuleTester();

ruleTester.run(`${consistentImport.name} (namespace)`, consistentImport, {
  valid: [
    {
      name: 'namespace import',
      code: dedent`
        import * as core from 'zod/v4/core';
        const mySchema = new core.$ZodString({ type: 'string', checks: [] });
      `,
    },
    {
      name: 'non-zod-core import',
      code: dedent`
        import * as z from 'zod';
        const mySchema = z.string();
      `,
    },
    {
      name: 'type-only namespace import',
      code: dedent`
        import type * as core from 'zod/v4/core';
        type MyType = core.output<typeof mySchema>;
      `,
    },
  ],
  invalid: [
    {
      name: 'named import — converted to namespace',
      code: dedent`
        import { $ZodString } from 'zod/v4/core';
        const mySchema = new $ZodString({ type: 'string', checks: [] });
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'namespace' } },
        { messageId: 'convertUsage', data: { syntax: 'namespace' } },
      ],
      output: dedent`
        import * as z from 'zod/v4/core';
        const mySchema = new z.$ZodString({ type: 'string', checks: [] });
      `,
    },
  ],
});
