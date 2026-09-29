# zod/prefer-string-length-over-min-max

📝 Prefer `.length(n)` over `.min(n).max(n)` with the same value on a string schema.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

A lower and an upper length bound with the same value describe an exact length, spelled the long way. `.length(n)` says it once:

```ts
z.string().min(3).max(3); // exactly 3 characters, in two checks
z.string().length(3); // exactly 3 characters
```

The rule fires only when both bounds carry the **same non-negative integer literal**. It applies to `z.string()` and to the top-level string formats (`z.email()`, `z.uuid()`, …), which are string schemas and accept the same bounds.

Length bounds on other base types are covered elsewhere:

- **Arrays** belong to [`prefer-tuple-over-array-length`](./prefer-tuple-over-array-length.md), which rewrites `z.array(x).min(2).max(2)` to `z.tuple([x, x])` — that fixes the length at the type level, not just the spelling.
- **Sets and maps** use `size` rather than `length`, and belong to [`prefer-map-set-size-over-min-max`](./prefer-map-set-size-over-min-max.md).

## Why?

Two checks for one requirement invite drift: an edit that changes `min` without changing `max` turns an exact length into a range, silently. It also reads as a range at a glance, so the reader has to compare the two numbers to see that it is not one.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod';

z.string().min(3).max(3);
z.string().max(3).min(3);
z.string().trim().min(3).max(3).optional();
z.email().min(3).max(3);
```

### ✅ Valid

```ts
import * as z from 'zod';

z.string().length(3);

// A real range
z.string().min(3).max(5);

// A single bound
z.string().min(3);
z.string().max(3);

// Not a length: `.min()`/`.max()` bound the value of a number
z.number().min(3).max(3);

// An array with equal bounds is `prefer-tuple-over-array-length`'s subject
z.array(z.string()).min(2).max(2);

// A set with equal bounds is `prefer-map-set-size-over-min-max`'s subject
z.set(z.string()).min(2).max(2);
```

## Autofix Behavior

The first bound is renamed to `length` and the second is removed, so surrounding checks keep their place:

```ts
// Before
z.string().trim().min(3).max(3).optional();
// After
z.string().trim().length(3).optional();
```

## Limitations

The rule stays silent — it does not report — when the pair is not provably the same as `.length(n)`:

- A bound whose count is not a non-negative integer literal (`z.string().min(n).max(n)`)
- A bound carrying a custom error message (`z.string().min(3, 'too short').max(3, 'too long')`), which `.length()` has nowhere to keep
- A **mutating** check between the two bounds (`z.string().min(3).trim().max(3)`): the upper bound sees the trimmed value, so the pair is not an exact length
- `.nonempty()` paired with `.max(1)` — equivalent, but collapsing it would drop a spelling the author chose deliberately
- More bounds than a single pair, or an exact length already present (`z.string().length(3).min(3)`) — that is [`no-conflicting-checks`](./no-conflicting-checks.md)' subject

A chain reached through a computed member (`z['string']().min(3).max(3)`) is not analyzed.

## When Not To Use It

Disable it if you deliberately spell exact lengths as a pair of bounds — for instance to attach a different error message to each side.

## Further Reading

- [Zod – Strings](https://zod.dev/api?id=strings)
- [`prefer-map-set-size-over-min-max`](./prefer-map-set-size-over-min-max.md) — the same equal-bounds case on sets and maps
- [`prefer-tuple-over-array-length`](./prefer-tuple-over-array-length.md) — the same equal-bounds case on arrays
