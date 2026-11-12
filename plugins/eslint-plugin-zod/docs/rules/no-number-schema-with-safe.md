# zod/no-number-schema-with-safe

📝 Disallow deprecated `z.number().safe()`. Use `z.int()`; `.safe()` is now identical to `.int()`.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule disallows `z.number().safe(...)` in favor of `z.int(...)` (with the same parameters where applicable), matching Zod’s migration guidance.

`.safe()` adds Zod's safe-integer check, so it is reported on every number factory:

- on `z.float32()` and `z.float64()`, which accept fractions, the schema is `z.int()` and the fix rewrites it the same way
- on `z.int()`, `z.int32()` and `z.uint32()`, which accept only safe integers already, the call adds nothing and the fix removes it

## Examples

### Invalid

```ts
import { z } from 'zod';

z.number().safe();
z.number().safe('message');
z.number().safe().min(0);
z.float64().safe();
z.int32().safe();
```

### Valid

```ts
import { z } from 'zod';

z.int();
z.int().min(0);
z.int32();
```

## Autofix Behavior

On a factory that accepts fractions, the fix replaces the factory and the deprecated method in one go, keeping the methods in between.
On an integer factory, it removes the method:

```ts
// Before
z.number().safe().min(1);
// After
z.int().min(1);

// Before
z.int32().safe().min(1);
// After
z.int32().min(1);
```

The removal works with named imports too, and is withheld only when a comment would be dropped or the receiver is parenthesized.
The rewrite reports but does **not** fix these cases, because the replacement cannot be written safely:

- A named import (`import { number } from 'zod'; number().safe()`) — the fix would need a new import for the top-level factory
- A chain reached through a computed member (`z['number']().safe()`), which the chain walker cannot name
- A factory called with arguments (`z.number({ error: '…' }).safe()`), which the replacement would drop
- A type-changing method before the deprecated one, which the replacement would then run ahead of

## When Not To Use It

If you are stuck on a Zod version where the deprecation does not apply, you can turn this rule off.

## Further Reading

- [Zod v4 – Integers](https://zod.dev/api?id=integers)
