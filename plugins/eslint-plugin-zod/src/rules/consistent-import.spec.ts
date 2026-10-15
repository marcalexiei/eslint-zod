import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import type { Rule as ESLintRule } from 'eslint';
import { RuleTester as ESLintRuleTester } from 'eslint';
import { describe, expect, it } from 'vitest';

import { consistentImport } from './consistent-import.js';

const ruleTester = new RuleTester();

// @typescript-eslint/rule-tester wraps the parser to produce a TypeScript AST.
// Use the ESLint tester to catch plain JS parser issues.
const jsRuleTester = new ESLintRuleTester();

ruleTester.run(`${consistentImport.name} namespace`, consistentImport, {
  valid: [
    {
      name: 'valid usage',
      code: 'import * as z from "zod";',
    },
    {
      name: 'alias is fine',
      code: 'import * as myZod from "zod";',
    },
    {
      name: 'type imports',
      code: 'import type * as myZod from "zod";',
    },
    {
      name: 'unrelated imports',
      code: 'import { useState } from "react";',
    },
    {
      name: 'zod/mini',
      code: 'import * as z from "zod/mini";',
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/93
      name: 'zod v4 and v3',
      code: dedent`
        import * as z3 from "zod/v3";
        import * as z from "zod";
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/93
      name: 'zod v4 (types) and v3',
      code: dedent`
        import * as z3 from "zod/v3";
        import type * as z from "zod";
      `,
    },
  ],

  invalid: [
    {
      name: 'named default import',
      code: dedent`
        import { default as z } from "zod";
        const aSchema = z.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'namespace' } }],
      output: dedent`
        import * as z from "zod";
        const aSchema = z.string();
      `,
    },
    {
      name: 'two namespace imports',
      code: dedent`
        import * as z from "zod";
        import * as y from "zod";
        const aSchema = y.string();
      `,
      errors: [
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'namespace' }, line: 3 },
      ],
      output: dedent`
        import * as z from "zod";

        const aSchema = z.string();
      `,
    },
    {
      name: 'named import',
      code: dedent`
        import { z } from "zod";
        const aSchema = z.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'namespace' } }],
      output: dedent`
        import * as z from "zod";
        const aSchema = z.string();
      `,
    },
    {
      name: 'default import',
      code: 'import z from "zod";',
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'namespace' } }],
      output: 'import * as z from "zod";',
    },
    {
      name: 'multiple named imports',
      code: 'import { object, string } from "zod";',
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'namespace' } }],
      output: 'import * as z from "zod";',
    },
    {
      name: 'mixed default + named',
      code: 'import z, { object } from "zod";',
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'namespace' } }],
      output: 'import * as z from "zod";',
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/39
      name: 'named type import',
      code: 'import type { z } from "zod";',
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'namespace' } }],
      output: 'import type * as z from "zod";',
    },
    {
      name: 'named imports (one value and one type)',
      code: dedent`
        import { z } from "zod";
        import type { $ZodType } from "zod";
        const aSchema: $ZodType = z.string();
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
        import * as z from "zod";

        const aSchema: z.$ZodType = z.string();
      `,
    },
    {
      name: 'type import and Value import',
      code: dedent`
        import type { z } from "zod";
        import { object } from "zod";
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
      ],
      output: 'import * as z from "zod";\n',
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/93
      name: 'zod v4 and v3 (named)',
      code: dedent`
        import z3 from "zod/v3";
        import * as z from "zod";
        const aSchema = z3.string();
        const bSchema = z.string();
      `,
      errors: [
        {
          messageId: 'changeImportSyntax',
          data: { syntax: 'namespace' },
          line: 1,
        },
      ],
      output: dedent`
        import * as z3 from "zod/v3";
        import * as z from "zod";
        const aSchema = z3.string();
        const bSchema = z.string();
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/138
      name: 'mixed value and type imports',
      code: dedent`
        import {array, type $ZodType} from "zod";
        const aSchema: $ZodType = array();
      `,
      errors: [
        { messageId: 'changeImportSyntax', line: 1 },
        { messageId: 'convertUsage', line: 2 },
        { messageId: 'convertUsage', line: 2 },
      ],
      output: dedent`
        import * as z from "zod";
        const aSchema: z.$ZodType = z.array();
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/138
      name: 'type named imports',
      code: dedent`
        import type { ZodBoolean, $ZodType } from "zod";
        type Test = $ZodType | ZodBoolean;
      `,
      errors: [
        { messageId: 'changeImportSyntax', line: 1 },
        { messageId: 'convertUsage', line: 2 },
        { messageId: 'convertUsage', line: 2 },
      ],
      output: dedent`
        import type * as z from "zod";
        type Test = z.$ZodType | z.ZodBoolean;
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/138
      name: 'namespace import + named type import',
      code: dedent`
        import * as z from "zod";
        import type { $ZodType } from "zod";
        const aSchema: $ZodType = z.string();
      `,
      errors: [
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', line: 3 },
      ],
      output: dedent`
        import * as z from "zod";

        const aSchema: z.$ZodType = z.string();
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/138
      name: 'two versions: one using named and one default import',
      code: dedent`
        import { z as z3 } from 'zod/v3';
        import z from 'zod/v4';
        const aSchema = z.string();
        const bSchema = z3.string();
      `,
      errors: [
        { messageId: 'changeImportSyntax', line: 1 },
        { messageId: 'changeImportSyntax', line: 2 },
      ],
      output: dedent`
        import * as z3 from 'zod/v3';
        import * as z from 'zod/v4';
        const aSchema = z.string();
        const bSchema = z3.string();
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/138
      name: 'two versions: one using named and one default import and named type',
      code: dedent`
        import { z as z3 } from 'zod/v3';
        import z from 'zod/v4';
        import type { $ZodType } from 'zod/v4';
        const aSchema: $ZodType = z.string();
        const bSchema = z3.string();
      `,
      errors: [
        { messageId: 'changeImportSyntax', line: 1 },
        { messageId: 'changeImportSyntax', line: 2 },
        { messageId: 'removeDuplicate', line: 3 },
        { messageId: 'convertUsage', line: 4 },
      ],
      output: dedent`
        import * as z3 from 'zod/v3';
        import * as z from 'zod/v4';

        const aSchema: z.$ZodType = z.string();
        const bSchema = z3.string();
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/138
      name: 'only named',
      code: dedent`
        import { type $ZodType, string } from 'zod';
        const aSchema: $ZodType = string();
      `,
      errors: [
        { messageId: 'changeImportSyntax', line: 1 },
        { messageId: 'convertUsage', line: 2 },
        { messageId: 'convertUsage', line: 2 },
      ],
      output: dedent`
        import * as z from 'zod';
        const aSchema: z.$ZodType = z.string();
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/138
      name: 'first named, then namespace',
      code: dedent`
        import type { $ZodType } from 'zod';
        import * as z from 'zod';
        const aSchema: $ZodType = z.string();
      `,
      errors: [
        { messageId: 'changeImportSyntax', line: 1 },
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', line: 3 },
      ],
      output: dedent`
        import * as z from 'zod';

        const aSchema: z.$ZodType = z.string();
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/93
      name: 'two named imports from same module',
      code: dedent`
        import {array, boolean} from 'zod';
        import {type ZodError, string} from 'zod';
        const aSchema = array(boolean())
        const bSchema = string()
      `,
      errors: [
        { messageId: 'changeImportSyntax', line: 1 },
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', line: 3 },
        { messageId: 'convertUsage', line: 3 },
        { messageId: 'convertUsage', line: 4 },
      ],
      output: dedent`
        import * as z from 'zod';

        const aSchema = z.array(z.boolean())
        const bSchema = z.string()
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/93
      name: 'keeps name from default import',
      code: dedent`
        import myZod from 'zod';
        const aSchema = myZod.string()
      `,
      errors: [{ messageId: 'changeImportSyntax', line: 1 }],
      output: dedent`
        import * as myZod from 'zod';
        const aSchema = myZod.string()
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/93
      name: 'keeps name from named z import',
      code: dedent`
        import { z as myZod} from 'zod';
        const aSchema = myZod.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', line: 1 }],
      output: dedent`
        import * as myZod from 'zod';
        const aSchema = myZod.string();
      `,
    },
    {
      // https://github.com/marcalexiei/eslint-zod-x/issues/93
      name: 'keeps name from named z import and ignores other named import',
      code: dedent`
        import { boolean, z as myZod} from 'zod';
        const aSchema = myZod.string();
        const bSchema = boolean();
      `,
      errors: [
        { messageId: 'changeImportSyntax', line: 1 },
        { messageId: 'convertUsage', line: 3 },
      ],
      output: dedent`
        import * as myZod from 'zod';
        const aSchema = myZod.string();
        const bSchema = myZod.boolean();
      `,
    },
    {
      name: 'two sources needing a generated alias get distinct names',
      code: dedent`
        import { string } from 'zod';
        import { number } from 'zod/v3';
        const aSchema = string();
        const bSchema = number();
      `,
      errors: [
        { messageId: 'changeImportSyntax', line: 1 },
        { messageId: 'changeImportSyntax', line: 2 },
        { messageId: 'convertUsage', line: 3 },
        { messageId: 'convertUsage', line: 4 },
      ],
      output: dedent`
        import * as z from 'zod';
        import * as z1 from 'zod/v3';
        const aSchema = z.string();
        const bSchema = z1.number();
      `,
    },
  ],
});

ruleTester.run(`${consistentImport.name} named`, consistentImport, {
  valid: [
    {
      name: 'valid',
      options: [{ syntax: 'named' }],
      code: dedent`
        import { z } from 'zod';
        const aSchema = z.string();
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
        import z from 'zod';
        const aSchema = z.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'named' } }],
      output: dedent`
        import { z } from 'zod';
        const aSchema = z.string();
      `,
    },
    {
      name: 'default import (with type)',
      options: [{ syntax: 'named' }],
      code: dedent`
        import z, { type $ZodType } from 'zod';
        const aSchema: $ZodType = z.string();
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'named' }, line: 1 },
        { messageId: 'convertUsage', data: { syntax: 'named' }, line: 2 },
      ],
      output: dedent`
        import { z } from 'zod';
        const aSchema: z.$ZodType = z.string();
      `,
    },
    {
      name: 'default import (different name from z)',
      options: [{ syntax: 'named' }],
      code: dedent`
        import zod from 'zod';
        const aSchema = zod.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'named' } }],
      output: dedent`
        import { z as zod } from 'zod';
        const aSchema = zod.string();
      `,
    },
    {
      name: 'namespace import',
      options: [{ syntax: 'named' }],
      code: dedent`
        import * as z from 'zod';
        const aSchema = z.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'named' } }],
      output: dedent`
        import { z } from 'zod';
        const aSchema = z.string();
      `,
    },
    {
      name: 'namespace import (different name from z)',
      options: [{ syntax: 'named' }],
      code: dedent`
        import * as zod from 'zod';
        const aSchema = zod.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'named' } }],
      output: dedent`
        import { z as zod } from 'zod';
        const aSchema = zod.string();
      `,
    },
    {
      name: 'named runtime import should be replaced by zod imports',
      options: [{ syntax: 'named' }],
      code: dedent`
        import { string } from 'zod';
        const aSchema = string();
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'named' } },
        { messageId: 'convertUsage', data: { syntax: 'named' } },
      ],
      output: dedent`
        import { z } from 'zod';
        const aSchema = z.string();
      `,
    },
  ],
});

ruleTester.run(`${consistentImport.name} default`, consistentImport, {
  valid: [
    {
      name: 'default import',
      options: [{ syntax: 'default' }],
      code: dedent`
        import z from 'zod';
        const aSchema = z.string();
      `,
    },
    {
      name: 'aliased default import',
      options: [{ syntax: 'default' }],
      code: dedent`
        import zod from 'zod';
        const aSchema = zod.string();
      `,
    },
    {
      name: 'type-only default import',
      options: [{ syntax: 'default' }],
      code: dedent`
        import type z from 'zod';
        type Schema = z.ZodString;
      `,
    },
    {
      name: 'zod v4 and v3',
      options: [{ syntax: 'default' }],
      code: dedent`
        import z4 from 'zod/v4';
        import z3 from 'zod/v3';
      `,
    },
  ],
  invalid: [
    {
      name: 'named default import',
      options: [{ syntax: 'default' }],
      code: dedent`
        import { default as zod } from 'zod';
        const aSchema = zod.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'default' } }],
      output: dedent`
        import zod from 'zod';
        const aSchema = zod.string();
      `,
    },
    {
      name: 'default and namespace imports',
      options: [{ syntax: 'default' }],
      code: dedent`
        import z from 'zod';
        import * as y from 'zod';
        const aSchema = y.string();
      `,
      errors: [
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'default' }, line: 3 },
      ],
      output: dedent`
        import z from 'zod';

        const aSchema = z.string();
      `,
    },
    {
      name: 'namespace import',
      options: [{ syntax: 'default' }],
      code: dedent`
        import * as z from 'zod';
        const aSchema = z.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'default' } }],
      output: dedent`
        import z from 'zod';
        const aSchema = z.string();
      `,
    },
    {
      name: 'named import',
      options: [{ syntax: 'default' }],
      code: dedent`
        import { z } from 'zod';
        const aSchema = z.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'default' } }],
      output: dedent`
        import z from 'zod';
        const aSchema = z.string();
      `,
    },
    {
      name: 'named import (different name from z)',
      options: [{ syntax: 'default' }],
      code: dedent`
        import { z as zod } from 'zod';
        const aSchema = zod.string();
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'default' } }],
      output: dedent`
        import zod from 'zod';
        const aSchema = zod.string();
      `,
    },
    {
      name: 'named runtime import',
      options: [{ syntax: 'default' }],
      code: dedent`
        import { string } from 'zod';
        const aSchema = string();
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'default' } },
        { messageId: 'convertUsage', data: { syntax: 'default' } },
      ],
      output: dedent`
        import z from 'zod';
        const aSchema = z.string();
      `,
    },
    {
      name: 'mixed default + named',
      options: [{ syntax: 'default' }],
      code: dedent`
        import z, { object } from 'zod';
        const aSchema = object({});
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'default' } },
        { messageId: 'convertUsage', data: { syntax: 'default' } },
      ],
      output: dedent`
        import z from 'zod';
        const aSchema = z.object({});
      `,
    },
    {
      name: 'type-only namespace import',
      options: [{ syntax: 'default' }],
      code: dedent`
        import type * as z from 'zod';
        type Schema = z.ZodString;
      `,
      errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'default' } }],
      output: dedent`
        import type z from 'zod';
        type Schema = z.ZodString;
      `,
    },
    {
      name: 'duplicate import',
      options: [{ syntax: 'default' }],
      code: dedent`
        import z from 'zod';
        import { ZodString } from 'zod';
        const aSchema: ZodString = z.string();
      `,
      errors: [
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'default' }, line: 3 },
      ],
      output: dedent`
        import z from 'zod';

        const aSchema: z.ZodString = z.string();
      `,
    },
  ],
});

jsRuleTester.run(
  `${consistentImport.name} plain JS`,
  consistentImport as unknown as ESLintRule.RuleModule,
  {
    valid: [
      {
        // https://github.com/marcalexiei/eslint-zod/issues/501
        name: 'valid usage',
        code: 'import * as z from "zod";',
      },
    ],
    invalid: [
      {
        // https://github.com/marcalexiei/eslint-zod/issues/501
        name: 'named import',
        code: 'import {z} from "zod";',
        errors: [{ messageId: 'changeImportSyntax', data: { syntax: 'namespace' } }],
        output: 'import * as z from "zod";',
      },
    ],
  },
);

describe(`${consistentImport.name} options`, () => {
  it('offers only the syntaxes this plugin supports', () => {
    expect(consistentImport.meta.schema).toMatchObject([
      { properties: { syntax: { enum: ['namespace', 'named', 'default'] } } },
    ]);
  });
});
