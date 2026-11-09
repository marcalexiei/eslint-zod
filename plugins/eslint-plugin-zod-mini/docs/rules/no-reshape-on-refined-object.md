# zod-mini/no-reshape-on-refined-object

📝 Disallow reshaping an object schema after a check, which throws at runtime.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

Zod throws when an object schema that has a check is reshaped.
TypeScript accepts the code, so the error first shows up when the module loads.

This rule reports:

- `z.pick()`, `z.omit()`, `z.partial()` and `z.merge()` on an object schema with a check, which always throw;
- `z.extend()` when it overwrites a key the object already has, which throws with "Cannot overwrite keys on object schemas containing refinements".

Any `.check()` or `.with()` argument counts, not only `z.refine()`:
`.check(z.describe('…'))` and `.check(z.meta({…}))` add a check too, and make `z.pick()` throw.
Zod keeps the checks through `.brand()`, `.register()`, `.clone()`, `z.required()`, `z.extend()`, `z.safeExtend()` and `z.catchall()`, so the rule follows the object through them.
`z.merge()` takes the checks of its second argument.

The object is followed through `const` bindings, and `let` bindings that are never reassigned,
so a schema declared once and reshaped elsewhere in the file is reported too.
It is also followed into `.apply()` callbacks and local functions whose body is a single `return`.
When such a function reaches `z.pick()` or another throwing call on the schema passed to it, the call that passes the schema is reported.
Keys are read from object literals, spreads, `.shape` and `pick`/`omit` masks, so `z.extend(schema, otherSchema.shape)` is reported when it overwrites a key.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

const userSchema = z
  .object({ password: z.string(), confirm: z.string() })
  .check(z.refine((value) => value.password === value.confirm));

z.pick(userSchema, { password: true });
z.omit(userSchema, { confirm: true });
z.partial(userSchema);
z.merge(userSchema, z.object({ name: z.string() }));
z.extend(userSchema, { password: z.string().check(z.minLength(12)) }); // overwrites `password`

const describedSchema = z.object({ name: z.string() }).check(z.describe('A user'));
z.pick(describedSchema, { name: true });
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

const baseSchema = z.object({ password: z.string(), confirm: z.string() });

// reshape first, add checks after
const userSchema = baseSchema.check(z.refine((value) => value.password === value.confirm));
const passwordSchema = z.pick(baseSchema, { password: true });

// adding a new key is fine
z.extend(userSchema, { name: z.string() });

// safeExtend may overwrite keys
z.safeExtend(userSchema, { password: z.string().check(z.minLength(12)) });

// required and keyof do not throw
z.required(userSchema);
z.keyof(userSchema);
```

## Suggestions

For a `z.extend()` that overwrites a key, the rule suggests `z.safeExtend()`.
It is a suggestion rather than a fix: `z.safeExtend()` keeps running the checks against the new shape, and they may no longer fit it.
With a named import, the suggestion is offered only when `safeExtend` is imported.

## Limitations

`z.extend()` is reported only for a key both shapes are known to have.
A key the rule cannot read, from a function parameter or a computed name, may well be new, so it is not reported.

The rule stops following the object at any step it cannot prove:
a reassigned binding, an imported schema, or a function with more than one statement or a destructured parameter.

## Further Reading

- [Zod: `.extend()`](https://zod.dev/api?id=extend)
- [Zod: `.safeExtend()`](https://zod.dev/api?id=safeextend)
- [Zod Mini](https://zod.dev/packages/mini)
