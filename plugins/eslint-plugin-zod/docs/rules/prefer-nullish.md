# zod/prefer-nullish

📝 Enforce `.nullish()` instead of combining `.optional()` and `.nullable()`.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

Chaining `.optional()` and `.nullable()` (in either order) accepts `undefined` and `null` — exactly what the dedicated `.nullish()` method expresses. This rule flags the two-method combination and autofixes it to `.nullish()`.

The rule only fires when the two methods are **directly adjacent** in the chain. An intervening method (e.g. `.optional().describe('x').nullable()`) is left alone, since collapsing it into `.nullish()` would reorder the chain.

## Why?

`.nullish()` states the intent in one call and is the idiomatic Zod spelling for "optional and nullable":

```ts
import * as z from 'zod';

const a = z.string().optional().nullable(); // string | null | undefined
const b = z.string().nullish(); // string | null | undefined — clearer
```

## Examples

### ❌ Invalid

```ts
import * as z from 'zod';

z.string().optional().nullable();
z.string().nullable().optional();
z.string().min(2).optional().nullable();
z.object({ foo: z.string().optional().nullable() });
```

### ✅ Valid

```ts
import * as z from 'zod';

z.string().nullish();
z.string().optional();
z.string().nullable();
// not adjacent — left untouched
z.string().optional().describe('x').nullable();
```

## Autofix Behavior

The fix removes the earlier of the two methods and renames the later one to `nullish`, keeping the rest of the chain:

```ts
// Before
z.string().optional().nullable().describe('x');
// After
z.string().nullish().describe('x');
```

## Further Reading

- [Zod – Nullish](https://zod.dev/api?id=nullish)
- [Zod – Optional](https://zod.dev/api?id=optional)
- [Zod – Nullable](https://zod.dev/api?id=nullable)
