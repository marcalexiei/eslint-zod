# zod/prefer-meta

📝 Enforce usage of `.meta()` over `.describe()`.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces the usage of `.meta()` over `.describe()` in Zod schemas.
While `.describe()` still exists for compatibility with Zod 3, `.meta()` is now the recommended approach in newer versions.

## Why?

The `.describe()` method was the original way to add metadata to Zod schemas, but it has been superseded by `.meta()` which:

1. Provides a more flexible API for schema metadata
2. Aligns better with Zod's modern features
3. Is the officially recommended approach for new code
4. Allows for richer metadata beyond just descriptions

## Examples

### ❌ Invalid

```ts
// Using .describe() with a string
z.string().describe('desc').trim();

// Using .describe() with a template literal
const desc = 'desc';
z.string().describe(`desc${desc}`).trim();

// Using .describe() with a variable
const desc = 'desc';
z.string().describe(desc).trim();
```

### ✅ Valid

```ts
// Using .meta() with description
z.string().meta({ description: 'desc' });

// Using .meta() with a variable
const desc = 'desc';
z.string().meta({ description: desc });

// Using .meta() with additional metadata
z.string().meta({
  description: 'desc',
  example: 'example value',
  deprecated: false,
});
```

## Automatic Fixes

This rule provides automatic fixes that will:

- Replace `.describe(x)` with `.meta({ description: x })`
- Preserve the description value, including variables and template literals
- Maintain the rest of the schema chain

## When Not To Use It

If you're maintaining a codebase that needs to support both Zod 3 and newer versions simultaneously, you might want to disable this rule. However, for new code or projects using recent versions of Zod, it's recommended to use `.meta()`.

## Further Reading

- [Zod - Schema Metadata](https://zod.dev/metadata)
- [Zod - Describe](https://zod.dev/metadata#describe)
