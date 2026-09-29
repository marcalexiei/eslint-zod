# zod/no-throw-in-refine

📝 Disallow throwing errors directly inside Zod refine callbacks.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule details

This ESLint rule detects and prevents **throw statements directly inside Zod `.refine()` callbacks**.
It ignores throws in nested functions but ensures the call is a **Zod expression**.

From the [Refinements](https://zod.dev/api?id=refinements) documentation

> Refinement functions should never throw. Instead they should return a falsy value to signal failure.
> Thrown errors are not caught by Zod.

## Examples

### ❌ Invalid

```ts
z.number().refine((val) => {
  if (val < 0) throw new Error('Invalid');
});

z.string().refine(() => {
  throw new Error('No');
});
```

### ✅ Valid

```ts
z.number()
  .min(0)
  .refine((val) => true);

z.string().refine((val) => {
  const fn = () => {
    throw new Error('nested');
  }; // Nested function is OK
  return val.length > 0;
});
```

## Further readings

- [Zod - Refinements](https://zod.dev/api?id=refinements)
