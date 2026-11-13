# zod/no-number-schema-with-int

📝 Disallow usage of `z.number().int()` as it is considered legacy.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule aims to prevent the usage of the legacy `z.number().int()` method chain in favor of the more concise `z.int()` method.

`.int()` adds Zod's safe-integer check, so it is reported on every number factory:

- on `z.float32()` and `z.float64()`, which accept fractions, the schema is `z.int()` and the fix rewrites it the same way
- on `z.int()`, `z.int32()` and `z.uint32()`, which accept only safe integers already, the call adds nothing and the fix removes it

`z.coerce.number().int()` is not reported: no top-level factory coerces, so `.int()` is the only way to write a coerced integer.

## Examples

### ❌ Invalid

```ts
const schema = z.number().int();
const schemaWithOtherMethods = z.number().min(0).int().max(100);
const floatSchema = z.float32().int();
const redundant = z.int32().int();
```

### ✅ Valid

```ts
const schema = z.int();
const schemaWithOtherMethods = z.int().min(0).max(100);
const int32Schema = z.int32();
```

## Autofix Behavior

On a factory that accepts fractions, the fix replaces the factory and the deprecated method in one go, keeping the methods in between.
On an integer factory, it removes the method:

```ts
// Before
z.number().int().min(1);
// After
z.int().min(1);

// Before
z.int32().int().min(1);
// After
z.int32().min(1);
```

The removal works with named imports too, and is withheld only when a comment would be dropped or the receiver is parenthesized.
The rewrite reports but does **not** fix these cases, because the replacement cannot be written safely:

- A named import (`import { number } from 'zod'; number().int()`) — the fix would need a new import for the top-level factory
- A chain reached through a computed member (`z['number']().int()`), which the chain walker cannot name
- A factory called with arguments (`z.number({ error: '…' }).int()`), which the replacement would drop
- A type-changing method before the deprecated one, which the replacement would then run ahead of

## When Not To Use It

If you’re not concerned about using a legacy API, you can disable this rule.

## Further Reading

- [Zod - Numbers](https://zod.dev/api?id=numbers)
- [Zod - Integers](https://zod.dev/api?id=integers)
- [Zod - v4 migration - .int() accepts safe integers only](https://zod.dev/v4/changelog?id=int-accepts-safe-integers-only)
