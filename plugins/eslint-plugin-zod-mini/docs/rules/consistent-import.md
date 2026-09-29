# zod-mini/consistent-import

📝 Enforce a consistent import style for Zod Mini.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule details

This rule enforces a single, consistent import style for Zod Mini across a codebase.
Zod Mini can be imported either via:

- **Namespace import**: `import * as z from 'zod/mini'`
- **Named import**: `import { z } from 'zod/mini'`

The rule ensures that:

- Only one Zod Mini import is present per module.
- The chosen syntax is used consistently.
- All Zod Mini usages are updated to match the selected import style.
- Type-only imports are respected (`import type` when applicable).

## Why?

- **Consistency**: avoids mixed import styles within and across files.
- **Clarity**: makes it immediately obvious how Zod Mini APIs are accessed.
- **Maintainability**: simplifies refactors and automated tooling.
- **Correctness**: prevents subtle duplication or shadowing of Zod Mini imports.

Because the rule is fully fixable, large codebases can be migrated automatically.

Unlike most `consistent-*` rules, this one is in `recommended` rather than `stylistic`: import syntax is baseline hygiene, not a matter of taste.

## Options

<!-- begin auto-generated rule options list -->

| Name     | Description                                      | Type   | Choices              |
| :------- | :----------------------------------------------- | :----- | :------------------- |
| `syntax` | Specifies the import syntax to use for Zod Mini. | String | `namespace`, `named` |

<!-- end auto-generated rule options list -->

### Available syntaxes

- **`namespace`** (default): `import * as z from 'zod/mini'`
- **`named`**: `import { z } from 'zod/mini'`

The default is `namespace`, as it avoids named import collisions and makes usage explicit (`z.string()`, `z.object()`, etc.).

## Examples

### `namespace`

#### ✅ Valid

```ts
import * as z from 'zod/mini';

z.string();
z.object({ name: z.string() });
```

```ts
import type * as z from 'zod/mini';

type Schema = z.$ZodString;
```

#### ❌ Invalid

```ts
import { z } from 'zod/mini';

z.string();
```

```ts
import * as z from 'zod/mini';
import { $ZodString } from 'zod/mini';
```

### `named`

#### ✅ Valid

```ts
import { z } from 'zod/mini';

z.string();
z.array(z.number());
```

```ts
import type { z } from 'zod/mini';

type Schema = z.$ZodArray<z.$ZodNumber>;
```

#### ❌ Invalid

```ts
import * as z from 'zod/mini';

z.string();
```

```ts
import { z } from 'zod/mini';
import { $ZodString } from 'zod/mini';
```

## Autofix behavior

When fixing is applied, the rule will:

- Rewrite the first Zod Mini import to match the configured syntax.
- Remove duplicate Zod Mini imports.
- Update all Zod Mini usages to use the correct namespace or alias.
- Preserve `import type` when the file only contains type imports.

## Further Reading

- [Zod Mini - Installation](https://zod.dev/?id=installation)
- [MDN - ESM import syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
- [TypeScript `import type`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html)
