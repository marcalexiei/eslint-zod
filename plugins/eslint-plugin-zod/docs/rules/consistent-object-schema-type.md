# zod/consistent-object-schema-type

📝 Enforce consistent usage of Zod schema methods.

💼 This rule is enabled in the 🎨 `stylistic` config.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces consistent usage of Zod object schema methods across your codebase.
Zod provides three methods for creating object schemas:
`object()`, `looseObject()`, and `strictObject()`.
This rule ensures you use only the allowed methods.

## Why?

- Enforces a single, explicit object semantics so readers and maintainers know whether extra properties are allowed or rejected.
- Prevents subtle runtime bugs that arise when different parts of a codebase use different object validation behaviors (loose vs strict).
- Improves API stability by making object schema expectations consistent across modules and releases.
- Helps enforce team conventions and reduces cognitive load when authoring or refactoring schemas.

## Options

<!-- begin auto-generated rule options list -->

| Name    | Description                              | Type     |
| :------ | :--------------------------------------- | :------- |
| `allow` | Decides which object methods are allowed | String[] |

<!-- end auto-generated rule options list -->

## Examples

### ❌ Invalid

### Examples of **incorrect** code with the default options

```ts
import * as z from 'zod';

// ❌ looseObject is not allowed by default
z.looseObject({ name: z.string() });

// ❌ strictObject is not allowed by default
z.strictObject({ name: z.string() });
```

### ✅ Valid

```ts
import * as z from 'zod';

// ✅ object is allowed by default
z.object({ name: z.string() });
```

## Custom Configuration Example

**Default:** `['object']`

### Example configuration

```json
{
  "rules": {
    "zod/consistent-object-schema-type": ["error", { "allow": ["looseObject", "strictObject"] }]
  }
}
```

With this configuration, the following code would be correct:

```ts
import * as z from 'zod';

z.looseObject({ name: z.string() });
z.strictObject({ age: z.number() });
```

But this would be incorrect:

```ts
import * as z from 'zod';

// ❌ object is not allowed in this configuration
z.object({ name: z.string() });
```

## When Not To Use It

Consider disabling or not applying this rule when:

- Different modules intentionally use different object semantics
  (some require strict objects while others accept loose ones).
- You're doing a staged migration between schema styles:
  the rule can create churn and noisy fixes during the migration.
- You're authoring a library that must expose both strict and loose schemas as part of its public API.
- You prefer enforcing schema semantics via tests or code review rather than a global lint rule.
- You are using `zod/prefer-strict-object` and/or `zod/prefer-loose-object`. (If you use them, configure this rule to allow `strictObject` and/or `looseObject` as needed.)

If you still want partial enforcement, you use ESLint overrides to scope the rule to specific directories or file patterns instead of enabling it project‑wide.

## Further Reading

- [Zod - objects](https://zod.dev/api#objects)
- [Zod - `looseObject`](https://zod.dev/api#zlooseobject)
- [Zod - `strictObject`](https://zod.dev/api#zstrictobject)
