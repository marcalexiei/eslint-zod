# zod/consistent-import

📝 Enforce a consistent import style for Zod.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule details

This rule enforces a single, consistent import style for Zod across a codebase.
Zod's API can be reached through three import forms, two of which the rule can enforce:

- **Namespace import**: `import * as z from 'zod'`
- **Named import**: `import { z } from 'zod'`
- **Default import**: `import z from 'zod'` — always rewritten to the configured syntax
  (see [Why there is no `default` syntax](#why-there-is-no-default-syntax))

The rule ensures that:

- Only one Zod import is present per module.
- The chosen syntax is used consistently.
- All Zod usages are updated to match the selected import style.
- Type-only imports are respected (`import type` when applicable).

## Why?

- **Consistency**: avoids mixed import styles within and across files.
- **Clarity**: makes it immediately obvious how Zod APIs are accessed.
- **Maintainability**: simplifies refactors and automated tooling.
- **Correctness**: prevents subtle duplication or shadowing of Zod imports.

Because the rule is fully fixable, large codebases can be migrated automatically.

Unlike most `consistent-*` rules, this one is in `recommended` rather than `stylistic`: import syntax is baseline hygiene, not a matter of taste.

## Options

<!-- begin auto-generated rule options list -->

| Name     | Description                                 | Type   | Choices              |
| :------- | :------------------------------------------ | :----- | :------------------- |
| `syntax` | Specifies the import syntax to use for Zod. | String | `namespace`, `named` |

<!-- end auto-generated rule options list -->

### Available syntaxes

- **`namespace`** (default): `import * as z from 'zod'`
- **`named`**: `import { z } from 'zod'`

The default is `namespace`, as it avoids named import collisions and makes usage explicit (`z.string()`, `z.object()`, etc.).

### Why there is no `default` syntax

`import z from 'zod'` works at runtime, but is deliberately not a third `syntax` choice
([#409](https://github.com/marcalexiei/eslint-zod/issues/409)):

- The [Zod docs](https://zod.dev/basics) use `import * as z from 'zod'` throughout.
- It tree-shakes as badly as `named`: Zod's entrypoint does `export { z }; export default z;`, so both
  are the same materialized namespace object, and only `import * as z` gives the bundler a live
  namespace binding ([zod#4433](https://github.com/colinhacks/zod/issues/4433#issuecomment-2921500831)).
- `zod/mini`, `zod/v4-mini` and `zod/v4/core` have no default export, so a shared option would have to
  be forked per plugin — for a form with no advantage over `namespace`.

It is therefore reported under either `syntax` and rewritten to it.

## Examples

### `namespace`

This follows the default pattern in the [Zod "Defining a schema" documentation](https://zod.dev/basics?id=defining-a-schema).

Alternative syntaxes can reduce tree-shaking effectiveness and increase bundle size:

- [Zod – v4: Next.js treeshaking](https://github.com/colinhacks/zod/issues/4433#issuecomment-2921500831)

#### ✅ Valid

```ts
import * as z from 'zod';

z.string();
z.object({ name: z.string() });
```

```ts
import type * as z from 'zod';

type Schema = z.ZodString;
```

#### ❌ Invalid

```ts
import { z } from 'zod';

z.string();
```

```ts
import z from 'zod';

z.string();
```

```ts
import * as z from 'zod';
import { ZodString } from 'zod';
```

### `named`

#### ✅ Valid

```ts
import { z } from 'zod';

z.string();
z.array(z.number());
```

```ts
import type { z } from 'zod';

type Schema = z.ZodArray<z.ZodNumber>;
```

#### ❌ Invalid

```ts
import * as z from 'zod';

z.string();
```

```ts
import z from 'zod';

z.string();
```

```ts
import { z } from 'zod';
import { ZodString } from 'zod';
```

## Autofix behavior

When fixing is applied, the rule will:

- Rewrite the first Zod import to match the configured syntax.
- Preserve the local name when rewriting: `import zod from 'zod'` becomes `import { z as zod } from 'zod'` under `named`.
- Remove duplicate Zod imports.
- Update all Zod usages to use the correct namespace or alias.
- Preserve `import type` when the file only contains type imports.

## Further Reading

- [Zod - Installation](https://zod.dev/?id=installation)
- [MDN - ESM import syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
- [TypeScript `import type`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html)
