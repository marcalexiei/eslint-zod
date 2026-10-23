# zod-mini/no-dynamic-schema-value

📝 Disallow non-static values passed as arguments in a Zod Mini schema expression.

💼 This rule is enabled in the 🔒 `strict` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule flags an argument, anywhere in a zod/mini schema expression, whose value is not a literal or an
imported binding — a function call result, a `new` expression, `this`, a mutable local variable, or a
function parameter.

The check applies to every argument of every call in a schema's chain (the factory, each chained method,
and each `.check(...)` argument), not just the outermost call.

A hoisted `function` declaration reads as a function literal — the same as the `const` arrow it could be
rewritten as.

Only schema expressions are checked. The helpers that do something else with a schema —
`z.toJSONSchema()`, `z.parse()`, `z.prettifyError()`, `z.config()` — take runtime values by design.
So do the methods that end a schema chain, such as `.parse(input)`: their arguments are not checked.

## Why?

This is the criterion [`zod-compiler`](https://www.npmjs.com/package/zod-compiler) uses to decide what it
can hoist into its build-time output. A value it cannot resolve statically — because computing it requires
running arbitrary code at build time — breaks that analysis.

## Examples

### ❌ Invalid

```ts
const schema = z.string(getErrorMessage());

const schema = z.string().check(z.refine(isValid, getErrorMessage()));

const schema = z.string().check(z.refine(isValid, new Date()));
```

### ✅ Valid

```ts
const schema = z.string().check(z.minLength(1));

import { isValid, errorMessage } from './helpers.js';
const schema = z.string().check(z.refine(isValid, errorMessage));

// A `const` whose own initializer is itself static is fine.
const message = errorMessage;
const schema2 = z.string().check(z.refine((value) => value.length > 0, message));

// An inline callback is a function literal, not a computed value — this holds even
// when it captures a mutable outer variable, since `zod-compiler` compiles a
// refine/transform/superRefine callback by reference rather than needing to hoist it.
let threshold = 5;
const schema3 = z.string().check(z.refine((value) => value.length > threshold));

// A schema built in this file can be wrapped, or spread through its `shape`.
const base = z.object({ name: z.string() });
const schema4 = z.union([base, base.brand<'Base'>()]);
const schema5 = z.object({ ...base.shape, age: z.number() });
```

## Limitations

The rule resolves an identifier as static only through an import binding, a `function` declaration, or a
`const` initialized (directly or transitively) to another static value.
A member access (`config.message`, `schema.shape`) is static when the object it reads from is.
A parse result is a runtime value, so `env.HOST` is reported when `env` holds `schema.parse(process.env)`.
A method call is static only on a schema built in the same file (`base.brand()`, `base.check(…)`).
An import is not provably a schema, so `importedSchema.brand()` is reported.
A `const` that refers to itself is reported rather than resolved.

A function literal is always static, regardless of what it captures — the rule does not look inside its
body. This matches `zod-compiler`, which compiles a `refine`/`transform`/`superRefine`/`preprocess`
callback whether or not it closes over an outer variable: a zero-capture callback is inlined, a capturing
one is called by reference.

## When Not To Use It

If you don't use `zod-compiler` (or another tool relying on the same static-analysis criterion), this rule
has no benefit and may be noisy for schemas that legitimately compute their error messages or defaults at
runtime.

## Further Reading

- [`zod-compiler`](https://www.npmjs.com/package/zod-compiler)
