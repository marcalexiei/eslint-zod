# zod/no-number-schema-with-finite

📝 Disallow deprecated `z.number().finite()`. In Zod 4+ number schemas do not allow infinite values by default, so it is a no-op.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

Zod 4+ rejects non-finite number values in `z.number()` schemas, so `z.number().finite()` is redundant. This rule disallows the deprecated call and the fixer removes it.

## Examples

### Invalid

```ts
import { z } from 'zod';

z.number().finite();
z.number().min(0).finite();
z.number().finite().min(0);
```

### Valid

```ts
import { z } from 'zod';

z.number();
z.number().min(0);
```

## When Not To Use It

If you are on an older Zod version where `.finite()` is still meaningful, disable this rule.

## Further Reading

- [Zod v4 – Numbers](https://zod.dev/api?id=numbers)
