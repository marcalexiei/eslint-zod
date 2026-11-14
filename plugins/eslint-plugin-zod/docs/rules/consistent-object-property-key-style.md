# zod/consistent-object-property-key-style

📝 Enforce consistent Zod object property key style.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces a consistent naming convention (`camelCase` or `snake_case`) for property keys in Zod object schemas.

It checks object schemas created with:

- `z.object({ ... })`
- `z.looseObject({ ... })`
- `z.strictObject({ ... })`

The rule also inspects object shapes passed via local variable identifiers when the initializer is an object expression (e.g. `const shape = { ... }; z.object(shape);`).
Properties defined using spread elements (`...other`) are ignored.

## Why?

- **Consistency**: Enforces a uniform key style across all schema definitions in a codebase.
- **Interoperability**: Makes it easy to align schemas with project-wide naming conventions — such as `camelCase` for TypeScript-idiomatic code, or `snake_case` when matching database columns, external APIs, or wire formats.
- **Maintainability**: Automated fixes keep property key naming consistent across refactors without manual edits.

## Options

<!-- begin auto-generated rule options list -->

| Name    | Description                                                    | Type     | Choices                   |
| :------ | :------------------------------------------------------------- | :------- | :------------------------ |
| `allow` | Decides which object schema creation methods are checked       | String[] |                           |
| `style` | Decides which naming style to enforce for object property keys | String   | `camelCase`, `snake_case` |

<!-- end auto-generated rule options list -->

You can configure the following options:

- `style` (`"camelCase"` | `"snake_case"`, default: `"camelCase"`): Enforces camelCase keys (e.g. `userName`, `firstName`) or snake_case keys (e.g. `user_name`, `first_name`).
- `allow` (array of `"object"` | `"looseObject"` | `"strictObject"`, default: `["object", "looseObject", "strictObject"]`): Specifies which object schema creation methods should have their property keys checked. By default, all three methods are checked.

## Examples

### `camelCase` (default)

#### ❌ Invalid

```ts
import { z } from 'zod';

z.object({
  user_name: z.string(),
  phone_number: z.string(),
});

z.looseObject({
  is_active: z.boolean(),
});
```

#### ✅ Valid

```ts
import { z } from 'zod';

z.object({
  userName: z.string(),
  phoneNumber: z.string(),
});

z.looseObject({
  isActive: z.boolean(),
});
```

### `snake_case`

#### ❌ Invalid

```ts
/* eslint zod/consistent-object-property-key-style: ["error", { "style": "snake_case" }] */
import { z } from 'zod';

z.object({
  userName: z.string(),
  phoneNumber: z.string(),
});

z.strictObject({
  isActive: z.boolean(),
});
```

#### ✅ Valid

```ts
/* eslint zod/consistent-object-property-key-style: ["error", { "style": "snake_case" }] */
import { z } from 'zod';

z.object({
  user_name: z.string(),
  phone_number: z.string(),
});

z.strictObject({
  is_active: z.boolean(),
});
```

### With `allow`

```json
{
  "rules": {
    "zod/consistent-object-property-key-style": [
      "error",
      {
        "style": "camelCase",
        "allow": ["object"]
      }
    ]
  }
}
```

#### ❌ Invalid

```ts
import { z } from 'zod';

// Checked: violates camelCase
z.object({
  user_name: z.string(),
});
```

#### ✅ Valid

```ts
import { z } from 'zod';

// Checked: follows camelCase
z.object({
  userName: z.string(),
});

// Ignored because looseObject and strictObject are not in allow
z.looseObject({
  user_name: z.string(),
});

z.strictObject({
  user_name: z.string(),
});
```

## Autofix Behavior

The rule automatically converts non-conforming property keys to the configured style:

```ts
// When configured with "camelCase":
// Before
z.object({ user_name: z.string() });
// After
z.object({ userName: z.string() });

// String literal keys preserve quotes:
// Before
z.object({ user_name: z.string() });
// After
z.object({ userName: z.string() });
```

## When Not To Use It

You may want to disable this rule if:

- Your Zod schemas describe external payloads (e.g. third-party APIs, database responses) that require mixed or legacy property key naming conventions.
- You already enforce property casing across all object literals in your project using a broader lint rule (such as `@typescript-eslint/naming-convention`), and do not want schema-specific key enforcement.
