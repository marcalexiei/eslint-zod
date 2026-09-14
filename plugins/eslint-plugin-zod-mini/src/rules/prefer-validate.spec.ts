import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferValidate } from './prefer-validate.js';

const ruleTester = new RuleTester();

ruleTester.run(preferValidate.name, preferValidate, {
  valid: [
    {
      name: 'apply returns a non-schema parser',
      code: dedent`
import * as z from 'zod/mini';
const parser = z.string().apply(schema => ({
  safeParse: value => schema.safeParse(value),
}));
const ok = parser.safeParse('hello').success;
`,
    },
    {
      name: 'asserted success use: r.success! = false',
      code: "import * as z from 'zod/mini'; const r = z.string().safeParse(data); r.success! = false; console.log(r.success);",
    },
    {
      name: 'asserted success use: (r.success as boolean) = false',
      code: "import * as z from 'zod/mini'; const r = z.string().safeParse(data); (r.success as boolean) = false; console.log(r.success);",
    },
    {
      name: 'asserted success use: (<boolean>r.success) = false',
      code: "import * as z from 'zod/mini'; const r = z.string().safeParse(data); (<boolean>r.success) = false; console.log(r.success);",
    },
    {
      name: 'asserted success use: (r.success satisfies boolean) = false',
      code: "import * as z from 'zod/mini'; const r = z.string().safeParse(data); (r.success satisfies boolean) = false; console.log(r.success);",
    },
    {
      name: 'asserted success use: r.success!++',
      code: "import * as z from 'zod/mini'; const r = z.string().safeParse(data); r.success!++; console.log(r.success);",
    },
    {
      name: 'asserted success use: delete r.success!',
      code: "import * as z from 'zod/mini'; const r = z.string().safeParse(data); delete r.success!; console.log(r.success);",
    },
    {
      name: 'asserted success use: r.success!()',
      code: "import * as z from 'zod/mini'; const r = z.string().safeParse(data); r.success!(); console.log(r.success);",
    },
    {
      name: 'asserted success use: new (r.success!)()',
      code: "import * as z from 'zod/mini'; const r = z.string().safeParse(data); new (r.success!)(); console.log(r.success);",
    },
    {
      name: 'asserted success use: r.success!``',
      code: "import * as z from 'zod/mini'; const r = z.string().safeParse(data); r.success!``; console.log(r.success);",
    },
    {
      name: 'asserted success use: for (r.success! of values) {}',
      code: "import * as z from 'zod/mini'; const r = z.string().safeParse(data); for (r.success! of values) {}; console.log(r.success);",
    },
    {
      name: 'asserted success use: [r.success!] = values',
      code: "import * as z from 'zod/mini'; const r = z.string().safeParse(data); [r.success!] = values; console.log(r.success);",
    },
    {
      name: 'data is used',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
log(r.success, r.data);
`,
    },
    {
      name: 'error is used',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
if (!r.success) log(r.error);
`,
    },
    {
      name: 'result escapes',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
log(r);
`,
    },
    {
      name: 'result reassigned',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
let r = schema.safeParse(data);
r = other;
log(r.success);
`,
    },
    {
      name: 'schema reassigned',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
let other = schema;
other = unrelated;
other.safeParse(data).success;
`,
    },
    {
      name: 'annotated result',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r: Result = schema.safeParse(data);
log(r.success);
`,
    },
    {
      name: 'exported result',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
export const r = schema.safeParse(data);
log(r.success);
`,
    },
    {
      name: 'exported later',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
export { r };
log(r.success);
`,
    },
    {
      name: 'destructuring rest',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const { success, ...rest } = schema.safeParse(data);
`,
    },
    {
      name: 'destructuring default',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const { success = true } = schema.safeParse(data);
`,
    },
    {
      name: 'destructuring data',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const { success, data: value } = schema.safeParse(data);
`,
    },
    {
      name: 'optional method',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema?.safeParse(data).success;
`,
    },
    {
      name: 'optional call',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParse?.(data).success;
`,
    },
    {
      name: 'optional success',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParse(data)?.success;
`,
    },
    {
      name: 'dynamic success',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParse(data)[key];
`,
    },
    {
      name: 'unawaited async',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParseAsync(data).success;
`,
    },
    {
      name: 'promise chain',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParseAsync(data).then(r => r.success);
`,
    },
    {
      name: 'success write',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
r.success = true;
`,
    },
    {
      name: 'success update',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
r.success++;
`,
    },
    {
      name: 'success delete',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
delete r.success;
`,
    },
    {
      name: 'success call',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParse(data).success();
`,
    },
    {
      name: 'unknown receiver',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
unknown.safeParse(data).success;
`,
    },
    {
      name: 'shadowed schema',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
function f(schema) { return schema.safeParse(data).success;
}
`,
    },
    {
      name: 'shadowed namespace',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
function f(z) { return z.string().safeParse(data).success;
}
`,
    },
    {
      name: 'non-schema factory',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z.refine(check).safeParse(data).success;
`,
    },
    {
      name: 'parse result is not a schema',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.parse(data).safeParse(data).success;
`,
    },
    {
      name: 'already validates',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z.validate(schema, data);
`,
    },
    {
      name: 'not a zod import',
      code: dedent`
import * as z from 'other';
z.string().safeParse(data).success;
`,
    },
    {
      name: 'other plugin source',
      code: dedent`
import * as z from 'zod';
z.string().safeParse(data).success;
`,
    },
    {
      name: 'v3 import',
      code: dedent`
import * as z from 'zod/v3';
z.string().safeParse(data).success;
`,
    },
    {
      name: 'type-only import',
      code: dedent`
import type { safeParse } from 'zod/mini';
safeParse(schema, data).success;
`,
    },
    {
      name: 'shadowed named import',
      code: dedent`
import { safeParse } from 'zod/mini';
function f(safeParse) { return safeParse(schema, data).success;
}
`,
    },
    {
      name: 'result redeclared',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
var r = schema.safeParse(data);
var r = other;
log(r.success);
`,
    },
    {
      name: 'unused result',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const result = schema.safeParse(data);
`,
    },
    {
      name: 'array pattern',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const [success] = schema.safeParse(data);
`,
    },
    {
      name: 'rest-only pattern',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const { ...success } = schema.safeParse(data);
`,
    },
    {
      name: 'empty pattern',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const {} = schema.safeParse(data);
`,
    },
    {
      name: 'destructuring assignment target',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
({ x: r.success } = value);
`,
    },
    {
      name: 'array assignment target',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
[r.success] = value;
`,
    },
    {
      name: 'rest assignment target',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
[...r.success] = value;
`,
    },
    {
      name: 'default assignment target',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
[r.success = true] = value;
`,
    },
    {
      name: 'for-of assignment target',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
for (r.success of values) {}
`,
    },
    {
      name: 'for-in assignment target',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const r = schema.safeParse(data);
for (r.success in values) {}
`,
    },
    {
      name: 'constructor success',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
new (schema.safeParse(data).success)();
`,
    },
    {
      name: 'tagged success',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParse(data).success\`\`;
`,
    },
    {
      name: 'JSX result reference',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const Result = schema.safeParse(data);
const view = <Result />;
`,
      filename: 'file.tsx',
    },
    {
      name: 'cyclic aliases',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const a = b;
const b = a;
a.safeParse(data).success;
`,
    },
    {
      name: 'reassigned const schema',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const s = z.string();
s = other;
s.safeParse(data).success;
`,
    },
    {
      name: 'non-call receiver',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
(condition ? schema : other).safeParse(data).success;
`,
    },
    {
      name: 'dynamic schema factory',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z[key]().safeParse(data).success;
`,
    },
    {
      name: 'optional schema factory',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z.string?.().safeParse(data).success;
`,
    },
    {
      name: 'numeric property',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParse(data)[0];
`,
    },
    {
      name: 'no arguments',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParse().success;
`,
    },
    {
      name: 'standalone missing data',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z.safeParse(schema).success;
`,
    },
    {
      name: 'standalone optional call',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z.safeParse?.(schema, data).success;
`,
    },
    {
      name: 'dynamic parse method',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema[key](data).success;
`,
    },
    {
      name: 'schema imported elsewhere',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
external.safeParse(data).success;
`,
    },
    {
      name: 'individual type-only import',
      code: dedent`
import { type safeParse } from 'zod/mini';
safeParse(schema, data).success;
`,
    },
    {
      name: 'schema from another file',
      code: dedent`
import { schema } from './schema';
schema.safeParse(data).success;
`,
    },
    {
      name: 'unsupported spa alias',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
(await schema.spa(data)).success;
`,
    },
  ],
  invalid: [
    {
      name: 'parenthesized computed success',
      code: "import * as z from 'zod/mini'; const schema = z.string(); ((schema).safeParse(data))[(('success'))];",
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          suggestions: [
            {
              messageId: 'useValidate',
              output:
                "import * as z from 'zod/mini'; const schema = z.string(); (z.validate((schema), data));",
            },
          ],
        },
      ],
    },
    {
      name: 'parenthesized computed stored success',
      code: "import * as z from 'zod/mini'; const schema = z.string(); const r = schema.safeParse(data); ((r))[(('success'))];",
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          suggestions: [
            {
              messageId: 'useValidate',
              output:
                "import * as z from 'zod/mini'; const schema = z.string(); const r = z.validate(schema, data); ((r));",
            },
          ],
        },
      ],
    },
    {
      name: 'parenthesized computed method',
      code: "import * as z from 'zod/mini'; const schema = z.string(); (schema)[(('safeParse'))](data).success;",
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          suggestions: [
            {
              messageId: 'useValidate',
              output:
                "import * as z from 'zod/mini'; const schema = z.string(); z.validate((schema), data);",
            },
          ],
        },
      ],
    },
    {
      name: 'asserted success read',
      code: "import * as z from 'zod/mini'; const schema = z.string(); schema.safeParse(data).success!;",
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          suggestions: [
            {
              messageId: 'useValidate',
              output:
                "import * as z from 'zod/mini'; const schema = z.string(); z.validate(schema, data)!;",
            },
          ],
        },
      ],
    },
    {
      name: 'direct access',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParse(data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z.validate(schema, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'inline schema',
      code: dedent`
import * as z from 'zod/mini';
z.string().safeParse(data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
z.validate(z.string(), data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'destructured success',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const { success } = schema.safeParse(data);
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const success = z.validate(schema, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'destructured alias',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const { success: ok } = schema.safeParse(data);
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const ok = z.validate(schema, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'stored result with multiple reads',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const result = schema.safeParse(data);
if (result.success) log(result.success);
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const result = z.validate(schema, data);
if (result) log(result);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'immutable schema alias',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const alias = schema;
alias.safeParse(data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const alias = schema;
z.validate(alias, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'awaited direct access',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
(await schema.safeParseAsync(data)).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validateAsync',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validateAsync',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
(await z.validateAsync(schema, data));
`,
            },
          ],
        },
      ],
    },
    {
      name: 'awaited stored result',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const result = await schema.safeParseAsync(data);
log(result.success);
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validateAsync',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validateAsync',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const result = await z.validateAsync(schema, data);
log(result);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'awaited destructuring',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const { success: ok } = await schema.safeParseAsync(data);
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validateAsync',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validateAsync',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const ok = await z.validateAsync(schema, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'standalone namespace',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z.safeParse(schema, data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z.validate(schema, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'standalone async namespace',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
(await z.safeParseAsync(schema, data)).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validateAsync',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validateAsync',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
(await z.validateAsync(schema, data));
`,
            },
          ],
        },
      ],
    },
    {
      name: 'computed static properties',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema['safeParse'](data)['success'];
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z.validate(schema, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'parenthesized schema and parse result',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
((schema).safeParse(data)).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
(z.validate((schema), data));
`,
            },
          ],
        },
      ],
    },
    {
      name: 'comments in arguments',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParse(/* input */ data, options).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z.validate(schema, /* input */ data, options);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'named parsing import',
      code: dedent`
import { safeParse as parse } from 'zod/mini';
parse(schema, data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import { validate } from 'zod/mini';
import { safeParse as parse } from 'zod/mini';
validate(schema, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'reuse validation alias',
      code: dedent`
import { safeParse, validate as check } from 'zod/mini';
safeParse(schema, data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import { safeParse, validate as check } from 'zod/mini';
check(schema, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'collision-free import',
      code: dedent`
import { safeParse } from 'zod/mini';
function f(validate, validate2) { return safeParse(schema, data).success;
}
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import { validate as validate3 } from 'zod/mini';
import { safeParse } from 'zod/mini';
function f(validate, validate2) { return validate3(schema, data);
}
`,
            },
          ],
        },
      ],
    },
    {
      name: 'method with named schema import',
      code: dedent`
import { string } from 'zod/mini';
string().safeParse(data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import { validate } from 'zod/mini';
import { string } from 'zod/mini';
validate(string(), data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'comment in removed access',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParse(data). /* keep */ success;
`,
      errors: [
        {
          messageId: 'preferValidate',
          suggestions: [],
        },
      ],
    },
    {
      name: 'default import',
      code: dedent`
import z from 'zod/mini';
z.string().safeParse(data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import z from 'zod/mini';
z.validate(z.string(), data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'named namespace alias',
      code: dedent`
import { z as z } from 'zod/mini';
z.string().safeParse(data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import { z as z } from 'zod/mini';
z.validate(z.string(), data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'factory z.coerce.number()',
      code: dedent`
import * as z from 'zod/mini';
z.coerce.number().safeParse(data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
z.validate(z.coerce.number(), data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'factory z.iso.date()',
      code: dedent`
import * as z from 'zod/mini';
z.iso.date().safeParse(data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
z.validate(z.iso.date(), data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'factory z.union([z.string(), z.number()])',
      code: dedent`
import * as z from 'zod/mini';
z.union([z.string(), z.number()]).safeParse(data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
z.validate(z.union([z.string(), z.number()]), data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'chained schema',
      code: dedent`
import * as z from 'zod/mini';
z.string().check(z.minLength(1)).safeParse(data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
z.validate(z.string().check(z.minLength(1)), data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'computed standalone',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z['safeParse'](schema, data)['success'];
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
z['validate'](schema, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'computed async standalone',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
(await z['safeParseAsync'](schema, data))['success'];
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validateAsync',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validateAsync',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
(await z['validateAsync'](schema, data));
`,
            },
          ],
        },
      ],
    },
    {
      name: 'named async parser',
      code: dedent`
import { safeParseAsync } from 'zod/mini';
const { success } = await safeParseAsync(schema, data);
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validateAsync',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validateAsync',
              },
              output: dedent`
import { validateAsync } from 'zod/mini';
import { safeParseAsync } from 'zod/mini';
const success = await validateAsync(schema, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'parser using existing namespace',
      code: dedent`
import * as z from 'zod/mini';
import { safeParse } from 'zod/mini';
safeParse(schema, data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
import { safeParse } from 'zod/mini';
z.validate(schema, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'shadowed validation import',
      code: dedent`
import { safeParse, validate } from 'zod/mini';
function f(validate) { return safeParse(schema, data).success;
}
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import { validate as validate2 } from 'zod/mini';
import { safeParse, validate } from 'zod/mini';
function f(validate) { return validate2(schema, data);
}
`,
            },
          ],
        },
      ],
    },
    {
      name: 'parenthesized stored read',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const result = schema.safeParse(data);
((result)).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const result = z.validate(schema, data);
((result));
`,
            },
          ],
        },
      ],
    },
    {
      name: 'static destructuring key',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const { ['success']: ok } = schema.safeParse(data);
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const ok = z.validate(schema, data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'repeated boolean declarations',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
let { success: ok } = schema.safeParse(data);
ok = false;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/mini';
const schema = z.string();
let ok = z.validate(schema, data);
ok = false;
`,
            },
          ],
        },
      ],
    },
    {
      name: 'alternative source',
      code: dedent`
import * as z from 'zod/v4-mini';
z.string().safeParse(data).success;
`,
      output: null,
      errors: [
        {
          messageId: 'preferValidate',
          data: {
            method: 'validate',
          },
          suggestions: [
            {
              messageId: 'useValidate',
              data: {
                method: 'validate',
              },
              output: dedent`
import * as z from 'zod/v4-mini';
z.validate(z.string(), data);
`,
            },
          ],
        },
      ],
    },
    {
      name: 'generic method call',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema.safeParse<unknown>(data).success;
`,
      errors: [
        {
          messageId: 'preferValidate',
          suggestions: [],
        },
      ],
    },
    {
      name: 'parenthesized method callee',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
(schema.safeParse)(data).success;
`,
      errors: [
        {
          messageId: 'preferValidate',
          suggestions: [],
        },
      ],
    },
    {
      name: 'comment in destructuring',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
const { /* keep */ success } = schema.safeParse(data);
`,
      errors: [
        {
          messageId: 'preferValidate',
          suggestions: [],
        },
      ],
    },
    {
      name: 'comment in method accessor',
      code: dedent`
import * as z from 'zod/mini';
const schema = z.string();
schema./* keep */safeParse(data).success;
`,
      errors: [
        {
          messageId: 'preferValidate',
          suggestions: [],
        },
      ],
    },
  ],
});
