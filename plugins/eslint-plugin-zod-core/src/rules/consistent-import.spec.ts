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
        type MyType = core.output<core.$ZodString>;
      `,
    },
  ],
  invalid: [
    {
      name: 'import inside a declare module block',
      code: dedent`
        declare module 'my-lib' {
          import { $ZodType } from 'zod/v4/core';
          export type Schema = $ZodType;
        }
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'namespace' }, line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'namespace' }, line: 3 },
      ],
      output: dedent`
        declare module 'my-lib' {
          import * as z from 'zod/v4/core';
          export type Schema = z.$ZodType;
        }
      `,
    },
    {
      name: 'fallback alias skips a name already declared',
      code: dedent`
        import { $ZodString } from 'zod/v4/core';
        const z = 1;
        export const value = [$ZodString, z];
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'namespace' } },
        { messageId: 'convertUsage', data: { syntax: 'namespace' } },
      ],
      output: dedent`
        import * as z1 from 'zod/v4/core';
        const z = 1;
        export const value = [z1.$ZodString, z];
      `,
    },
    {
      name: 'alias shadowed where a usage is — no fix',
      code: dedent`
        import * as z from 'zod/v4/core';
        import { $ZodString } from 'zod/v4/core';
        export function get(z: number) {
          return $ZodString;
        }
      `,
      errors: [
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'namespace' }, line: 4 },
      ],
      output: null,
    },
    {
      name: 'comment inside the import — no fix',
      code: dedent`
        import { /* keep */ $ZodString } from 'zod/v4/core';
        export const value = $ZodString;
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'namespace' } },
        { messageId: 'convertUsage', data: { syntax: 'namespace' } },
      ],
      output: null,
    },
    {
      name: 'aliased named import — qualified by its export name',
      code: dedent`
        import { $ZodString as alias } from 'zod/v4/core';
        export const value = alias;
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'namespace' } },
        { messageId: 'convertUsage', data: { syntax: 'namespace' } },
      ],
      output: dedent`
        import * as z from 'zod/v4/core';
        export const value = z.$ZodString;
      `,
    },
    {
      name: 'type-only namespace import followed by a value import',
      code: dedent`
        import type * as z from 'zod/v4/core';
        import { $ZodString } from 'zod/v4/core';
        export const value = $ZodString;
      `,
      errors: [
        { messageId: 'changeImportSyntax', data: { syntax: 'namespace' }, line: 1 },
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'namespace' }, line: 3 },
      ],
      output: dedent`
        import * as z from 'zod/v4/core';

        export const value = z.$ZodString;
      `,
    },
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
        export const registry = y.registry();
      `,
      errors: [
        { messageId: 'removeDuplicate', line: 2 },
        { messageId: 'convertUsage', data: { syntax: 'namespace' }, line: 3 },
      ],
      output: dedent`
        import * as z from 'zod/v4/core';

        export const registry = z.registry();
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
