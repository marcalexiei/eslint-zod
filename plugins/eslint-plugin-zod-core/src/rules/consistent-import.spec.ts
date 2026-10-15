import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { describe, expect, it } from 'vitest';

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
      name: 'second namespace import in a shorthand property',
      code: dedent`
        import * as z from 'zod/v4/core';
        import * as y from 'zod/v4/core';
        export const o = { y };
      `,
      errors: [
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'namespace' }, line: 3 },
      ],
      output: dedent`
        import * as z from 'zod/v4/core';

        export const o = { y: z };
      `,
    },
    {
      name: 'second namespace import in an export specifier',
      code: dedent`
        import * as z from 'zod/v4/core';
        import * as y from 'zod/v4/core';
        export { y };
      `,
      errors: [
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'namespace' }, line: 3 },
      ],
      output: dedent`
        import * as z from 'zod/v4/core';

        export { z as y };
      `,
    },
    {
      name: 'second namespace import as a computed key',
      code: dedent`
        import * as z from 'zod/v4/core';
        import * as y from 'zod/v4/core';
        const map = {};
        export const value = map[y];
      `,
      errors: [
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'namespace' }, line: 4 },
      ],
      output: dedent`
        import * as z from 'zod/v4/core';

        const map = {};
        export const value = map[z];
      `,
    },
    {
      name: 'named import in a shorthand property',
      code: dedent`
        import { $ZodString } from 'zod/v4/core';
        export const o = { $ZodString };
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'namespace' } },
        { messageId: 'convertUsage', data: { syntax: 'namespace' } },
      ],
      output: dedent`
        import * as z from 'zod/v4/core';
        export const o = { $ZodString: z.$ZodString };
      `,
    },
    {
      name: 'named import as a computed key',
      code: dedent`
        import { $ZodString } from 'zod/v4/core';
        const map = {};
        export const value = map[$ZodString];
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'namespace' } },
        { messageId: 'convertUsage', data: { syntax: 'namespace' } },
      ],
      output: dedent`
        import * as z from 'zod/v4/core';
        const map = {};
        export const value = map[z.$ZodString];
      `,
    },
    {
      name: 'named import re-exported — no fix, it cannot export a qualified name',
      code: dedent`
        import { $ZodString } from 'zod/v4/core';
        export { $ZodString };
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'namespace' } },
        { messageId: 'convertUsage', data: { syntax: 'namespace' } },
      ],
      output: null,
    },
    {
      name: 'duplicate import re-exported — no fix, it cannot export a qualified name',
      code: dedent`
        import * as z from 'zod/v4/core';
        import { $ZodString } from 'zod/v4/core';
        export { $ZodString };
      `,
      errors: [
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'namespace' }, line: 3 },
      ],
      output: null,
    },
    {
      name: 'two namespace imports',
      code: dedent`
        import * as z from 'zod/v4/core';
        import * as y from 'zod/v4/core';
        const aSchema = y.string();
      `,
      errors: [
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'namespace' }, line: 3 },
      ],
      output: dedent`
        import * as z from 'zod/v4/core';

        const aSchema = z.string();
      `,
    },
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

describe(`${consistentImport.name} options`, () => {
  it('offers only the syntaxes this plugin supports', () => {
    expect(consistentImport.meta.schema).toMatchObject([
      { properties: { syntax: { enum: ['namespace'] } } },
    ]);
  });
});
