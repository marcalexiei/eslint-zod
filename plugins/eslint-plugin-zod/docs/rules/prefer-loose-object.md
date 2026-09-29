# zod/prefer-loose-object

📝 Prefer `z.looseObject()` over `z.object().passthrough()` and `z.object().loose()`.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule recommends using Zod's `looseObject()` shorthand instead of chaining `.passthrough()` or `.loose()` after `.object()`.

Using the shorthand method makes the schema semantics explicit at creation time and keeps the object declaration easier to read.

Zod 4 documents `.passthrough()` as a legacy API. The older `.loose()` method is also deprecated. They remain available for backwards compatibility and will not be removed, but `z.looseObject()` is the recommended form for new code.

## Examples

### ❌ Invalid

### Examples of **incorrect** code with this rule

```ts
import * as z from 'zod';

z.object({ age: z.number() }).passthrough();

z.object({ age: z.number() }).loose();

// Even when chained with other methods
z.object({ id: z.string() }).describe('User ID').passthrough();
```

### ✅ Valid

```ts
import * as z from 'zod';

z.looseObject({ age: z.number() });

// Plain object schemas remain valid
z.object({ id: z.string() });

// strictObject belongs to a different rule
z.strictObject({ name: z.string() });
```

## Conflict with `zod/consistent-object-schema-type`

If you are using the `zod/consistent-object-schema-type` rule alongside this one, be aware that there can be a conflict if `consistent-object-schema-type` is configured to only allow `object` (which is its default behavior).

To resolve this conflict, configure `consistent-object-schema-type` to also allow `looseObject`:

```json
{
  "rules": {
    "zod/consistent-object-schema-type": ["error", { "allow": ["object", "looseObject"] }]
  }
}
```

## When Not To Use It

If you prefer chaining `.passthrough()` or `.loose()` to keep object schemas visually consistent with other chained validations, you can disable this rule.

## Further Reading

- [Zod - objects](https://zod.dev/api#objects)
- [Zod - `looseObject`](https://zod.dev/api#zlooseobject)
- [Zod 4 migration guide - deprecates `.passthrough()`](https://zod.dev/v4/changelog?id=deprecates-strict-and-passthrough#deprecates-strict-and-passthrough)
