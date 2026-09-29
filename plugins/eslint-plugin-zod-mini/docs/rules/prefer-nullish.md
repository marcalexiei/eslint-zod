# zod-mini/prefer-nullish

📝 Enforce `z.nullish()` instead of combining `z.optional()` and `z.nullable()`.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

Nesting `z.optional()` and `z.nullable()` (in either order) accepts `undefined` and `null` — exactly what the dedicated `z.nullish()` wrapper expresses. This rule flags the two-wrapper combination and autofixes it to `z.nullish()`.

The rule only fires when the outer wrapper's single argument is directly the other **bare** wrapper — no extra arguments and no intervening chain. `z.optional(z.nullable(z.string()).check(z.refine(() => true)))` is left alone, since collapsing it would drop the inner check.

## Why?

`z.nullish()` states the intent in one call and is the idiomatic Zod spelling for "optional and nullable":

```ts
import * as z from 'zod/mini';

const a = z.optional(z.nullable(z.string())); // string | null | undefined
const b = z.nullish(z.string()); // string | null | undefined — clearer
```

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

z.optional(z.nullable(z.string()));
z.nullable(z.optional(z.string()));
z.object({ foo: z.optional(z.nullable(z.string())) });
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

z.nullish(z.string());
z.optional(z.string());
z.nullable(z.string());
// inner wrapper carries a check — left untouched
z.optional(z.nullable(z.string()).check(z.refine(() => true)));
```

## Autofix Behavior

The fix renames the outer wrapper to `nullish` and unwraps the inner one:

```ts
// Before
z.optional(z.nullable(z.string()));
// After
z.nullish(z.string());
```

With named imports, the fix requires `nullish` to be imported. When it is not, the rule reports without autofixing so the fix never references an undefined identifier.

## Further Reading

- [Zod – Nullish](https://zod.dev/api?id=nullish)
- [Zod – Optional](https://zod.dev/api?id=optional)
- [Zod – Nullable](https://zod.dev/api?id=nullable)
