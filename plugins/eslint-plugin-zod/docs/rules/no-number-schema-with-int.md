# zod/no-number-schema-with-int

📝 Disallow usage of `z.number().int()` as it is considered legacy.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule aims to prevent the usage of the legacy `z.number().int()` method chain in favor of the more concise `z.int()` method.

## Examples

### ❌ Invalid

```ts
const schema = z.number().int();
const schemaWithOtherMethods = z.number().min(0).int().max(100);
```

### ✅ Valid

```ts
const schema = z.int();
const schemaWithOtherMethods = z.int().min(0).max(100);
```

## Autofix Behavior

The fix replaces the factory and the deprecated method in one go, keeping the methods in between:

```ts
// Before
z.number().int().min(1);
// After
z.int().min(1);
```

The rule reports but does **not** fix two cases, because the replacement cannot be written safely:

- A named import (`import { number } from 'zod'; number().int()`) — the fix would need a new import for the top-level factory
- A chain reached through a computed member (`z['number']().int()`), which the chain walker cannot name

## When Not To Use It

If you’re not concerned about using a legacy API, you can disable this rule.

## Further Reading

- [Zod - Numbers](https://zod.dev/api?id=numbers)
- [Zod - Integers](https://zod.dev/api?id=integers)
- [Zod - v4 migration - .int() accepts safe integers only](https://zod.dev/v4/changelog?id=int-accepts-safe-integers-only)
