# zod-mini/consistent-schema-var-name

📝 Enforce a consistent naming convention for Zod Mini schema variables.

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces a consistent naming convention for Zod Mini schema variables by requiring them to start with a specified prefix and/or end with a specified suffix.
The default behavior (suffix `'Schema'`) is equivalent to the deprecated `zod-mini/require-schema-suffix` rule.

If only `before` or `after` is configured, a variable name equal to that token is also allowed, ignoring case.

The rule ignores:

- Variables that store parsed values (e.g., `.parse()`, `.safeParse()`)
- Variables that store a validation result (`z.validate()`, `z.validateAsync()`)
- Error formatting utilities (e.g., `prettifyError`, `formatError`)
- Helpers that return something other than a schema (`z.toJSONSchema()`, `z.registry()`, `z.locales.en()`)
- Non-Zod Mini variable declarations

## Why?

Using a consistent naming convention for Zod Mini schemas provides several benefits:

1. **Clear Identification**: Makes it immediately obvious which variables contain Zod Mini schemas
2. **Better Code Navigation**: Easier to find schema declarations when all follow the same pattern
3. **Self-Documenting Code**: The prefix/suffix helps document the variable's purpose
4. **Consistency**: Maintains a uniform naming convention across the project

## Options

<!-- begin auto-generated rule options list -->

| Name     | Description                                       | Type   |
| :------- | :------------------------------------------------ | :----- |
| `after`  | The required suffix for Zod Mini schema variables | String |
| `before` | The required prefix for Zod Mini schema variables | String |

<!-- end auto-generated rule options list -->

## Why is there no autofix or suggestion?

**TL;DR:** Use your IDE's rename functionality, it's far more robust and already battle-tested.
Adding a custom autofix here would essentially reinvent the wheel.

---

Renaming variables safely is surprisingly complex.
An ESLint rule cannot reliably handle all the cases involved, including:

- handling linked `import` / `export` statements
- avoiding naming conflicts within the same scope
- preventing accidental shadowing of variables in inner or outer scopes
- applying changes across multiple files (e.g., when the variable is exported)

Because of these limitations, this rule only reports an error and does not provide an automated fix.
To resolve the issue, rely on your IDE's rename tools.
They're designed to manage all of the above scenarios correctly.

## Examples

### Default (suffix only)

```json
{
  "rules": {
    "zod-mini/consistent-schema-var-name": ["error"]
  }
}
```

❌ Invalid

```ts
import * as z from 'zod/mini';

const user = z.string();
const address = z.object({ street: z.string() });
```

✅ Valid

```ts
import * as z from 'zod/mini';

const schema = z.string();
const userSchema = z.string();
const addressSchema = z.object({ street: z.string() });

// Non-schema declarations are ignored
const parsedValue = z.string().parse('test');
```

### Prefix only

The default `after` is `'Schema'`, so to enforce only a prefix you must explicitly clear the suffix with `"after": ""`.

```json
{
  "rules": {
    "zod-mini/consistent-schema-var-name": ["error", { "before": "$", "after": "" }]
  }
}
```

❌ Invalid

```ts
import * as z from 'zod/mini';

const user = z.string();
const address = z.object({ street: z.string() });
```

✅ Valid

```ts
import * as z from 'zod/mini';

const $user = z.string();
const $address = z.object({ street: z.string() });
```

### Both prefix and suffix

```json
{
  "rules": {
    "zod-mini/consistent-schema-var-name": ["error", { "before": "$", "after": "Schema" }]
  }
}
```

❌ Invalid

```ts
import * as z from 'zod/mini';

const user = z.string();
const $user = z.string();
const userSchema = z.string();
```

✅ Valid

```ts
import * as z from 'zod/mini';

const $userSchema = z.string();
const $addressSchema = z.object({ street: z.string() });
```

### Custom suffix (snake_case)

```json
{
  "rules": {
    "zod-mini/consistent-schema-var-name": ["error", { "after": "_schema" }]
  }
}
```

❌ Invalid

```ts
import * as z from 'zod/mini';

const user = z.string();
```

✅ Valid

```ts
import * as z from 'zod/mini';

const user_schema = z.string();
```

## When Not To Use It

- Have an existing codebase with different naming conventions
- Prefer a different way to identify schema variables
- Use Zod Mini schemas in a context where the prefix/suffix would be redundant

## Further Reading

- [TypeScript ESLint - Naming convention rule](https://typescript-eslint.io/rules/naming-convention)
