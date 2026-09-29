# zod/no-any-schema

📝 Disallow usage of `z.any()` in Zod schemas.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

This rule prevents the usage of `z.any()` in Zod schemas.
Using `z.any()` eliminates the benefits of runtime type checking that Zod provides, as it accepts any value without validation.

## Why?

Using `z.any()` is similar to using TypeScript's `any` type - it effectively turns off type checking for that part of your schema.

This can lead to:

- Runtime type safety issues
- Harder to maintain code
- Loss of Zod's validation capabilities
- Potential security vulnerabilities when parsing external data

Instead, you should:

1. Use a more specific schema that matches your data structure
2. Use `z.unknown()` if you truly need to accept any value (this is safer as it requires explicit type checking)

## Examples

### ❌ Invalid

```ts
const schema = z.any();

const objectSchema = z.object({
  prop: z.any(), // avoid using z.any() in object properties
});
```

### ✅ Valid

```ts
const schema = z.string();
const numberSchema = z.number();
const objectSchema = z.object({
  name: z.string(),
});

// If you need to accept any value, use z.unknown() instead
const unknownSchema = z.unknown();
```

## Suggestions

This rule provides a suggestion to automatically fix `z.any()` usage:

- Replace `z.any()` with `z.unknown()`

This suggestion can be applied through your editor's quick-fix feature.

## When Not To Use It

If you're in the process of migrating JavaScript code to use Zod and need a temporary escape hatch, you might want to disable this rule.
However, it's recommended to eventually replace all `z.any()` instances with more specific schemas or `z.unknown()`.

## Further Reading

- [Zod - Unknown schemas](https://zod.dev/api?id=unknown)
- [TypeScript - any vs unknown](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown)
