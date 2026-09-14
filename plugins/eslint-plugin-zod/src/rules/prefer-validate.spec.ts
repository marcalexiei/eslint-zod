import { createSuggestionCases } from '@eslint-zod/tooling/vitest/rule-tester-cases';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferValidate } from './prefer-validate.js';

const { suggest, report } = createSuggestionCases(preferValidate, {
  messageId: 'preferValidate',
  suggestionMessageId: 'useValidate',
  data: {
    method: 'validate',
  },
});
const { suggest: suggestAsync } = createSuggestionCases(preferValidate, {
  messageId: 'preferValidate',
  suggestionMessageId: 'useValidate',
  data: {
    method: 'validateAsync',
  },
});

const ruleTester = new RuleTester();

ruleTester.run(preferValidate.name, preferValidate, {
  valid: [
    {
      name: 'apply returns a non-schema parser',
      code: dedent`
        import * as z from 'zod';
        const parser = z.string().apply(schema => ({
          safeParse: value => schema.safeParse(value),
        }));
        const ok = parser.safeParse('hello').success;
      `,
    },
    {
      name: 'asserted success use: r.success! = false',
      code: "import * as z from 'zod'; const r = z.string().safeParse(data); r.success! = false; console.log(r.success);",
    },
    {
      name: 'asserted success use: (r.success as boolean) = false',
      code: "import * as z from 'zod'; const r = z.string().safeParse(data); (r.success as boolean) = false; console.log(r.success);",
    },
    {
      name: 'asserted success use: (<boolean>r.success) = false',
      code: "import * as z from 'zod'; const r = z.string().safeParse(data); (<boolean>r.success) = false; console.log(r.success);",
    },
    {
      name: 'asserted success use: (r.success satisfies boolean) = false',
      code: "import * as z from 'zod'; const r = z.string().safeParse(data); (r.success satisfies boolean) = false; console.log(r.success);",
    },
    {
      name: 'asserted success use: r.success!++',
      code: "import * as z from 'zod'; const r = z.string().safeParse(data); r.success!++; console.log(r.success);",
    },
    {
      name: 'asserted success use: delete r.success!',
      code: "import * as z from 'zod'; const r = z.string().safeParse(data); delete r.success!; console.log(r.success);",
    },
    {
      name: 'asserted success use: r.success!()',
      code: "import * as z from 'zod'; const r = z.string().safeParse(data); r.success!(); console.log(r.success);",
    },
    {
      name: 'asserted success use: new (r.success!)()',
      code: "import * as z from 'zod'; const r = z.string().safeParse(data); new (r.success!)(); console.log(r.success);",
    },
    {
      name: 'asserted success use: r.success!``',
      code: "import * as z from 'zod'; const r = z.string().safeParse(data); r.success!``; console.log(r.success);",
    },
    {
      name: 'asserted success use: for (r.success! of values) {}',
      code: "import * as z from 'zod'; const r = z.string().safeParse(data); for (r.success! of values) {}; console.log(r.success);",
    },
    {
      name: 'asserted success use: [r.success!] = values',
      code: "import * as z from 'zod'; const r = z.string().safeParse(data); [r.success!] = values; console.log(r.success);",
    },
    {
      name: 'data is used',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        log(r.success, r.data);
      `,
    },
    {
      name: 'error is used',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        if (!r.success) log(r.error);
      `,
    },
    {
      name: 'result escapes',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        log(r);
      `,
    },
    {
      name: 'result reassigned',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        let r = schema.safeParse(data);
        r = other;
        log(r.success);
      `,
    },
    {
      name: 'schema reassigned',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        let other = schema;
        other = unrelated;
        other.safeParse(data).success;
      `,
    },
    {
      name: 'annotated result',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r: Result = schema.safeParse(data);
        log(r.success);
      `,
    },
    {
      name: 'exported result',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        export const r = schema.safeParse(data);
        log(r.success);
      `,
    },
    {
      name: 'exported later',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        export { r };
        log(r.success);
      `,
    },
    {
      name: 'destructuring rest',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const { success, ...rest } = schema.safeParse(data);
      `,
    },
    {
      name: 'destructuring default',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const { success = true } = schema.safeParse(data);
      `,
    },
    {
      name: 'destructuring data',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const { success, data: value } = schema.safeParse(data);
      `,
    },
    {
      name: 'optional method',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema?.safeParse(data).success;
      `,
    },
    {
      name: 'optional call',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.safeParse?.(data).success;
      `,
    },
    {
      name: 'optional success',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.safeParse(data)?.success;
      `,
    },
    {
      name: 'dynamic success',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.safeParse(data)[key];
      `,
    },
    {
      name: 'unawaited async',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.safeParseAsync(data).success;
      `,
    },
    {
      name: 'promise chain',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.safeParseAsync(data).then(r => r.success);
      `,
    },
    {
      name: 'success write',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        r.success = true;
      `,
    },
    {
      name: 'success update',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        r.success++;
      `,
    },
    {
      name: 'success delete',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        delete r.success;
      `,
    },
    {
      name: 'success call',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.safeParse(data).success();
      `,
    },
    {
      name: 'unknown receiver',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        unknown.safeParse(data).success;
      `,
    },
    {
      name: 'shadowed schema',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        function f(schema) { return schema.safeParse(data).success;
        }
      `,
    },
    {
      name: 'shadowed namespace',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        function f(z) { return z.string().safeParse(data).success;
        }
      `,
    },
    {
      name: 'non-schema factory',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        z.refine(check).safeParse(data).success;
      `,
    },
    {
      name: 'parse result is not a schema',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.parse(data).safeParse(data).success;
      `,
    },
    {
      name: 'already validates',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.validate(data);
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
        import * as z from 'zod/mini';
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
        import type { safeParse } from 'zod';
        safeParse(schema, data).success;
      `,
    },
    {
      name: 'shadowed named import',
      code: dedent`
        import { safeParse } from 'zod';
        function f(safeParse) { return safeParse(schema, data).success;
        }
      `,
    },
    {
      name: 'result redeclared',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        var r = schema.safeParse(data);
        var r = other;
        log(r.success);
      `,
    },
    {
      name: 'unused result',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const result = schema.safeParse(data);
      `,
    },
    {
      name: 'array pattern',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const [success] = schema.safeParse(data);
      `,
    },
    {
      name: 'rest-only pattern',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const { ...success } = schema.safeParse(data);
      `,
    },
    {
      name: 'empty pattern',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const {} = schema.safeParse(data);
      `,
    },
    {
      name: 'destructuring assignment target',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        ({ x: r.success } = value);
      `,
    },
    {
      name: 'array assignment target',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        [r.success] = value;
      `,
    },
    {
      name: 'rest assignment target',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        [...r.success] = value;
      `,
    },
    {
      name: 'default assignment target',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        [r.success = true] = value;
      `,
    },
    {
      name: 'for-of assignment target',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        for (r.success of values) {}
      `,
    },
    {
      name: 'for-in assignment target',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const r = schema.safeParse(data);
        for (r.success in values) {}
      `,
    },
    {
      name: 'constructor success',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        new (schema.safeParse(data).success)();
      `,
    },
    {
      name: 'tagged success',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.safeParse(data).success\`\`;
      `,
    },
    {
      name: 'JSX result reference',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const Result = schema.safeParse(data);
        const view = <Result />;
      `,
      filename: 'file.tsx',
    },
    {
      name: 'cyclic aliases',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const a = b;
        const b = a;
        a.safeParse(data).success;
      `,
    },
    {
      name: 'reassigned const schema',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        const s = z.string();
        s = other;
        s.safeParse(data).success;
      `,
    },
    {
      name: 'non-call receiver',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        (condition ? schema : other).safeParse(data).success;
      `,
    },
    {
      name: 'dynamic schema factory',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        z[key]().safeParse(data).success;
      `,
    },
    {
      name: 'optional schema factory',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        z.string?.().safeParse(data).success;
      `,
    },
    {
      name: 'numeric property',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.safeParse(data)[0];
      `,
    },
    {
      name: 'no arguments',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.safeParse().success;
      `,
    },
    {
      name: 'standalone missing data',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        z.safeParse(schema).success;
      `,
    },
    {
      name: 'standalone optional call',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        z.safeParse?.(schema, data).success;
      `,
    },
    {
      name: 'dynamic parse method',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema[key](data).success;
      `,
    },
    {
      name: 'schema imported elsewhere',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        external.safeParse(data).success;
      `,
    },
    {
      name: 'individual type-only import',
      code: dedent`
        import { type safeParse } from 'zod';
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
      name: 'boolean predicate receiver',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.isOptional().safeParse(data).success;
      `,
    },
    {
      name: 'nullable predicate receiver',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.isNullable().safeParse(data).success;
      `,
    },
    {
      name: 'metadata getter receiver',
      code: dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.meta().safeParse(data).success;
      `,
    },
  ],
  invalid: [
    suggest(
      'parenthesized computed success',
      "import * as z from 'zod'; const schema = z.string(); ((schema).safeParse(data))[(('success'))];",
      "import * as z from 'zod'; const schema = z.string(); ((schema).validate(data));",
    ),
    suggest(
      'parenthesized computed stored success',
      "import * as z from 'zod'; const schema = z.string(); const r = schema.safeParse(data); ((r))[(('success'))];",
      "import * as z from 'zod'; const schema = z.string(); const r = schema.validate(data); ((r));",
    ),
    suggest(
      'parenthesized computed method',
      "import * as z from 'zod'; const schema = z.string(); (schema)[(('safeParse'))](data).success;",
      "import * as z from 'zod'; const schema = z.string(); (schema)[(('validate'))](data);",
    ),
    suggest(
      'asserted success read',
      "import * as z from 'zod'; const schema = z.string(); schema.safeParse(data).success!;",
      "import * as z from 'zod'; const schema = z.string(); schema.validate(data)!;",
    ),
    suggest(
      'direct access',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.safeParse(data).success;
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.validate(data);
      `,
    ),
    suggest(
      'inline schema',
      dedent`
        import * as z from 'zod';
        z.string().safeParse(data).success;
      `,
      dedent`
        import * as z from 'zod';
        z.string().validate(data);
      `,
    ),
    suggest(
      'destructured success',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const { success } = schema.safeParse(data);
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const success = schema.validate(data);
      `,
    ),
    suggest(
      'destructured alias',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const { success: ok } = schema.safeParse(data);
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const ok = schema.validate(data);
      `,
    ),
    suggest(
      'stored result with multiple reads',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const result = schema.safeParse(data);
        if (result.success) log(result.success);
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const result = schema.validate(data);
        if (result) log(result);
      `,
    ),
    suggest(
      'immutable schema alias',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const alias = schema;
        alias.safeParse(data).success;
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const alias = schema;
        alias.validate(data);
      `,
    ),
    suggestAsync(
      'awaited direct access',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        (await schema.safeParseAsync(data)).success;
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        (await schema.validateAsync(data));
      `,
    ),
    suggestAsync(
      'awaited stored result',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const result = await schema.safeParseAsync(data);
        log(result.success);
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const result = await schema.validateAsync(data);
        log(result);
      `,
    ),
    suggestAsync(
      'awaited destructuring',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const { success: ok } = await schema.safeParseAsync(data);
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const ok = await schema.validateAsync(data);
      `,
    ),
    suggest(
      'standalone namespace',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        z.safeParse(schema, data).success;
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        z.validate(schema, data);
      `,
    ),
    suggestAsync(
      'standalone async namespace',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        (await z.safeParseAsync(schema, data)).success;
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        (await z.validateAsync(schema, data));
      `,
    ),
    suggest(
      'computed static properties',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema['safeParse'](data)['success'];
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema['validate'](data);
      `,
    ),
    suggest(
      'parenthesized schema and parse result',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        ((schema).safeParse(data)).success;
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        ((schema).validate(data));
      `,
    ),
    suggest(
      'comments in arguments',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.safeParse(/* input */ data, options).success;
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.validate(/* input */ data, options);
      `,
    ),
    suggest(
      'named parsing import',
      dedent`
        import { safeParse as parse } from 'zod';
        parse(schema, data).success;
      `,
      dedent`
        import { safeParse as parse, validate } from 'zod';
        validate(schema, data);
      `,
    ),
    suggest(
      'reuse validation alias',
      dedent`
        import { safeParse, validate as check } from 'zod';
        safeParse(schema, data).success;
      `,
      dedent`
        import { safeParse, validate as check } from 'zod';
        check(schema, data);
      `,
    ),
    suggest(
      'collision-free import',
      dedent`
        import { safeParse } from 'zod';
        function f(validate, validate2) { return safeParse(schema, data).success;
        }
      `,
      dedent`
        import { safeParse, validate as validate3 } from 'zod';
        function f(validate, validate2) { return validate3(schema, data);
        }
      `,
    ),
    suggestAsync(
      'async spa alias',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        (await schema.spa(data)).success;
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        (await schema.validateAsync(data));
      `,
    ),
    report(
      'comment in removed access',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        schema.safeParse(data). /* keep */ success;
      `,
    ),
    suggest(
      'default import',
      dedent`
        import z from 'zod';
        z.string().safeParse(data).success;
      `,
      dedent`
        import z from 'zod';
        z.string().validate(data);
      `,
    ),
    suggest(
      'named namespace alias',
      dedent`
        import { z as z } from 'zod';
        z.string().safeParse(data).success;
      `,
      dedent`
        import { z as z } from 'zod';
        z.string().validate(data);
      `,
    ),
    suggest(
      'factory z.coerce.number()',
      dedent`
        import * as z from 'zod';
        z.coerce.number().safeParse(data).success;
      `,
      dedent`
        import * as z from 'zod';
        z.coerce.number().validate(data);
      `,
    ),
    suggest(
      'factory z.iso.date()',
      dedent`
        import * as z from 'zod';
        z.iso.date().safeParse(data).success;
      `,
      dedent`
        import * as z from 'zod';
        z.iso.date().validate(data);
      `,
    ),
    suggest(
      'factory z.union([z.string(), z.number()])',
      dedent`
        import * as z from 'zod';
        z.union([z.string(), z.number()]).safeParse(data).success;
      `,
      dedent`
        import * as z from 'zod';
        z.union([z.string(), z.number()]).validate(data);
      `,
    ),
    suggest(
      'chained schema',
      dedent`
        import * as z from 'zod';
        z.string().min(1).safeParse(data).success;
      `,
      dedent`
        import * as z from 'zod';
        z.string().min(1).validate(data);
      `,
    ),
    suggest(
      'computed standalone',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        z['safeParse'](schema, data)['success'];
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        z['validate'](schema, data);
      `,
    ),
    suggestAsync(
      'computed async standalone',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        (await z['safeParseAsync'](schema, data))['success'];
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        (await z['validateAsync'](schema, data));
      `,
    ),
    suggestAsync(
      'named async parser',
      dedent`
        import { safeParseAsync } from 'zod';
        const { success } = await safeParseAsync(schema, data);
      `,
      dedent`
        import { safeParseAsync, validateAsync } from 'zod';
        const success = await validateAsync(schema, data);
      `,
    ),
    suggest(
      'parser using existing namespace',
      dedent`
        import * as z from 'zod';
        import { safeParse } from 'zod';
        safeParse(schema, data).success;
      `,
      dedent`
        import * as z from 'zod';
        import { safeParse } from 'zod';
        z.validate(schema, data);
      `,
    ),
    suggest(
      'shadowed validation import',
      dedent`
        import { safeParse, validate } from 'zod';
        function f(validate) { return safeParse(schema, data).success;
        }
      `,
      dedent`
        import { safeParse, validate, validate as validate2 } from 'zod';
        function f(validate) { return validate2(schema, data);
        }
      `,
    ),
    suggest(
      'parenthesized stored read',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const result = schema.safeParse(data);
        ((result)).success;
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const result = schema.validate(data);
        ((result));
      `,
    ),
    suggest(
      'static destructuring key',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const { ['success']: ok } = schema.safeParse(data);
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const ok = schema.validate(data);
      `,
    ),
    suggest(
      'repeated boolean declarations',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        let { success: ok } = schema.safeParse(data);
        ok = false;
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        let ok = schema.validate(data);
        ok = false;
      `,
    ),
    suggest(
      'alternative source',
      dedent`
        import * as z from 'zod/v4';
        z.string().safeParse(data).success;
      `,
      dedent`
        import * as z from 'zod/v4';
        z.string().validate(data);
      `,
    ),
    suggest(
      'factories beyond the base types: z.symbol()',
      dedent`
        import * as z from 'zod';
        z.symbol().safeParse(data).success;
      `,
      dedent`
        import * as z from 'zod';
        z.symbol().validate(data);
      `,
    ),
    suggest(
      'factories beyond the base types: z.keyof()',
      dedent`
        import * as z from 'zod';
        z.keyof(shape).safeParse(data).success;
      `,
      dedent`
        import * as z from 'zod';
        z.keyof(shape).validate(data);
      `,
    ),
    suggest(
      'factories beyond the base types: z.preprocess()',
      dedent`
        import * as z from 'zod';
        const schema = z.preprocess(coerce, z.string());
        schema.safeParse(data).success;
      `,
      dedent`
        import * as z from 'zod';
        const schema = z.preprocess(coerce, z.string());
        schema.validate(data);
      `,
    ),
    suggest(
      'property names do not rename the inserted import',
      dedent`
        import { safeParse } from 'zod';
        config.validate = true;
        const options = { validate: true, forward: config.validate };
        safeParse(schema, data).success;
      `,
      dedent`
        import { safeParse, validate } from 'zod';
        config.validate = true;
        const options = { validate: true, forward: config.validate };
        validate(schema, data);
      `,
    ),
    suggest(
      'computed property names are references and do rename the import',
      dedent`
        import { safeParse } from 'zod';
        const validate = 'key';
        const options = { [validate]: config[validate] };
        safeParse(schema, data).success;
      `,
      dedent`
        import { safeParse, validate as validate2 } from 'zod';
        const validate = 'key';
        const options = { [validate]: config[validate] };
        validate2(schema, data);
      `,
    ),
    report(
      'comment in destructuring',
      dedent`
        import * as z from 'zod';
        const schema = z.string();
        const { /* keep */ success } = schema.safeParse(data);
      `,
    ),
  ],
});
