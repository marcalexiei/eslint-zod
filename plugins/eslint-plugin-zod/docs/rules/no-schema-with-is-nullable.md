# zod/no-schema-with-is-nullable

📝 Disallow deprecated `.isNullable()` on a Zod schema; use `safeParse(null).success` instead.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule Details

This rule flags `.isNullable()` calls on expressions the plugin recognizes as Zod schema chains, such as `z.string().isNullable()` or `z.string().nullable().isNullable()`.
A schema bound to a `const` counts too, so `schema.isNullable()` is reported when `const schema = z.string().nullable()`.
A `let`, a parameter or an imported schema is not followed.

## Examples

### Invalid

```ts
import { z } from 'zod';

z.string().isNullable();
z.string().nullable().isNullable();

const schema = z.string().nullable();
schema.isNullable();
```

### Valid

```ts
import { z } from 'zod';

const schema = z.string().nullable();

schema.safeParse(null).success;
```

## When Not To Use It

If you intentionally rely on `.isNullable()`, you may need to disable the rule for that line or file.

## Further Reading

- [Zod issue: deprecate `.isNullable()`](https://github.com/colinhacks/zod/issues/4812)
