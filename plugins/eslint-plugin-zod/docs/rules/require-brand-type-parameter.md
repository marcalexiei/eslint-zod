# zod/require-brand-type-parameter

📝 Require type parameter on `.brand()` functions.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces the use of type parameters when calling the `.brand()` method in Zod schemas.\
Brand is a TypeScript-only feature that adds nominal typing to your schemas, requiring a type parameter to be meaningful.

## Why?

The `.brand()` method in Zod is used for nominal typing, which is a TypeScript-only feature.\
Without a type parameter, the brand has no effect and is essentially dead code.

Using `.brand()` without a type parameter doesn't serve any purpose and should either include a type parameter or be removed.

## Examples

### ❌ Invalid

```ts
z.string().brand();
z.string().min(1).max(10).email().brand();
```

### ✅ Valid

```ts
z.string().brand<'myBrand'>();
z.string().min(1).brand<'aaa'>();
z.string().brand<`${string}Id`>();
z.string().min(1).max(10).email().brand<'email'>();
```

## When Not To Use It

If you're not using Zod's branding feature for nominal typing, you can disable this rule.

## Further Reading

- [Zod - Branding Types](https://zod.dev/api?id=branded-types)
