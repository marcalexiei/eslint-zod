import { createSuggestionCases } from '@eslint-zod/tooling/vitest/rule-tester-cases';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noReshapeOnRefinedObject } from './no-reshape-on-refined-object.js';

const { suggest } = createSuggestionCases(noReshapeOnRefinedObject, {
  messageId: 'overwriteRefined',
  suggestionMessageId: 'useSafeExtend',
  data: { key: 'a', method: 'z.extend' },
});

const named = createSuggestionCases(noReshapeOnRefinedObject, {
  messageId: 'overwriteRefined',
  suggestionMessageId: 'useSafeExtend',
  data: { key: 'a', method: 'extend' },
});

const ruleTester = new RuleTester();

ruleTester.run(noReshapeOnRefinedObject.name, noReshapeOnRefinedObject, {
  valid: [
    {
      name: 'reshaping before adding checks',
      code: dedent`
        import * as z from 'zod/mini';
        z.pick(z.object({ a: z.string(), b: z.string() }), { a: true }).check(
          z.refine((value) => value.a !== ''),
        );
      `,
    },
    {
      name: 'reshaping an object without checks',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() });
        z.omit(userSchema, { a: true });
        z.partial(userSchema);
        z.merge(userSchema, z.object({ b: z.string() }));
      `,
    },
    {
      name: 'extend adding a new key to an object with checks',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        z.extend(userSchema, { b: z.string() });
      `,
    },
    {
      name: 'safeExtend overwriting a key of an object with checks',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        z.safeExtend(userSchema, { a: z.string().check(z.minLength(1)) });
      `,
    },
    {
      name: 'required and keyof on an object with checks',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        z.required(userSchema);
        z.keyof(userSchema);
      `,
    },
    {
      name: 'extend on an object with checks whose shape is not a literal',
      code: dedent`
        import * as z from 'zod/mini';
        export function withId(shape: z.core.$ZodShape) {
          const schema = z.object(shape).check(z.refine((value) => Object.keys(value).length > 0));
          return z.extend(schema, { id: z.string() });
        }
      `,
    },
    {
      name: 'merge with an object with checks as the second argument',
      code: dedent`
        import * as z from 'zod/mini';
        const refinedSchema = z.object({ b: z.string() }).check(z.refine((value) => value.b !== ''));
        z.merge(z.object({ a: z.string() }), refinedSchema);
      `,
    },
    {
      name: 'pick after apply rebuilds the object without its refinements',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z
          .object({ a: z.string() })
          .check(z.refine((value) => value.a !== ''))
          .apply((schema) => z.object(schema.shape));
        z.pick(userSchema, { a: true });
      `,
    },
    {
      name: 'pick on an object with checks bound with let',
      code: dedent`
        import * as z from 'zod/mini';
        let userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        userSchema = z.object({ a: z.string() });
        z.pick(userSchema, { a: true });
      `,
    },
    {
      name: "extend with another schema's shape or a spread that has no common key",
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        const extraSchema = z.object({ b: z.number() });
        z.extend(userSchema, { ...extraSchema.shape, c: z.string() });
        z.extend(userSchema, extraSchema.shape);
      `,
    },
    {
      name: 'extend adding back a key that pick or omit removed',
      code: dedent`
        import * as z from 'zod/mini';
        const baseSchema = z.object({ a: z.string(), b: z.string() });
        const pickedSchema = z.pick(baseSchema, { a: true }).check(z.refine((value) => value.a !== ''));
        const omittedSchema = z.omit(baseSchema, { a: true }).check(z.refine((value) => value.b !== ''));
        z.extend(pickedSchema, { b: z.number() });
        z.extend(omittedSchema, { a: z.number() });
      `,
    },
    {
      name: 'a local helper that rebuilds the object without its checks',
      code: dedent`
        import * as z from 'zod/mini';
        function withoutChecks<T extends z.core.$ZodShape>(schema: z.ZodMiniObject<T>) {
          return z.object(schema.shape);
        }
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        z.pick(withoutChecks(userSchema), { a: true });
      `,
    },
    {
      name: 'extend with keys the rule cannot read',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        const config = { fields: { b: z.number() } };
        z.extend(userSchema, config.fields);
        z.extend(z.object().check(z.refine(() => true)), { a: z.string() });
        export function extendUser(shape: z.core.$ZodShape, other: { shape: z.core.$ZodShape }) {
          return [z.extend(userSchema, shape), z.extend(userSchema, other.shape)];
        }
      `,
    },
    {
      name: 'pick and omit with masks the rule cannot read',
      code: dedent`
        import * as z from 'zod/mini';
        const baseSchema = z.object({ a: z.string(), b: z.string() });
        z.pick(z.partial(baseSchema), { a: true });
        export function reshape(mask: { a?: true; b?: true }) {
          return [
            z.extend(z.pick(baseSchema, mask).check(z.refine(() => true)), { b: z.number() }),
            z.extend(z.omit(baseSchema, { ...mask }).check(z.refine(() => true)), { a: z.number() }),
          ];
        }
      `,
    },
    {
      name: 'helpers and steps the rule cannot evaluate',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        async function load(schema: z.ZodMiniObject) {
          return schema;
        }
        function brandUser(schema: z.ZodMiniObject) {
          const copy = schema.clone();
          return copy.brand<'User'>();
        }
        const fromOptions = ({ schema }: { schema: z.ZodMiniObject }) => schema;
        const identity = (schema: z.ZodMiniObject) => schema;
        void load(userSchema);
        z.extend(brandUser(userSchema), { b: z.string() });
        z.extend(fromOptions({ schema: userSchema }), { b: z.string() });
        z.extend(identity(...([userSchema] as const)), { b: z.string() });
        z.pick(z.optional(z.object({ a: z.string() })).def.innerType, { a: true });
        export function build(
          make: () => z.ZodMiniObject,
          transform: (schema: z.ZodMiniObject) => z.ZodMiniObject,
          method: 'clone',
        ) {
          return [z.pick(make(), { a: true }), userSchema.apply(transform), userSchema[method]()];
        }
      `,
    },
    {
      name: 'calls that leave the object without checks',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        z.pick(z.object({ a: z.string() }).check(), { a: true });
        z.pick(z.object({ a: z.string() }).with(...[]), { a: true });
        z.pick(userSchema.clone({ ...userSchema.def, checks: [] }), { a: true });
      `,
    },
    {
      name: 'a helper that reassigns its parameter before reshaping it',
      code: dedent`
        import * as z from 'zod/mini';
        const second = <T>(_first: unknown, value: T) => value;
        function pickA(schema: z.ZodMiniObject<{ a: z.ZodMiniString }>) {
          return second((schema = z.object({ a: z.string() })), z.pick(schema, { a: true }));
        }
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        pickA(userSchema);
      `,
    },
    {
      name: 'extend with a __proto__ key, which sets the prototype instead',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ ['__proto__']: z.string() }).check(z.refine(() => true));
        z.extend(userSchema, { __proto__: null, b: z.string() });
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import * as z from 'not-zod';
        z.pick(z.object({ a: z.string() }).check(z.refine((value) => value.a !== '')), { a: true });
      `,
    },
  ],
  invalid: [
    {
      name: 'pick on an object with checks',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z
          .object({ a: z.string(), b: z.string() })
          .check(z.refine((value) => value.a !== value.b));
        z.pick(userSchema, { a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'z.pick' }, line: 5 }],
    },
    {
      name: 'omit, partial and merge on an object with checks',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        export const aSchema = z.omit(userSchema, { a: true });
        export const bSchema = z.partial(userSchema, { a: true });
        export const cSchema = z.merge(userSchema, z.object({ b: z.string() }));
      `,
      errors: [
        { messageId: 'reshapeRefined', data: { method: 'z.omit' }, line: 3 },
        { messageId: 'reshapeRefined', data: { method: 'z.partial' }, line: 4 },
        { messageId: 'reshapeRefined', data: { method: 'z.merge' }, line: 5 },
      ],
    },
    {
      name: 'every check counts, including describe and meta',
      code: dedent`
        import * as z from 'zod/mini';
        const aSchema = z.object({ a: z.string() }).with(z.refine((value) => value.a !== ''));
        const bSchema = z.object({ a: z.string() }).check(z.describe('user'));
        const cSchema = z.object({ a: z.string() }).check(z.meta({ id: 'user' }));
        z.pick(aSchema, { a: true });
        z.pick(bSchema, { a: true });
        z.pick(cSchema, { a: true });
      `,
      errors: [
        { messageId: 'reshapeRefined', line: 5 },
        { messageId: 'reshapeRefined', line: 6 },
        { messageId: 'reshapeRefined', line: 7 },
      ],
    },
    {
      name: 'methods and factories that keep the checks in between',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z
          .strictObject({ a: z.string() })
          .check(z.refine((value) => value.a !== ''))
          .brand<'User'>();
        z.pick(z.required(z.catchall(userSchema, z.string())), { a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'z.pick' }, line: 6 }],
    },
    {
      name: 'followed across several bindings and an extend',
      code: dedent`
        import * as z from 'zod/mini';
        const baseSchema = z.looseObject({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        const moreSchema = z.extend(baseSchema, { b: z.string() });
        export const pickedSchema = z.pick(moreSchema as typeof moreSchema, { a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'z.pick' }, line: 4 }],
    },
    {
      name: 'merge takes the checks of its second argument',
      code: dedent`
        import * as z from 'zod/mini';
        const refinedSchema = z.object({ b: z.string() }).check(z.refine((value) => value.b !== ''));
        z.pick(z.merge(z.object({ a: z.string() }), refinedSchema), { a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'z.pick' } }],
    },
    {
      name: 'pick after apply, which keeps the checks',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z
          .object({ a: z.string() })
          .check(z.refine((value) => value.a !== ''))
          .apply((schema) => schema.brand<'User'>());
        z.pick(userSchema, { a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'z.pick' }, line: 6 }],
    },
    {
      name: 'local helpers that keep the checks',
      code: dedent`
        import * as z from 'zod/mini';
        function withId<T extends z.ZodMiniObject>(schema: T) {
          return z.extend(schema, { id: z.string() });
        }
        const withCreatedAt = <T extends z.ZodMiniObject>(schema: T) =>
          z.extend(schema, { createdAt: z.date() });
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        z.pick(withId(userSchema), { a: true });
        z.omit(withCreatedAt(userSchema), { a: true });
      `,
      errors: [
        { messageId: 'reshapeRefined', data: { method: 'z.pick' }, line: 8 },
        { messageId: 'reshapeRefined', data: { method: 'z.omit' }, line: 9 },
      ],
    },
    {
      name: 'a let binding that is never reassigned',
      code: dedent`
        import * as z from 'zod/mini';
        let userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        z.pick(userSchema, { a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'z.pick' }, line: 3 }],
    },
    {
      name: 'local helpers that reshape the schema passed to them',
      code: dedent`
        import * as z from 'zod/mini';
        function pickA(schema: z.ZodMiniObject) {
          return z.pick(schema, { a: true });
        }
        const pickThroughHelper = (schema: z.ZodMiniObject) => pickA(schema);
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        pickA(userSchema);
        pickThroughHelper(userSchema);
        pickA(z.object({ a: z.string() }));
        z.extend(pickA(userSchema), { b: z.string() });
      `,
      errors: [
        { messageId: 'reshapeRefinedInCall', data: { method: 'z.pick' }, line: 7 },
        { messageId: 'reshapeRefinedInCall', data: { method: 'z.pick' }, line: 8 },
        { messageId: 'reshapeRefinedInCall', data: { method: 'z.pick' }, line: 10 },
      ],
    },
    suggest(
      'an apply callback that overwrites a key',
      dedent`
        import * as z from 'zod/mini';
        z.object({ a: z.string() })
          .check(z.refine((value) => value.a !== ''))
          .apply((schema) => z.extend(schema, { a: z.number() }));
      `,
      dedent`
        import * as z from 'zod/mini';
        z.object({ a: z.string() })
          .check(z.refine((value) => value.a !== ''))
          .apply((schema) => z.safeExtend(schema, { a: z.number() }));
      `,
    ),
    {
      name: 'a helper reshaping a schema of its own is reported inside it, not at each call',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        function pickUser() {
          return z.pick(userSchema, { a: true });
        }
        pickUser();
        pickUser();
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'z.pick' }, line: 4 }],
    },
    suggest(
      'extend overwriting a known key next to keys the rule cannot read',
      dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        const extraShape = Object.fromEntries([['b', z.number()]]);
        z.extend(userSchema, { ...extraShape, a: z.number() });
      `,
      dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        const extraShape = Object.fromEntries([['b', z.number()]]);
        z.safeExtend(userSchema, { ...extraShape, a: z.number() });
      `,
    ),
    suggest(
      'extend overwriting a key that a pick mask binding kept',
      dedent`
        import * as z from 'zod/mini';
        const baseSchema = z.object({ a: z.string(), b: z.string() });
        const mask = { a: true } as const;
        const pickedSchema = z.pick(baseSchema, mask).check(z.refine((value) => value.a !== ''));
        z.extend(pickedSchema, { a: z.number() });
      `,
      dedent`
        import * as z from 'zod/mini';
        const baseSchema = z.object({ a: z.string(), b: z.string() });
        const mask = { a: true } as const;
        const pickedSchema = z.pick(baseSchema, mask).check(z.refine((value) => value.a !== ''));
        z.safeExtend(pickedSchema, { a: z.number() });
      `,
    ),
    suggest(
      "extend overwriting a key through another schema's shape",
      dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        const otherSchema = z.object({ a: z.number() });
        z.extend(userSchema, otherSchema.shape);
      `,
      dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        const otherSchema = z.object({ a: z.number() });
        z.safeExtend(userSchema, otherSchema.shape);
      `,
    ),
    suggest(
      'extend overwriting a key through a spread',
      dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        const otherSchema = z.object({ a: z.number() });
        z.extend(userSchema, { ...otherSchema.shape, c: z.string() });
      `,
      dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        const otherSchema = z.object({ a: z.number() });
        z.safeExtend(userSchema, { ...otherSchema.shape, c: z.string() });
      `,
    ),
    suggest(
      'extend overwriting a key the object got from a spread',
      dedent`
        import * as z from 'zod/mini';
        const baseSchema = z.object({ a: z.string() });
        const userSchema = z
          .object({ ...baseSchema.shape, c: z.string() })
          .check(z.refine((value) => value.a !== value.c));
        z.extend(userSchema, { a: z.number() });
      `,
      dedent`
        import * as z from 'zod/mini';
        const baseSchema = z.object({ a: z.string() });
        const userSchema = z
          .object({ ...baseSchema.shape, c: z.string() })
          .check(z.refine((value) => value.a !== value.c));
        z.safeExtend(userSchema, { a: z.number() });
      `,
    ),
    suggest(
      'extend overwriting a key of an object with checks',
      dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        z.extend(userSchema, { a: z.string().check(z.minLength(1)) });
      `,
      dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        z.safeExtend(userSchema, { a: z.string().check(z.minLength(1)) });
      `,
    ),
    suggest(
      'extend overwriting a key declared through a const shape, written as a string key',
      dedent`
        import * as z from 'zod/mini';
        const shape = { a: z.string(), b: z.string() };
        const userSchema = z.object(shape).check(z.refine((value) => value.a !== value.b));
        export const otherSchema = z.extend(userSchema, { c: z.string(), 'a': z.string().check(z.minLength(1)) });
      `,
      dedent`
        import * as z from 'zod/mini';
        const shape = { a: z.string(), b: z.string() };
        const userSchema = z.object(shape).check(z.refine((value) => value.a !== value.b));
        export const otherSchema = z.safeExtend(userSchema, { c: z.string(), 'a': z.string().check(z.minLength(1)) });
      `,
    ),
    named.suggest(
      'named import renames to the local name of safeExtend',
      dedent`
        import { extend, minLength, object, refine, safeExtend as safe, string } from 'zod/mini';
        const userSchema = object({ a: string() }).check(refine((value) => value.a !== ''));
        extend(userSchema, { a: string().check(minLength(1)) });
      `,
      dedent`
        import { extend, minLength, object, refine, safeExtend as safe, string } from 'zod/mini';
        const userSchema = object({ a: string() }).check(refine((value) => value.a !== ''));
        safe(userSchema, { a: string().check(minLength(1)) });
      `,
    ),
    named.report(
      'named import offers no suggestion when safeExtend is not imported',
      dedent`
        import { extend, minLength, object, refine, string } from 'zod/mini';
        const userSchema = object({ a: string() }).check(refine((value) => value.a !== ''));
        extend(userSchema, { a: string().check(minLength(1)) });
      `,
    ),
    {
      name: 'exactPartial, and reshapes behind optional chaining',
      code: dedent`
        import * as z from 'zod/mini';
        const userSchema = z.object({ a: z.string() }).check(z.refine((value) => value.a !== ''));
        z.exactPartial(userSchema);
        z.pick(userSchema?.brand<'User'>(), { a: true });
        const brandedSchema = userSchema?.brand<'User'>();
        z.omit(brandedSchema, { a: true });
      `,
      errors: [
        { messageId: 'reshapeRefined', data: { method: 'z.exactPartial' }, line: 3 },
        { messageId: 'reshapeRefined', data: { method: 'z.pick' }, line: 4 },
        { messageId: 'reshapeRefined', data: { method: 'z.omit' }, line: 6 },
      ],
    },
    {
      name: 'bindings and helpers shared at every level are evaluated once',
      code: [
        "import * as z from 'zod/mini';",
        'const s0 = z.object({ a: z.string() });',
        ...Array.from({ length: 40 }, (_, i) => `const s${i + 1} = z.extend(s${i}, s${i}.shape);`),
        'const f0 = (schema: z.ZodMiniObject): z.ZodMiniObject => schema.clone();',
        ...Array.from(
          { length: 10 },
          (_, i) =>
            `const f${i + 1} = (schema: z.ZodMiniObject): z.ZodMiniObject => f${i}(f${i}(schema));`,
        ),
        'z.pick(f10(s40.check(z.refine(() => true))), { a: true });',
      ].join('\n'),
      errors: [{ messageId: 'reshapeRefined', data: { method: 'z.pick' } }],
    },
    {
      name: 'named import is reported by its local name',
      code: dedent`
        import { object, omit as without, refine, string } from 'zod/mini';
        const userSchema = object({ a: string() }).check(refine((value) => value.a !== ''));
        without(userSchema, { a: true });
      `,
      errors: [{ messageId: 'reshapeRefined', data: { method: 'without' } }],
    },
  ],
});
