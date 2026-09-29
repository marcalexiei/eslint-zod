# zod/no-number-schema-with-is-finite

📝 Disallow using deprecated `isFinite` on a Zod number schema; in v4+ it is always `true`.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule Details

This rule flags property access to `isFinite` on `z.number()…` chain expressions, such as `z.number().isFinite` or `z.number().min(0).isFinite`.

## Examples

### Invalid

```ts
import { z } from 'zod';

z.number().isFinite;
z.number().min(0).isFinite;
```

### Valid

```ts
import { z } from 'zod';

z.number();
```

## When Not To Use It

If you need to support older Zod behavior or the rule’s pattern matching is too strict for your code, you can disable it locally.

## Further Reading

- [Zod v4 – Numbers](https://zod.dev/api?id=numbers)
