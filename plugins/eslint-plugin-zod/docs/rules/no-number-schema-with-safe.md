# zod/no-number-schema-with-safe

📝 Disallow deprecated `z.number().safe()`. Use `z.int()`; `.safe()` is now identical to `.int()`.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule disallows `z.number().safe(...)` in favor of `z.int(...)` (with the same parameters where applicable), matching Zod’s migration guidance.

## Examples

### Invalid

```ts
import { z } from 'zod';

z.number().safe();
z.number().safe('message');
z.number().safe().min(0);
```

### Valid

```ts
import { z } from 'zod';

z.int();
z.int().min(0);
```

## Autofix Behavior

The fix replaces the factory and the deprecated method in one go, keeping the methods in between:

```ts
// Before
z.number().safe().min(1);
// After
z.int().min(1);
```

The rule reports but does **not** fix two cases, because the replacement cannot be written safely:

- A named import (`import { number } from 'zod'; number().safe()`) — the fix would need a new import for the top-level factory
- A chain reached through a computed member (`z['number']().safe()`), which the chain walker cannot name

## When Not To Use It

If you are stuck on a Zod version where the deprecation does not apply, you can turn this rule off.

## Further Reading

- [Zod v4 – Integers](https://zod.dev/api?id=integers)
