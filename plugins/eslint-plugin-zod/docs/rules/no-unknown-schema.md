# zod/no-unknown-schema

📝 Disallow usage of `z.unknown()` in Zod schemas.

💼 This rule is enabled in the 🔒 `strict` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule prevents the usage of `z.unknown()` in Zod schemas.
Using `z.unknown()` bypasses Zod's type validation, as it accepts any value without runtime type checking.

## Why?

Using `z.unknown()` means you're accepting any value but then requiring explicit type narrowing later in your code.

This can lead to:

- Runtime type safety issues
- Harder to maintain code
- Loss of Zod's validation capabilities
- Potential security vulnerabilities when parsing external data

Instead, you should:

1. Use a more specific schema that matches your data structure
2. Use type guards or discriminated unions if you need to handle multiple types

## Examples

### ❌ Invalid

```ts
const schema = z.unknown();

const objectSchema = z.object({
  prop: z.unknown(), // avoid using z.unknown() in object properties
});
```

### ✅ Valid

```ts
const schema = z.string();
const numberSchema = z.number();
const objectSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// For multiple types, use union schemas
const unionSchema = z.union([z.string(), z.number()]);
```

## When Not To Use It

If you're working with highly dynamic data structures where the shape is truly unpredictable at compile time,
you might consider disabling this rule temporarily.

However, it's generally better to use a union of known schemas or `z.record()` for key-value pairs instead of `z.unknown()`.

## Further Reading

- [Zod - Defining schemas](https://zod.dev/api)
