# zod/prefer-strict-object

📝 Prefer `z.strictObject()` over `z.object().strict()`.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule recommends using Zod's `strictObject()` shorthand instead of chaining `.strict()` after `.object()`.

Using the shorthand method makes the schema semantics explicit at creation time and keeps the object declaration easier to read.

Zod 4 documents `.strict()` as a legacy API. It remains available for backwards compatibility and will not be removed, but `z.strictObject()` is the recommended form for new code.

## Examples

### ❌ Invalid

### Examples of **incorrect** code with this rule

```ts
import * as z from 'zod';

z.object({ name: z.string() }).strict();

// Even when chained with other methods
z.object({ id: z.string() }).describe('User ID').strict();
```

### ✅ Valid

```ts
import * as z from 'zod';

z.strictObject({ name: z.string() });

// Plain object schemas remain valid
z.object({ id: z.string() });

// looseObject belongs to a different rule
z.looseObject({ age: z.number() });
```

## Conflict with `zod/consistent-object-schema-type`

If you are using the `zod/consistent-object-schema-type` rule alongside this one, be aware that there can be a conflict if `consistent-object-schema-type` is configured to only allow `object` (which is its default behavior).

To resolve this conflict, configure `consistent-object-schema-type` to also allow `strictObject`:

```json
{
  "rules": {
    "zod/consistent-object-schema-type": ["error", { "allow": ["object", "strictObject"] }]
  }
}
```

## When Not To Use It

If you prefer chaining `.strict()` to keep object schemas visually consistent with other chained validations, you can disable this rule.

## Further Reading

- [Zod - `strictObject`](https://zod.dev/api#zstrictobject)
- [Zod 4 migration guide - deprecates `.strict()`](https://zod.dev/v4/changelog?id=deprecates-strict-and-passthrough#deprecates-strict-and-passthrough)
