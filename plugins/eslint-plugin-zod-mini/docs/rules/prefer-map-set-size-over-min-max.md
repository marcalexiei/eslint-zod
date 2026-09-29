# zod-mini/prefer-map-set-size-over-min-max

📝 Prefer `z.size(n)` over `z.minSize(n)` and `z.maxSize(n)` with the same value on a set or map schema.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

A lower and an upper size bound with the same value describe an exact size, spelled the long way. `z.size(n)` says it once:

```ts
z.set(z.string()).check(z.minSize(3), z.maxSize(3)); // exactly 3 entries, in two checks
z.set(z.string()).check(z.size(3)); // exactly 3 entries
```

The rule fires only when both bounds carry the **same non-negative integer literal**. It applies to `z.set()` and `z.map()`, the two schemas the `size` checks accept. The two bounds do not have to share a `.check(...)` call.

Bounds on other base types are covered elsewhere:

- **Strings** belong to [`prefer-string-length-over-min-max`](./prefer-string-length-over-min-max.md), which collapses `z.minLength()` / `z.maxLength()` to `z.length()`.
- **Arrays** belong to [`prefer-tuple-over-array-length`](./prefer-tuple-over-array-length.md), which rewrites `z.array(x).check(z.minLength(2), z.maxLength(2))` to `z.tuple([x, x])` — that fixes the length at the type level, not just the spelling.
- **Numbers, bigints and dates** use `z.gte()` / `z.lte()` to bound a value, not a size, so an equal pair there means a single allowed value rather than a redundant spelling.

## Why?

Two checks for one requirement invite drift: an edit that changes `z.minSize` without changing `z.maxSize` turns an exact size into a range, silently. It also reads as a range at a glance, so the reader has to compare the two numbers to see that it is not one.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

z.set(z.string()).check(z.minSize(3), z.maxSize(3));
z.set(z.string()).check(z.maxSize(3), z.minSize(3));
z.set(z.string()).check(z.minSize(3)).check(z.maxSize(3));
z.map(z.string(), z.number()).check(z.minSize(2), z.maxSize(2));
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

z.set(z.string()).check(z.size(3));

// A real range
z.set(z.string()).check(z.minSize(3), z.maxSize(5));

// A single bound
z.set(z.string()).check(z.minSize(3));
z.map(z.string(), z.number()).check(z.maxSize(3));

// Not a size: `z.gte()`/`z.lte()` bound the value of a number
z.number().check(z.gte(3), z.lte(3));

// Strings use the `length` checks
z.string().check(z.minLength(2), z.maxLength(2));

// An array with equal bounds is `prefer-tuple-over-array-length`'s subject
z.array(z.string()).check(z.minLength(2), z.maxLength(2));
```

## Autofix Behavior

The first bound is renamed to `z.size()` and the second is removed. Other arguments of the same `.check(...)` call are left in place, and a `.check(...)` left with no arguments is removed entirely:

```ts
// Before
z.set(z.string()).check(z.minSize(3), z.describe('ids'), z.maxSize(3));
// After
z.set(z.string()).check(z.size(3), z.describe('ids'));

// Before
z.set(z.string()).check(z.minSize(3)).check(z.maxSize(3));
// After
z.set(z.string()).check(z.size(3));
```

## Limitations

The rule stays silent — it does not report — when the pair is not provably the same as `z.size(n)`:

- A bound whose count is not a non-negative integer literal (`z.minSize(n)`)
- A bound carrying a custom error message (`z.minSize(3, 'too few')`), which `z.size()` has nowhere to keep
- A **mutating** check between the two bounds (`z.set(x).check(z.minSize(3), z.overwrite(fn), z.maxSize(3))`): the upper bound sees the overwritten value, so the pair is not an exact size
- More bounds than a single pair, or an exact size already present — that is [`no-conflicting-checks`](./no-conflicting-checks.md)' subject

It reports **without** an autofix when the checks come from named imports and `size` is not among them (`import { minSize, maxSize } from 'zod/mini'`), since the fix cannot add the missing import.

A bound reached through a computed member (`z.set(x).check(z['minSize'](3), z.maxSize(3))`) is reported without a fix.

## When Not To Use It

Disable it if you deliberately spell exact sizes as a pair of bounds — for instance to attach a different error message to each side.

## Further Reading

- [Zod Mini – Sets](https://zod.dev/api?id=sets)
- [Zod Mini – Maps](https://zod.dev/api?id=maps)
- [`prefer-string-length-over-min-max`](./prefer-string-length-over-min-max.md) — the same equal-bounds case on strings
- [`prefer-tuple-over-array-length`](./prefer-tuple-over-array-length.md) — the same equal-bounds case on arrays
