import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { describe, expect, it } from 'vitest';

import { consistentImport } from './consistent-import.js';

const ruleTester = new RuleTester();

ruleTester.run(`${consistentImport.name} namespace`, consistentImport, {
  valid: [
    {
      name: 'namespace import',
      code: 'import * as z from "zod/mini";',
    },
    {
      name: 'aliased namespace import',
      code: 'import * as myZod from "zod/mini";',
    },
    {
      name: 'type namespace import',
      code: 'import type * as myZod from "zod/mini";',
    },
    {
      name: 'unrelated imports',
      code: 'import { useState } from "react";',
    },
    {
      name: 'zod/v4-mini namespace import',
      code: 'import * as z from "zod/v4-mini";',
    },
    {
      name: 'not triggered on zod import',
      code: 'import { z } from "zod";',
    },
  ],

  invalid: [
    {
      name: 'two namespace imports',
      code: dedent`
        import * as z from "zod/mini";
        import * as y from "zod/mini";
        const aSchema = y.string();
      `,
      errors: [
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'namespace' }, line: 3 },
      ],
      output: dedent`
        import * as z from "zod/mini";

        const aSchema = z.string();
      `,
    },
    {
      name: 'named import',
      code: dedent`
        import { z } from "zod/mini";
        const userSchema = z.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'namespace' } }],
      output: dedent`
        import * as z from "zod/mini";
        const userSchema = z.string();
      `,
    },
    {
      name: 'default import',
      code: 'import z from "zod/mini";',
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'namespace' } }],
      output: 'import * as z from "zod/mini";',
    },
    {
      name: 'multiple named imports',
      code: 'import { object, string } from "zod/mini";',
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'namespace' } }],
      output: 'import * as z from "zod/mini";',
    },
    {
      name: 'named type import',
      code: 'import type { z } from "zod/mini";',
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'namespace' } }],
      output: 'import type * as z from "zod/mini";',
    },
    {
      name: 'zod/v4-mini default import',
      code: 'import z from "zod/v4-mini";',
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'namespace' } }],
      output: 'import * as z from "zod/v4-mini";',
    },
    {
      name: 'named imports with type',
      code: dedent`
        import { z } from "zod/mini";
        import type { $ZodType } from "zod/mini";
        const userSchema: $ZodType = z.string();
      `,
      errors: [
        {
          messageId: 'changeImportSyntax',
          data: { syntax: 'namespace' },
          line: 1,
        },
        {
          messageId: 'removeDuplicate',
          data: { syntax: 'namespace' },
          line: 2,
        },
        { messageId: 'convertUsage', data: { syntax: 'namespace' }, line: 3 },
      ],
      output: dedent`
        import * as z from "zod/mini";

        const userSchema: z.$ZodType = z.string();
      `,
    },
    {
      name: 'keeps name from named z import',
      code: dedent`
        import { z as myZod } from "zod/mini";
        const userSchema = myZod.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', line: 1 }],
      output: dedent`
        import * as myZod from "zod/mini";
        const userSchema = myZod.string();
      `,
    },
    {
      name: 'two named imports from same module',
      code: dedent`
        import { array, boolean } from 'zod/mini';
        const userSchema = array(boolean())
      `,
      errors: [
        { messageId: 'changeImportSyntax', line: 1 },
        { messageId: 'convertUsage', line: 2 },
        { messageId: 'convertUsage', line: 2 },
      ],
      output: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.array(z.boolean())
      `,
    },
  ],
});

ruleTester.run(`${consistentImport.name} named`, consistentImport, {
  valid: [
    {
      name: 'valid named import',
      options: [{ syntax: 'named' }],
      code: dedent`
        import { z } from 'zod/mini';
        const userSchema = z.string();
      `,
    },
    {
      name: 'unrelated imports',
      code: 'import { useState } from "react";',
    },
  ],
  invalid: [
    {
      name: 'default import',
      options: [{ syntax: 'named' }],
      code: dedent`
        import z from 'zod/mini';
        const userSchema = z.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'named' } }],
      output: dedent`
        import { z } from 'zod/mini';
        const userSchema = z.string();
      `,
    },
    {
      name: 'namespace import',
      options: [{ syntax: 'named' }],
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'named' } }],
      output: dedent`
        import { z } from 'zod/mini';
        const userSchema = z.string();
      `,
    },
    {
      name: 'individual named imports converted to z',
      options: [{ syntax: 'named' }],
      code: dedent`
        import { string } from 'zod/mini';
        const userSchema = string();
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'named' } },
        { messageId: 'convertUsage', data: { syntax: 'named' } },
      ],
      output: dedent`
        import { z } from 'zod/mini';
        const userSchema = z.string();
      `,
    },
  ],
});

describe(`${consistentImport.name} options`, () => {
  it('offers only the syntaxes this plugin supports', () => {
    expect(consistentImport.meta.schema).toMatchObject([
      { properties: { syntax: { enum: ['namespace', 'named'] } } },
    ]);
  });
});
