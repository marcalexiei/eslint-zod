# zod/prefer-map-set-size-over-min-max

📝 Prefer `.size(n)` over `.min(n).max(n)` with the same value on a set or map schema.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

A lower and an upper size bound with the same value describe an exact size, spelled the long way. `.size(n)` says it once:

```ts
z.set(z.string()).min(3).max(3); // exactly 3 entries, in two checks
z.set(z.string()).size(3); // exactly 3 entries
```

The rule fires only when both bounds carry the **same non-negative integer literal**. It applies to `z.set()` and `z.map()`, the two schemas whose `.min()` / `.max()` bound a size.

Bounds on other base types are covered elsewhere:

- **Strings** belong to [`prefer-string-length-over-min-max`](./prefer-string-length-over-min-max.md), which collapses the same pair to `.length(n)`.
- **Arrays** belong to [`prefer-tuple-over-array-length`](./prefer-tuple-over-array-length.md), which rewrites `z.array(x).min(2).max(2)` to `z.tuple([x, x])` — that fixes the length at the type level, not just the spelling.
- **Numbers, bigints and dates** use `.min()` / `.max()` to bound a value, not a size, so an equal pair there means a single allowed value rather than a redundant spelling.

## Why?

Two checks for one requirement invite drift: an edit that changes `min` without changing `max` turns an exact size into a range, silently. It also reads as a range at a glance, so the reader has to compare the two numbers to see that it is not one.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod';

z.set(z.string()).min(3).max(3);
z.set(z.string()).max(3).min(3);
z.map(z.string(), z.number()).min(2).max(2);
z.set(z.string()).min(3).max(3).optional();
```

### ✅ Valid

```ts
import * as z from 'zod';

z.set(z.string()).size(3);

// A real range
z.set(z.string()).min(3).max(5);

// A single bound
z.set(z.string()).min(3);
z.map(z.string(), z.number()).max(3);

// Not a size: `.min()`/`.max()` bound the value of a number
z.number().min(3).max(3);

// A string with equal bounds is `prefer-string-length-over-min-max`'s subject
z.string().min(2).max(2);

// An array with equal bounds is `prefer-tuple-over-array-length`'s subject
z.array(z.string()).min(2).max(2);
```

## Autofix Behavior

The first bound is renamed to `size` and the second is removed, so surrounding checks keep their place:

```ts
// Before
z.set(z.string()).min(3).describe('ids').max(3);
// After
z.set(z.string()).size(3).describe('ids');
```

## Limitations

The rule stays silent — it does not report — when the pair is not provably the same as `.size(n)`:

- A bound whose count is not a non-negative integer literal (`z.set(x).min(n).max(n)`)
- A bound carrying a custom error message (`z.set(x).min(3, 'too few').max(3, 'too many')`), which `.size()` has nowhere to keep
- A **mutating** check between the two bounds (`z.set(x).min(3).overwrite(fn).max(3)`): the upper bound sees the overwritten value, so the pair is not an exact size
- `.nonempty()` paired with `.max(1)` — equivalent, but collapsing it would drop a spelling the author chose deliberately
- More bounds than a single pair, or an exact size already present (`z.set(x).size(3).min(3)`) — that is [`no-conflicting-checks`](./no-conflicting-checks.md)' subject

A chain reached through a computed member (`z['set'](z.string()).min(3).max(3)`) is not analyzed.

## When Not To Use It

Disable it if you deliberately spell exact sizes as a pair of bounds — for instance to attach a different error message to each side.

## Further Reading

- [Zod – Sets](https://zod.dev/api?id=sets)
- [Zod – Maps](https://zod.dev/api?id=maps)
- [`prefer-string-length-over-min-max`](./prefer-string-length-over-min-max.md) — the same equal-bounds case on strings
- [`prefer-tuple-over-array-length`](./prefer-tuple-over-array-length.md) — the same equal-bounds case on arrays
