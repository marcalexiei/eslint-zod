# zod/no-schema-with-is-nullable

📝 Disallow deprecated `.isNullable()` on a Zod schema; use `safeParse(null).success` instead.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule Details

This rule flags direct `.isNullable()` calls on expressions the plugin recognizes as Zod schema chains, such as `z.string().isNullable()` or `z.string().nullable().isNullable()`.

## Examples

### Invalid

```ts
import { z } from 'zod';

z.string().isNullable();
z.string().nullable().isNullable();
```

### Valid

```ts
import { z } from 'zod';

const schema = z.string().nullable();

schema.safeParse(null).success;
```

## When Not To Use It

If you intentionally rely on `.isNullable()` or call it on schema variables this rule does not model, you may need to disable the rule for that line or file.

## Further Reading

- [Zod issue: deprecate `.isNullable()`](https://github.com/colinhacks/zod/issues/4812)
