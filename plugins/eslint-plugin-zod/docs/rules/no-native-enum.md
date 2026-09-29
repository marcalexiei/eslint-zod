# zod/no-native-enum

📝 Disallow deprecated `z.nativeEnum()` in favor of `z.enum()`.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

Zod 4 deprecates `z.nativeEnum()` in favor of `z.enum()`. This rule flags `z.nativeEnum()` usages so schemas follow the current API.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod';

enum Color {
  Red = 'red',
  Blue = 'blue',
}

const schema = z.nativeEnum(Color);
const optionalSchema = z.nativeEnum(Color).optional();
```

```ts
import { nativeEnum } from 'zod';

const schema = nativeEnum(Color);
```

### ✅ Valid

```ts
import * as z from 'zod';

enum Color {
  Red = 'red',
  Blue = 'blue',
}

const schema = z.enum(Color);
const optionalSchema = z.enum(Color).optional();
```

```ts
import { enum as zodEnum } from 'zod';

const schema = zodEnum(Color);
```

## Autofix Behavior

When the schema is accessed via a Zod namespace (e.g. `z.nativeEnum(...)`, `import * as z` or `import { z }`), this rule will automatically:

- Replace `.nativeEnum(...)` with `.enum(...)`
- Preserve the original argument

Example fix:

```ts
// Before
z.nativeEnum(Color);
z.nativeEnum(Color).optional();

// After
z.enum(Color);
z.enum(Color).optional();
```

### Limitations

Autofix is **not applied** when:

- The schema is called via a named import (e.g. `import { nativeEnum } from 'zod'`)

In these cases, the rule still reports the violation but will not modify the code, since the import declaration must also be updated.

## When Not To Use It

Disable this rule if you intentionally want to allow the deprecated `z.nativeEnum()` API.

## Further Reading

- [Zod enums](https://zod.dev/api?id=enums)
- [Zod 4 changelog](https://zod.dev/v4/changelog#znativeenum-deprecated)
