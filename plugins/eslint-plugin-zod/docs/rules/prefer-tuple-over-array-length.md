# zod/prefer-tuple-over-array-length

📝 Prefer `z.tuple()` over a length-constrained `z.array()` so the length is preserved in the inferred type.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

A length-constrained `z.array()` validates the length at runtime, but the constraint is lost at the type level — `z.array(z.string()).length(2)` still infers as `string[]`.\
`z.tuple()` encodes the length in the type, so the inferred type is `[string, string]`.

This rule flags `z.array()` schemas that carry a length constraint:

- `.length(n)`
- `.min(n)`
- `.max(n)`

## Why?

```ts
import * as z from 'zod';

const pair = z.array(z.string()).length(2);
//    ^? z.infer<typeof pair> → string[]        // length lost

const pair = z.tuple([z.string(), z.string()]);
//    ^? z.infer<typeof pair> → [string, string] // precise
```

A tuple:

1. Preserves the element count in the inferred type
2. Lets TypeScript catch out-of-bounds access at compile time
3. Communicates a fixed-shape value more clearly than a runtime length check

## Examples

### ❌ Invalid

```ts
import * as z from 'zod';

z.array(z.string()).length(2);
z.array(z.string()).min(2);
z.array(z.string()).max(5);
```

### ✅ Valid

```ts
import * as z from 'zod';

z.tuple([z.string(), z.string()]);

// A variable-length array without a length constraint is fine
z.array(z.string());

// `nonempty()` already produces a typed `[string, ...string[]]`
z.array(z.string()).nonempty();
```

## Autofix Behavior

- `.length(n)` maps to a fixed-length tuple.
- `.min(n)` maps to a [rest tuple](https://zod.dev/api?id=tuples) — `n` fixed elements plus a rest element, i.e. "at least `n`".
- `.min(n).max(n)` with **equal** literal bounds is exactly `.length(n)`, so it also maps to a fixed-length tuple.

```ts
// Before
z.array(z.string()).length(2);
// After
z.tuple([z.string(), z.string()]);

// Before
z.array(z.string()).min(2);
// After
z.tuple([z.string(), z.string()], z.string());

// Before
z.array(z.string()).min(2).max(2);
// After
z.tuple([z.string(), z.string()]);
```

### Limitations

`.max()` on its own is reported but **not** autofixed — an upper bound has no single behavior-preserving tuple equivalent.

Autofix is also **not applied** when:

- The count is not a non-negative integer literal (e.g. `z.array(x).length(n)`)
- The array carries more than one length constraint that does not reduce to a single length (e.g. `z.array(x).min(2).max(5)`), since the leftover check has no tuple equivalent
- The array is referenced via named imports (e.g. `import { array } from 'zod'`), since the fix would need to add a `tuple` import
- The `z.array()` call does not have exactly one element-schema argument

In these cases the rule still reports but leaves the code unchanged.

## When Not To Use It

You may want to disable this rule if:

- You intentionally validate array length at runtime without wanting a fixed-shape type
- You prefer `z.array().min()`/`.max()` for variable-length bounded collections

## Further Reading

- [Zod – Tuples](https://zod.dev/api?id=tuples)
- [Zod – Arrays](https://zod.dev/api?id=arrays)
- [`prefer-string-length-over-min-max`](./prefer-string-length-over-min-max.md) — the same equal-bounds case on strings
- [`prefer-map-set-size-over-min-max`](./prefer-map-set-size-over-min-max.md) — the same equal-bounds case on sets and maps
