# zod/no-unnecessary-readonly

📝 Disallow `.readonly()` on schemas whose output is already immutable.

💼 This rule is enabled in the 🔒 `strict` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

`.readonly()` on an already-immutable schema has no effect on the inferred type — `Readonly<string>` is just `string` — and no runtime effect either, since freezing a primitive is a no-op. It is pure noise.

This rule flags `.readonly()` when the schema it wraps is already immutable:

- primitives / scalars (`z.string()`, `z.number()`, `z.boolean()`, `z.bigint()`, `z.date()`, `z.literal()`, `z.enum()`, number sub-types such as `z.int()`, top-level string formats such as `z.email()`, …)
- a schema that is already `readonly` (a doubled `.readonly().readonly()`)

Immutability is looked up through passthrough wrappers, so `z.optional(z.string()).readonly()` is flagged too.

## Why?

Keeping `readonly` only where it matters makes the deliberate uses stand out:

```ts
import * as z from 'zod';

const config = z.object({ name: z.string() }).readonly(); // meaningful
const name = z.string().readonly(); // noise — same type as z.string()
```

## Examples

### ❌ Invalid

```ts
import * as z from 'zod';

z.string().readonly();
z.number().min(2).readonly();
z.date().readonly();
z.enum(['a', 'b']).readonly();
z.object({ foo: z.string().readonly() });
z.object({}).readonly().readonly(); // doubled
```

### ✅ Valid

```ts
import * as z from 'zod';

// readonly is meaningful on mutable outputs
z.object({ a: z.string() }).readonly();
z.array(z.string()).readonly();
z.map(z.string(), z.number()).readonly();
```

## Autofix Behavior

The fix removes the unnecessary `.readonly()` call, keeping the rest of the chain:

```ts
// Before
z.string().readonly().optional();
// After
z.string().optional();
```

The rule does **not** report when it cannot determine the wrapped schema's immutability — e.g. after a `.transform()`/`.pipe()` (the output type changes) or when the schema is referenced through a variable.

## When Not To Use It

You may want to disable this rule if you deliberately keep `.readonly()` on every schema for stylistic uniformity.

## Further Reading

- [Zod – Readonly](https://zod.dev/api?id=readonly)
