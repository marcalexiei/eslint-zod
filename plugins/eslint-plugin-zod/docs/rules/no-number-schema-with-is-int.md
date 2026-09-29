# zod/no-number-schema-with-is-int

📝 Disallow using deprecated `isInt` on a Zod number schema; check the `format` property instead.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule Details

This rule flags property access to `isInt` on expressions the plugin recognizes as a `z.number()…` chain (for example `z.number().isInt` or `z.number().min(0).isInt`).

## Examples

### Invalid

```ts
import { z } from 'zod';

z.number().isInt;
z.number().min(0).isInt;
```

### Valid

```ts
import { z } from 'zod';

z.number();
```

## When Not To Use It

If you read `isInt` in contexts this rule does not model (e.g. after assigning the schema to a variable), you may need to disable the rule for that line or file.

## Further Reading

- [Zod v4 – Numbers](https://zod.dev/api?id=numbers)
