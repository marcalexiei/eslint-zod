import { createSuggestionCases } from '@eslint-zod/tooling/vitest/rule-tester-cases';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noReshapeOnRefinedObject } from './no-reshape-on-refined-object.js';

const { suggest } = createSuggestionCases(noReshapeOnRefinedObject, {
  messageId: 'overwriteRefined',
  suggestionMessageId: 'useSafeExtend',
  data: { key: 'a' },
});

const ruleTester = new RuleTester();

ruleTester.run(noReshapeOnRefinedObject.name, noReshapeOnRefinedObject, {
  valid: [
    {
      name: 'reshaping before refining',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.string(), b: z.string() })
          .pick({ a: true })
          .refine((value) => value.a !== '');
      `,
    },
    {
      name: 'reshaping an object without refinements',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).describe('user');
        userSchema.omit({ a: true });
        userSchema.partial();
        userSchema.merge(z.object({ b: z.string() }));
      `,
    },
    {
      name: 'extend adding a new key to a refined object',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.string() })
          .refine((value) => value.a !== '')
          .extend({ b: z.string() });
      `,
    },
    {
      name: 'safeExtend overwriting a key of a refined object',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.string() })
          .refine((value) => value.a !== '')
          .safeExtend({ a: z.string().min(1) });
      `,
    },
    {
      name: 'required and keyof on a refined object',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        userSchema.required();
        userSchema.keyof();
      `,
    },
    {
      name: 'extend on a refined object whose shape is not a literal',
      code: dedent`
        import * as z from 'zod';
        export function withId(shape: z.ZodRawShape) {
          return z.object(shape).refine((value) => Object.keys(value).length > 0).extend({ id: z.string() });
        }
      `,
    },
    {
      name: 'merge with a refined object as the argument',
      code: dedent`
        import * as z from 'zod';
        const refinedSchema = z.object({ b: z.string() }).refine((value) => value.b !== '');
        z.object({ a: z.string() }).merge(refinedSchema);
      `,
    },
    {
      name: 'pick after apply rebuilds the object without its refinements',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.string() })
          .refine((value) => value.a !== '')
          .apply((schema) => z.object(schema.shape))
          .pick({ a: true });
      `,
    },
    {
      name: 'pick on a refined object bound with let',
      code: dedent`
        import * as z from 'zod';
        let userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        userSchema = z.object({ a: z.string() });
        userSchema.pick({ a: true });
      `,
    },
    {
      name: "extend with another schema's shape or a spread that has no common key",
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        const extraSchema = z.object({ b: z.number() });
        userSchema.extend({ ...extraSchema.shape, c: z.string() });
        userSchema.extend(extraSchema.shape);
      `,
    },
    {
      name: 'extend adding back a key that pick or omit removed',
      code: dedent`
        import * as z from 'zod';
        const baseSchema = z.object({ a: z.string(), b: z.string() });
        baseSchema
          .pick({ a: true })
          .refine((value) => value.a !== '')
          .extend({ b: z.number() });
        baseSchema
          .omit({ a: true })
          .refine((value) => value.b !== '')
          .extend({ a: z.number() });
      `,
    },
    {
      name: 'a local helper that rebuilds the object without its refinements',
      code: dedent`
        import * as z from 'zod';
        function withoutRefinements<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
          return z.object(schema.shape);
        }
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        withoutRefinements(userSchema).pick({ a: true });
      `,
    },
    {
      name: 'extend with keys the rule cannot read',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        const config = { fields: { b: z.number() } };
        userSchema.extend(config.fields);
        z.object().refine(() => true).extend({ a: z.string() });
        export function extendUser(shape: z.ZodRawShape, other: { shape: z.ZodRawShape }) {
          return [userSchema.extend(shape), userSchema.extend(other.shape)];
        }
      `,
    },
    {
      name: 'pick and omit with masks the rule cannot read',
      code: dedent`
        import * as z from 'zod';
        const baseSchema = z.object({ a: z.string(), b: z.string() });
        baseSchema.partial().pick({ a: true });
        export function reshape(mask: { a?: true; b?: true }) {
          return [
            baseSchema.pick(mask).refine(() => true).extend({ b: z.number() }),
            baseSchema.omit({ ...mask }).refine(() => true).extend({ a: z.number() }),
          ];
        }
      `,
    },
    {
      name: 'helpers and steps the rule cannot evaluate',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        async function load(schema: z.ZodObject) {
          return schema;
        }
        function describeUser(schema: z.ZodObject) {
          const description = 'user';
          return schema.describe(description);
        }
        const fromOptions = ({ schema }: { schema: z.ZodObject }) => schema;
        const identity = (schema: z.ZodObject) => schema;
        void load(userSchema);
        describeUser(userSchema).extend({ b: z.string() });
        fromOptions({ schema: userSchema }).extend({ b: z.string() });
        identity(...([userSchema] as const)).extend({ b: z.string() });
        z.object({ a: z.string() }).optional().unwrap().pick({ a: true });
        export function build(
          make: () => z.ZodObject,
          transform: (schema: z.ZodObject) => z.ZodObject,
          method: 'describe',
        ) {
          return [make().pick({ a: true }), userSchema.apply(transform), userSchema[method]('user')];
        }
      `,
    },
    {
      name: 'calls that leave the object without refinements',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        z.object({ a: z.string() }).check().pick({ a: true });
        z.object({ a: z.string() }).with(...[]).pick({ a: true });
        userSchema.clone({ ...userSchema.def, checks: [] }).pick({ a: true });
      `,
    },
    {
      name: 'a helper that reassigns its parameter before reshaping it',
      code: dedent`
        import * as z from 'zod';
        const second = <T>(_first: unknown, value: T) => value;
        function pickA(schema: z.ZodObject<{ a: z.ZodString }>) {
          return second((schema = z.object({ a: z.string() })), schema.pick({ a: true }));
        }
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        pickA(userSchema);
      `,
    },
    {
      name: 'extend with a __proto__ key, which sets the prototype instead',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.object({ ['__proto__']: z.string() }).refine(() => true);
        userSchema.extend({ __proto__: null, b: z.string() });
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import * as z from 'not-zod';
        z.object({ a: z.string() })
          .refine((value) => value.a !== '')
          .pick({ a: true });
      `,
    },
  ],
  invalid: [
    {
      name: 'pick on a refined object',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.string(), b: z.string() })
          .refine((value) => value.a !== value.b)
          .pick({ a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'pick' } }],
    },
    {
      name: 'omit, partial and merge on a refined object bound to a const',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        export const aSchema = userSchema.omit({ a: true });
        export const bSchema = userSchema.partial({ a: true });
        export const cSchema = userSchema.merge(z.object({ b: z.string() }));
      `,
      errors: [
        { messageId: 'reshapeRefined', data: { method: 'omit' }, line: 3 },
        { messageId: 'reshapeRefined', data: { method: 'partial' }, line: 4 },
        { messageId: 'reshapeRefined', data: { method: 'merge' }, line: 5 },
      ],
    },
    {
      name: 'every method that adds a check',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.string() })
          .superRefine((value, ctx) => {
            if (value.a === '') ctx.issues.push({ code: 'custom', input: value, message: 'empty' });
          })
          .pick({ a: true });
        z.object({ a: z.string() })
          .check((ctx) => {
            if (ctx.value.a === '') ctx.issues.push({ code: 'custom', input: ctx.value, message: 'empty' });
          })
          .pick({ a: true });
        z.object({ a: z.string() })
          .with((ctx) => {
            if (ctx.value.a === '') ctx.issues.push({ code: 'custom', input: ctx.value, message: 'empty' });
          })
          .pick({ a: true });
        z.object({ a: z.string() })
          .overwrite((value) => ({ ...value, a: value.a.trim() }))
          .pick({ a: true });
      `,
      errors: [
        { messageId: 'reshapeRefined', line: 6 },
        { messageId: 'reshapeRefined', line: 11 },
        { messageId: 'reshapeRefined', line: 16 },
        { messageId: 'reshapeRefined', line: 19 },
      ],
    },
    {
      name: 'methods that keep the refinement in between',
      code: dedent`
        import * as z from 'zod';
        z.strictObject({ a: z.string() })
          .refine((value) => value.a !== '')
          .describe('user')
          .meta({ id: 'user' })
          .strict()
          .required()
          .pick({ a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'pick' } }],
    },
    {
      name: 'followed across several bindings and an extend',
      code: dedent`
        import * as z from 'zod';
        const baseSchema = z.looseObject({ a: z.string() }).refine((value) => value.a !== '');
        const moreSchema = baseSchema.extend({ b: z.string() });
        export const pickedSchema = (moreSchema as typeof moreSchema).pick({ a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'pick' }, line: 4 }],
    },
    {
      name: 'merge takes the refinements of its argument',
      code: dedent`
        import * as z from 'zod';
        const refinedSchema = z.object({ b: z.string() }).refine((value) => value.b !== '');
        z.object({ a: z.string() }).merge(refinedSchema).pick({ a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'pick' } }],
    },
    {
      name: 'named import',
      code: dedent`
        import { object, string } from 'zod';
        object({ a: string() })
          .refine((value) => value.a !== '')
          .omit({ a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'omit' } }],
    },
    {
      name: 'pick after apply, which keeps the refinement',
      code: dedent`
        import * as z from 'zod';
        z.object({ a: z.string() })
          .refine((value) => value.a !== '')
          .apply((schema) => schema.describe('user'))
          .pick({ a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'pick' }, line: 5 }],
    },
    {
      name: 'local helpers that keep the refinement',
      code: dedent`
        import * as z from 'zod';
        function withId<T extends z.ZodObject>(schema: T) {
          return schema.extend({ id: z.string() });
        }
        const withCreatedAt = <T extends z.ZodObject>(schema: T) =>
          schema.extend({ createdAt: z.date() });
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        withId(userSchema).pick({ a: true });
        withCreatedAt(userSchema).omit({ a: true });
      `,
      errors: [
        { messageId: 'reshapeRefined', data: { method: 'pick' }, line: 8 },
        { messageId: 'reshapeRefined', data: { method: 'omit' }, line: 9 },
      ],
    },
    {
      name: 'a let binding that is never reassigned',
      code: dedent`
        import * as z from 'zod';
        let userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        userSchema.pick({ a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'pick' }, line: 3 }],
    },
    {
      name: 'local helpers that reshape the schema passed to them',
      code: dedent`
        import * as z from 'zod';
        function pickA(schema: z.ZodObject) {
          return schema.pick({ a: true });
        }
        const pickThroughHelper = (schema: z.ZodObject) => pickA(schema);
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        pickA(userSchema);
        pickThroughHelper(userSchema);
        pickA(z.object({ a: z.string() }));
        pickA(userSchema).extend({ b: z.string() });
      `,
      errors: [
        { messageId: 'reshapeRefinedInCall', data: { method: 'pick' }, line: 7 },
        { messageId: 'reshapeRefinedInCall', data: { method: 'pick' }, line: 8 },
        { messageId: 'reshapeRefinedInCall', data: { method: 'pick' }, line: 10 },
      ],
    },
    suggest(
      'an apply callback that overwrites a key',
      dedent`
        import * as z from 'zod';
        z.object({ a: z.string() })
          .refine((value) => value.a !== '')
          .apply((schema) => schema.extend({ a: z.number() }));
      `,
      dedent`
        import * as z from 'zod';
        z.object({ a: z.string() })
          .refine((value) => value.a !== '')
          .apply((schema) => schema.safeExtend({ a: z.number() }));
      `,
    ),
    {
      name: 'a helper reshaping a schema of its own is reported inside it, not at each call',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        function pickUser() {
          return userSchema.pick({ a: true });
        }
        pickUser();
        pickUser();
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'pick' }, line: 4 }],
    },
    suggest(
      'extend overwriting a known key next to keys the rule cannot read',
      dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        const extraShape = Object.fromEntries([['b', z.number()]]);
        userSchema.extend({ ...extraShape, a: z.number() });
      `,
      dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        const extraShape = Object.fromEntries([['b', z.number()]]);
        userSchema.safeExtend({ ...extraShape, a: z.number() });
      `,
    ),
    suggest(
      'extend overwriting a key that a pick mask binding kept',
      dedent`
        import * as z from 'zod';
        const baseSchema = z.object({ a: z.string(), b: z.string() });
        const mask = { a: true } as const;
        baseSchema
          .pick(mask)
          .refine((value) => value.a !== '')
          .extend({ a: z.number() });
      `,
      dedent`
        import * as z from 'zod';
        const baseSchema = z.object({ a: z.string(), b: z.string() });
        const mask = { a: true } as const;
        baseSchema
          .pick(mask)
          .refine((value) => value.a !== '')
          .safeExtend({ a: z.number() });
      `,
    ),
    suggest(
      "extend overwriting a key through another schema's shape",
      dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        const otherSchema = z.object({ a: z.number() });
        userSchema.extend(otherSchema.shape);
      `,
      dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        const otherSchema = z.object({ a: z.number() });
        userSchema.safeExtend(otherSchema.shape);
      `,
    ),
    suggest(
      'extend overwriting a key through a spread',
      dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        const otherSchema = z.object({ a: z.number() });
        userSchema.extend({ ...otherSchema.shape, c: z.string() });
      `,
      dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        const otherSchema = z.object({ a: z.number() });
        userSchema.safeExtend({ ...otherSchema.shape, c: z.string() });
      `,
    ),
    suggest(
      'extend overwriting a key the object got from a spread',
      dedent`
        import * as z from 'zod';
        const baseSchema = z.object({ a: z.string() });
        z.object({ ...baseSchema.shape, c: z.string() })
          .refine((value) => value.a !== value.c)
          .extend({ a: z.number() });
      `,
      dedent`
        import * as z from 'zod';
        const baseSchema = z.object({ a: z.string() });
        z.object({ ...baseSchema.shape, c: z.string() })
          .refine((value) => value.a !== value.c)
          .safeExtend({ a: z.number() });
      `,
    ),
    suggest(
      'extend overwriting a key of a refined object',
      dedent`
        import * as z from 'zod';
        z.object({ a: z.string() })
          .refine((value) => value.a !== '')
          .extend({ a: z.string().min(1) });
      `,
      dedent`
        import * as z from 'zod';
        z.object({ a: z.string() })
          .refine((value) => value.a !== '')
          .safeExtend({ a: z.string().min(1) });
      `,
    ),
    suggest(
      'extend overwriting a key declared through a const shape, written as a string key',
      dedent`
        import * as z from 'zod';
        const shape = { a: z.string(), b: z.string() };
        const userSchema = z.object(shape).refine((value) => value.a !== value.b);
        export const otherSchema = userSchema.extend({ c: z.string(), 'a': z.string().min(1) });
      `,
      dedent`
        import * as z from 'zod';
        const shape = { a: z.string(), b: z.string() };
        const userSchema = z.object(shape).refine((value) => value.a !== value.b);
        export const otherSchema = userSchema.safeExtend({ c: z.string(), 'a': z.string().min(1) });
      `,
    ),
    suggest(
      'extend called through a computed member',
      dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        export const otherSchema = userSchema['extend']({ a: z.string().min(1) });
      `,
      dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        export const otherSchema = userSchema['safeExtend']({ a: z.string().min(1) });
      `,
    ),
    {
      name: 'exactPartial, and reshapes behind optional chaining',
      code: dedent`
        import * as z from 'zod';
        const userSchema = z.object({ a: z.string() }).refine((value) => value.a !== '');
        userSchema.exactPartial();
        userSchema?.pick({ a: true });
        const extendedSchema = userSchema?.extend({ b: z.string() });
        extendedSchema.omit({ a: true });
      `,
      errors: [
        { messageId: 'reshapeRefined', data: { method: 'exactPartial' }, line: 3 },
        { messageId: 'reshapeRefined', data: { method: 'pick' }, line: 4 },
        { messageId: 'reshapeRefined', data: { method: 'omit' }, line: 6 },
      ],
    },
    {
      name: 'bindings and helpers shared at every level are evaluated once',
      code: [
        "import * as z from 'zod';",
        'const s0 = z.object({ a: z.string() });',
        ...Array.from({ length: 40 }, (_, i) => `const s${i + 1} = s${i}.extend(s${i}.shape);`),
        "const f0 = (schema: z.ZodObject): z.ZodObject => schema.describe('user');",
        ...Array.from(
          { length: 10 },
          (_, i) => `const f${i + 1} = (schema: z.ZodObject): z.ZodObject => f${i}(f${i}(schema));`,
        ),
        'f10(s40.refine(() => true)).pick({ a: true });',
      ].join('\n'),
      errors: [{ messageId: 'reshapeRefined', data: { method: 'pick' } }],
    },
  ],
});
