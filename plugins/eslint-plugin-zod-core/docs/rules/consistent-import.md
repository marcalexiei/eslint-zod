# zod-core/consistent-import

📝 Enforce a consistent import style for Zod core.

💼 This rule is enabled in the ✅ `recommended` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces the namespace form for `zod/v4/core` imports: `import * as core from 'zod/v4/core'`.
Named imports such as `import { $ZodString } from 'zod/v4/core'` are rewritten to it, and their usages are qualified with the namespace.

## Options

<!-- begin auto-generated rule options list -->

| Name     | Description                                      | Type   | Choices     |
| :------- | :----------------------------------------------- | :----- | :---------- |
| `syntax` | Specifies the import syntax to use for Zod core. | String | `namespace` |

<!-- end auto-generated rule options list -->

`namespace` is the default and the only choice.
The `named` syntax of `eslint-plugin-zod` imports `z`, and unlike `zod` and `zod/mini`, `zod/v4/core` has no `z` export.

## Examples

With `{ "syntax": "namespace" }` (default):

### ❌ Invalid

```ts
import { $ZodString } from 'zod/v4/core';
const mySchema = new $ZodString({ type: 'string', checks: [] });
```

### ✅ Valid

```ts
import * as core from 'zod/v4/core';
const mySchema = new core.$ZodString({ type: 'string', checks: [] });
```
