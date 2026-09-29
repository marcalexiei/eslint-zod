# zod-mini/prefer-string-length-over-min-max

📝 Prefer `z.length(n)` over `z.minLength(n)` and `z.maxLength(n)` with the same value on a string schema.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

A lower and an upper length bound with the same value describe an exact length, spelled the long way. `z.length(n)` says it once:

```ts
z.string().check(z.minLength(3), z.maxLength(3)); // exactly 3 characters, in two checks
z.string().check(z.length(3)); // exactly 3 characters
```

The rule fires only when both bounds carry the **same non-negative integer literal**. It applies to `z.string()` and to the top-level string formats (`z.email()`, `z.uuid()`, …), which are string schemas and accept the same checks. The two bounds do not have to share a `.check(...)` call.

Length bounds on other base types are covered elsewhere:

- **Arrays** belong to [`prefer-tuple-over-array-length`](./prefer-tuple-over-array-length.md), which rewrites `z.array(x).check(z.minLength(2), z.maxLength(2))` to `z.tuple([x, x])` — that fixes the length at the type level, not just the spelling.
- **Sets and maps** use `z.minSize()` / `z.maxSize()` / `z.size()`, and belong to [`prefer-map-set-size-over-min-max`](./prefer-map-set-size-over-min-max.md).

## Why?

Two checks for one requirement invite drift: an edit that changes `z.minLength` without changing `z.maxLength` turns an exact length into a range, silently. It also reads as a range at a glance, so the reader has to compare the two numbers to see that it is not one.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

z.string().check(z.minLength(3), z.maxLength(3));
z.string().check(z.maxLength(3), z.minLength(3));
z.string().check(z.minLength(3)).check(z.maxLength(3));
z.email().check(z.minLength(3), z.maxLength(3));
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

z.string().check(z.length(3));

// A real range
z.string().check(z.minLength(3), z.maxLength(5));

// A single bound
z.string().check(z.minLength(3));
z.string().check(z.maxLength(3));

// Not a length: `z.gte()`/`z.lte()` bound the value of a number
z.number().check(z.gte(3), z.lte(3));

// An array with equal bounds is `prefer-tuple-over-array-length`'s subject
z.array(z.string()).check(z.minLength(2), z.maxLength(2));

// A set with equal bounds is `prefer-map-set-size-over-min-max`'s subject
z.set(z.string()).check(z.minSize(2), z.maxSize(2));
```

## Autofix Behavior

The first bound is renamed to `z.length()` and the second is removed. Other arguments of the same `.check(...)` call are left in place, and a `.check(...)` left with no arguments is removed entirely:

```ts
// Before
z.string().check(z.minLength(3), z.regex(/^a/), z.maxLength(3));
// After
z.string().check(z.length(3), z.regex(/^a/));

// Before
z.string().check(z.minLength(3)).check(z.maxLength(3));
// After
z.string().check(z.length(3));
```

## Limitations

The rule stays silent — it does not report — when the pair is not provably the same as `z.length(n)`:

- A bound whose count is not a non-negative integer literal (`z.minLength(n)`)
- A bound carrying a custom error message (`z.minLength(3, 'too short')`), which `z.length()` has nowhere to keep
- A **mutating** check between the two bounds (`z.string().check(z.minLength(3), z.trim(), z.maxLength(3))`): the upper bound sees the trimmed value, so the pair is not an exact length
- More bounds than a single pair, or an exact length already present — that is [`no-conflicting-checks`](./no-conflicting-checks.md)' subject

It reports **without** an autofix when the checks come from named imports and `length` is not among them (`import { minLength, maxLength } from 'zod/mini'`), since the fix cannot add the missing import.

A chain reached through a computed member (`z['string']().check(…)`) is not analyzed.

## When Not To Use It

Disable it if you deliberately spell exact lengths as a pair of bounds — for instance to attach a different error message to each side.

## Further Reading

- [Zod Mini – Strings](https://zod.dev/api?id=strings)
- [`prefer-map-set-size-over-min-max`](./prefer-map-set-size-over-min-max.md) — the same equal-bounds case on sets and maps
- [`prefer-tuple-over-array-length`](./prefer-tuple-over-array-length.md) — the same equal-bounds case on arrays
