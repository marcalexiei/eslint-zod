# zod/no-schema-with-is-optional

📝 Disallow deprecated `.isOptional()` on a Zod schema; use `safeParse(undefined).success` instead.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule Details

This rule flags direct `.isOptional()` calls on expressions the plugin recognizes as Zod schema chains, such as `z.string().isOptional()` or `z.string().optional().isOptional()`.

## Examples

### Invalid

```ts
import { z } from 'zod';

z.string().isOptional();
z.string().optional().isOptional();
```

### Valid

```ts
import { z } from 'zod';

const schema = z.string().optional();

schema.safeParse(undefined).success;
```

## When Not To Use It

If you intentionally rely on `.isOptional()` or call it on schema variables this rule does not model, you may need to disable the rule for that line or file.

## Further Reading

- [Zod issue: deprecate `.isOptional()`](https://github.com/colinhacks/zod/issues/4812)
