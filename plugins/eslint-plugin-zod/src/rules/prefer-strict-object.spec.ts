import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferStrictObject } from './prefer-strict-object.js';

const ruleTester = new RuleTester();

ruleTester.run(preferStrictObject.name, preferStrictObject, {
  valid: [
    {
      name: 'strictObject is valid',
      code: dedent`
        import { z } from 'zod';
        z.strictObject({ a: z.string() });
      `,
    },
    {
      name: 'looseObject is valid',
      code: dedent`
        import { z } from 'zod';
        z.looseObject({ a: z.string() });
      `,
    },
    {
      name: 'object is valid',
      code: dedent`
        import { z } from 'zod';
        z.object({ a: z.string() });
      `,
    },
    {
      name: 'object with passthrough is valid for this rule',
      code: dedent`
        import { z } from 'zod';
        z.object({ a: z.string() }).passthrough();
      `,
    },
    {
      name: 'strict on schema variable is valid',
      code: dedent`
        import { z } from 'zod';
        const schema = z.object({ a: z.string() });
        schema.strict();
      `,
    },
    {
      name: 'property named like the modifier',
      code: dedent`
        import * as z from 'zod';
        z.object({ strict: z.boolean() }).shape.strict.optional();
      `,
    },
  ],
  invalid: [
    {
      name: 'no fix when it would bring back dropped metadata',
      code: dedent`
        import * as z from 'zod';
        z.object({}).meta({ title: 't' }).strict();
      `,
      errors: [{ messageId: 'preferStrictObject' }],
      output: null,
    },
    {
      name: 'fixed when optional() drops the description anyway',
      code: dedent`
        import * as z from 'zod';
        z.object({}).describe('a').strict().optional();
      `,
      errors: [{ messageId: 'preferStrictObject' }],
      output: dedent`
        import * as z from 'zod';
        z.strictObject({}).describe('a').optional();
      `,
    },
    {
      name: 'prefer strictObject over object().strict()',
      code: dedent`
        import { z } from 'zod';
        z.object({ a: z.string() }).strict();
      `,
      output: dedent`
        import { z } from 'zod';
        z.strictObject({ a: z.string() });
      `,
      errors: [{ messageId: 'preferStrictObject' }],
    },
    {
      name: 'prefer strictObject over object().describe().strict()',
      code: dedent`
        import { z } from 'zod';
        z.object({ a: z.string() }).describe("desc").strict();
      `,
      output: null,
      errors: [{ messageId: 'preferStrictObject' }],
    },
    {
      name: 'prefer strictObject for nested object schema',
      code: dedent`
        import { z } from 'zod';
        z.object({ nested: z.object({ a: z.string() }).strict() });
      `,
      output: dedent`
        import { z } from 'zod';
        z.object({ nested: z.strictObject({ a: z.string() }) });
      `,
      errors: [{ messageId: 'preferStrictObject' }],
    },
    {
      name: 'strict with unexpected argument is reported without fix',
      code: dedent`
        import { z } from 'zod';
        z.object({ a: z.string() }).strict({ message: 'Custom message' });
      `,
      output: null,
      errors: [{ messageId: 'preferStrictObject' }],
    },
    {
      name: 'named imports',
      code: dedent`
        import { object, string } from 'zod';
        object({ a: string() }).strict();
      `,
      errors: [{ messageId: 'preferStrictObject' }],
    },
    {
      name: 'computed object access is reported but not fixed — the chain walker cannot name it',
      code: dedent`
        import * as z from 'zod';
        z['object']({ a: z.string() }).strict();
      `,
      output: null,
      errors: [{ messageId: 'preferStrictObject' }],
    },
    {
      name: 'catchall set before the modifier — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.string() }).catchall(z.string()).strict();
      `,
      errors: [{ messageId: 'preferStrictObject' }],
      output: null,
    },
    {
      name: 'modifier called after a property access — reported without a fix, and must not crash',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.object({ b: z.string() }) }).shape.a.strict();
        z.object({ a: z.object({ b: z.string() }) }).shape.a.partial().strict();
      `,
      errors: [{ messageId: 'preferStrictObject' }, { messageId: 'preferStrictObject' }],
      output: null,
    },
    {
      name: 'comment inside the removed modifier or the renamed factory — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.string() }).strict(/* keep */);
        z./* keep */ object({ a: z.string() }).strict();
      `,
      errors: [{ messageId: 'preferStrictObject' }, { messageId: 'preferStrictObject' }],
      output: null,
    },
  ],
});
