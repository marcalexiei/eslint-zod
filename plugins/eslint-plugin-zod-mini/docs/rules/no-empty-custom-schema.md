# zod-mini/no-empty-custom-schema

📝 Disallow usage of `z.custom()` without arguments.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces that `z.custom()` calls always include a validation function argument.
Empty `z.custom()` calls are not useful since they don't provide any validation logic.

## Why?

The `z.custom()` method in Zod Mini is used to create custom validation schemas with custom validation logic.
When called without arguments, it creates a schema that doesn't perform any validation,
which defeats its purpose and could lead to runtime issues.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

z.custom();
z.custom<`${number}px`>(); // Type parameter alone is not enough
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

z.custom((val) => {
  return typeof val === 'string' ? /^\d+px$/.test(val) : false;
});

z.custom<`${number}px`>((val) => {
  return typeof val === 'string' ? /^\d+px$/.test(val) : false;
});
```

## When Not To Use It

If you have a specific use case where you need to create an empty custom schema that will be configured later, you might want to disable this rule.

However, this is generally not recommended as it could lead to validation being accidentally skipped.

## Further Reading

- [Zod - Custom Schemas](https://zod.dev/api?id=custom)
