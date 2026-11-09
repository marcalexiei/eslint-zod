# zod/no-reshape-on-refined-object

📝 Disallow reshaping an object schema after a refinement, which throws at runtime.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

Zod throws when an object schema that has a refinement is reshaped.
TypeScript accepts the code, so the error first shows up when the module loads.

This rule reports:

- `.pick()`, `.omit()`, `.partial()` and `.merge()` on an object schema with a refinement, which always throw;
- `.extend()` when it overwrites a key the object already has, which throws with "Cannot overwrite keys on object schemas containing refinements".

A refinement is anything that adds a check: `.refine()`, `.superRefine()`, `.check()`, `.with()` and `.overwrite()`.
Zod keeps the checks through `.describe()`, `.meta()`, `.brand()`, `.register()`, `.clone()`, `.required()`, `.extend()`, `.safeExtend()`, `.catchall()` and the unknown-key methods (`.strict()`, `.strip()`, `.loose()`, `.passthrough()`), so the rule follows the object through them.
`.merge()` takes the refinements of its argument.

The object is followed through `const` bindings, and `let` bindings that are never reassigned,
so a refined schema declared once and reshaped elsewhere in the file is reported too.
It is also followed into `.apply()` callbacks and local functions whose body is a single `return`.
When a named function reaches `.pick()` or another throwing call on the schema passed to it, the call that passes the schema is reported.
Keys are read from object literals, spreads, `.shape` and `pick`/`omit` masks, so `.extend(otherSchema.shape)` is reported when it overwrites a key.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod';

const userSchema = z
  .object({ password: z.string(), confirm: z.string() })
  .refine((value) => value.password === value.confirm);

userSchema.pick({ password: true });
userSchema.omit({ confirm: true });
userSchema.partial();
userSchema.merge(z.object({ name: z.string() }));
userSchema.extend({ password: z.string().min(12) }); // overwrites `password`
```

### ✅ Valid

```ts
import * as z from 'zod';

const baseSchema = z.object({ password: z.string(), confirm: z.string() });

// reshape first, refine after
const userSchema = baseSchema.refine((value) => value.password === value.confirm);
const passwordSchema = baseSchema.pick({ password: true });

// adding a new key is fine
userSchema.extend({ name: z.string() });

// safeExtend may overwrite keys
userSchema.safeExtend({ password: z.string().min(12) });

// required and keyof do not throw
userSchema.required();
userSchema.keyof();
```

## Suggestions

For an `.extend()` that overwrites a key, the rule suggests `.safeExtend()`.
It is a suggestion rather than a fix: `.safeExtend()` keeps running the refinement against the new shape, and that refinement may no longer fit it.

## Limitations

`.extend()` is reported only for a key both shapes are known to have.
A key the rule cannot read, from a function parameter or a computed name, may well be new, so it is not reported.

The rule stops following the object at any step it cannot prove:
a reassigned binding, an imported schema, or a function with more than one statement or a destructured parameter.

## Further Reading

- [Zod: `.extend()`](https://zod.dev/api?id=extend)
- [Zod: `.safeExtend()`](https://zod.dev/api?id=safeextend)
- [Zod: refinements](https://zod.dev/api?id=refinements)
