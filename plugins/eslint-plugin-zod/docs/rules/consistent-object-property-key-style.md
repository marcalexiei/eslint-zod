# zod/consistent-object-property-key-style

📝 Enforce consistent Zod object property key style.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

This rule reports property keys of Zod object schemas written in the other naming style than the configured one:
`snake_case` keys under `camelCase`, and `camelCase` keys under `snake_case`.

It checks the shape passed to `z.object()`, `z.looseObject()` and `z.strictObject()`,
inline or through a local variable (`const shape = { … }; z.object(shape);`).

A key that fits neither style is left alone, since its spelling is usually deliberate:
`_id`, `'Content-Type'`, `userID`, `UserName`, or a numeric key.
A one-word key such as `id` fits both.
Spread elements (`...other`) and computed keys that are not string literals are ignored.

## Why?

- **Consistency**: one key style across every schema in a codebase.
- **Intent**: a project that maps a snake_case API at its boundary can keep that style in its schemas, and camelCase everywhere else.

## Options

<!-- begin auto-generated rule options list -->

| Name    | Description                                                    | Type     | Choices                   |
| :------ | :------------------------------------------------------------- | :------- | :------------------------ |
| `allow` | Decides which object schema creation methods are checked       | String[] |                           |
| `style` | Decides which naming style to enforce for object property keys | String   | `camelCase`, `snake_case` |

<!-- end auto-generated rule options list -->

- `style` (`"camelCase"` | `"snake_case"`, default `"camelCase"`): the style keys must follow.
- `allow` (array of `"object"` | `"looseObject"` | `"strictObject"`, default: all three): the object factories whose keys are checked.

```json
{
  "rules": {
    "zod/consistent-object-property-key-style": [
      "error",
      { "style": "snake_case", "allow": ["object"] }
    ]
  }
}
```

## Examples

### ❌ Invalid

```ts
import * as z from 'zod';

z.object({
  user_name: z.string(),
  phone_number: z.string(),
});

z.object({ is_active: z.boolean() }).optional();
```

```ts
/* eslint zod/consistent-object-property-key-style: ["error", { "style": "snake_case" }] */
import * as z from 'zod';

z.strictObject({
  userName: z.string(),
});
```

### ✅ Valid

```ts
import * as z from 'zod';

z.object({
  userName: z.string(),
  phoneNumber: z.string(),
});

z.object({ isActive: z.boolean() }).optional();

// Neither style, so left alone
z.object({ _id: z.string(), 'Content-Type': z.string() });
```

```ts
/* eslint zod/consistent-object-property-key-style: ["error", { "style": "snake_case" }] */
import * as z from 'zod';

z.strictObject({
  user_name: z.string(),
});
```

## Suggestions

Renaming a key changes which input key the schema reads, so the rename is a suggestion, not an autofix:
data that still sends `user_name` stops parsing once the schema expects `userName`.

A quoted key keeps its quotes, and a shorthand key keeps its value (`{ user_name }` → `{ userName: user_name }`).
No suggestion is offered when the new name is already a key of the same shape.

## When Not To Use It

- Your schemas describe external payloads whose keys you do not control.
- You already enforce key casing on every object with `@typescript-eslint/naming-convention`.

## Further Reading

- [Zod objects](https://zod.dev/api#objects)
