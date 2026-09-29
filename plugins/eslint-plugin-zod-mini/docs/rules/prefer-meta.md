# zod-mini/prefer-meta

📝 Enforce usage of `z.meta()` over `z.describe()`.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces the usage of `z.meta()` over `z.describe()` in Zod Mini schemas.
While `z.describe()` still exists for compatibility with Zod 3, `z.meta()` is now the recommended approach in newer versions.

In Zod Mini, `z.describe()` is a standalone `$ZodCheck` function passed to `.check()`, not a chained method.

## Why?

The `z.describe()` function was the original way to add metadata to Zod Mini schemas, but it has been superseded by `z.meta()` which:

1. Provides a more flexible API for schema metadata
2. Aligns better with Zod's modern features
3. Is the officially recommended approach for new code
4. Allows for richer metadata beyond just descriptions

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

// Using z.describe() inside .check()
z.string().check(z.describe('desc'));

// Using z.describe() with a template literal
const desc = 'desc';
z.string().check(z.describe(`desc${desc}`));

// Using z.describe() with a variable
const description = 'desc';
z.string().check(z.describe(description));
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

// Using z.meta() with description
z.string().check(z.meta({ description: 'desc' }));

// Using z.meta() with a variable
const desc = 'desc';
z.string().check(z.meta({ description: desc }));

// Using z.meta() with additional metadata
z.string().check(
  z.meta({
    description: 'desc',
    example: 'example value',
    deprecated: false,
  }),
);
```

## Automatic Fixes

This rule provides automatic fixes that will:

- Replace `z.describe(x)` with `z.meta({ description: x })`
- Preserve the description value, including variables and template literals

The rule reports without a fix when it cannot rewrite the call safely:

- a named import (`import { describe } from 'zod/mini'`), which would need `meta` imported too
- a computed key (`z['describe'](x)`), where the method name is a string literal rather than a property to rename

## When Not To Use It

If you're maintaining a codebase that needs to support both Zod 3 and newer versions simultaneously, you might want to disable this rule. However, for new code or projects using recent versions of Zod Mini, it's recommended to use `z.meta()`.

## Further Reading

- [Zod - Schema Metadata](https://zod.dev/metadata)
- [Zod - Describe](https://zod.dev/metadata#describe)
