# zod-mini/no-unnecessary-readonly

📝 Disallow `z.readonly()` on schemas whose output is already immutable.

💼 This rule is enabled in the 🔒 `strict` config.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

`z.readonly()` on an already-immutable schema has no effect on the inferred type — `Readonly<string>` is just `string` — or on the parsed value, since freezing a primitive is a no-op.
It does add `readOnly: true` to the output of `z.toJSONSchema()`, so removing it is offered as a suggestion rather than an autofix.

This rule flags `z.readonly()` when the wrapped schema is already immutable:

- primitives / scalars (`z.string()`, `z.number()`, `z.boolean()`, `z.bigint()`, `z.date()`, `z.literal()`, `z.enum()`, number sub-types such as `z.int()`, top-level string formats such as `z.email()`, …)
- a schema that is already `readonly` (a doubled `z.readonly(z.readonly(...))`)

Immutability is looked up through passthrough wrappers, so `z.readonly(z.optional(z.string()))` is flagged too.

## Why?

Keeping `readonly` only where it matters makes the deliberate uses stand out:

```ts
import * as z from 'zod/mini';

const config = z.readonly(z.object({ name: z.string() })); // meaningful
const name = z.readonly(z.string()); // noise — same type as z.string()
```

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

z.readonly(z.string());
z.readonly(z.string().check(z.minLength(2)));
z.readonly(z.date());
z.readonly(z.enum(['a', 'b']));
z.object({ foo: z.readonly(z.string()) });
z.readonly(z.readonly(z.string())); // doubled
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

// readonly is meaningful on mutable outputs
z.readonly(z.object({ a: z.string() }));
z.readonly(z.array(z.string()));
z.readonly(z.map(z.string(), z.number()));
```

## Suggestions

The suggestion unwraps the schema, keeping any chained methods on the wrapper:

```ts
// Before
z.readonly(z.string()).check(z.minLength(2));
// After
z.string().check(z.minLength(2));
```

The rule does **not** report when it cannot determine the wrapped schema's immutability — e.g. a `z.pipe()`/`z.transform()` or `.apply()` (the output type may change) or a schema referenced through a variable (`z.readonly(someSchema)`).
An inner `z.readonly()` does not count past `z._default()` or `z.catch()`, which return their value without running it,
or past a `.check()` that may rewrite it.

No suggestion is offered before `.apply()`, whose callback could depend on the wrapper.
The same applies through a local variable, a parent schema, or a value this file stores or returns.
A schema exported to another file cannot be checked.
No suggestion is offered when it would bring back metadata the removed call dropped.

## When Not To Use It

You may want to disable this rule if you deliberately keep `z.readonly()` on every schema for stylistic uniformity,
or if you rely on `readOnly` in generated JSON Schema.

## Further Reading

- [Zod – Readonly](https://zod.dev/api?id=readonly)
