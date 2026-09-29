# zod-mini/no-throw-in-refine

📝 Disallow throwing errors directly inside Zod Mini refine callbacks.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule details

This ESLint rule detects and prevents `throw` statements directly inside Zod Mini `z.refine()` callbacks.
It ignores throws in nested functions but ensures the call is a **Zod Mini expression**.

From the [Refinements](https://zod.dev/api?id=refinements) documentation:

> Refinement functions should never throw. Instead they should return a falsy value to signal failure.
> Thrown errors are not caught by Zod.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

z.number().check(
  z.refine((val) => {
    if (val < 0) {
      throw new Error('Invalid');
    }

    return true;
  }),
);

z.string().check(
  z.refine(() => {
    throw new Error('No');
  }),
);
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

z.number().check(z.refine((val) => val >= 0));

z.string().check(
  z.refine((val) => {
    const fn = () => {
      throw new Error('nested');
    };

    return val.length > 0;
  }),
);
```

## Further readings

- [Zod - Refinements](https://zod.dev/api?id=refinements)
