# zod/no-number-schema-with-step

📝 Disallow deprecated `z.number().step()`. Use `.multipleOf()` instead.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

The fixer renames the method from `step` to `multipleOf` and leaves arguments unchanged.

## Examples

### Invalid

```ts
import { z } from 'zod';

z.number().step(0.1);
z.number().min(0).step(2, 'error');
z.number().step(0.1).min(0);
```

### Valid

```ts
import { z } from 'zod';

z.number().multipleOf(0.1);
z.number().min(0).multipleOf(2, 'error');
z.number().multipleOf(0.1).min(0);
```

## When Not To Use It

Disable this rule if you cannot migrate away from deprecated APIs yet.

## Further Reading

- [Zod v4 – Numbers](https://zod.dev/api?id=numbers)
