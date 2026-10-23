# zod/no-schema-with-is-optional

📝 Disallow deprecated `.isOptional()` on a Zod schema; use `safeParse(undefined).success` instead.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule Details

This rule flags `.isOptional()` calls on expressions the plugin recognizes as Zod schema chains, such as `z.string().isOptional()` or `z.string().optional().isOptional()`.
A schema bound to a `const` counts too, so `schema.isOptional()` is reported when `const schema = z.string().optional()`.
A `let`, a parameter or an imported schema is not followed.

## Examples

### Invalid

```ts
import { z } from 'zod';

z.string().isOptional();
z.string().optional().isOptional();

const schema = z.string().optional();
schema.isOptional();
```

### Valid

```ts
import { z } from 'zod';

const schema = z.string().optional();

schema.safeParse(undefined).success;
```

## When Not To Use It

If you intentionally rely on `.isOptional()`, you may need to disable the rule for that line or file.

## Further Reading

- [Zod issue: deprecate `.isOptional()`](https://github.com/colinhacks/zod/issues/4812)
