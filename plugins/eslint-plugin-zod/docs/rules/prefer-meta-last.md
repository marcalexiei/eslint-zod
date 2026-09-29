# zod/prefer-meta-last

📝 Enforce `.meta()` as last method.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces that `.meta()` calls should always be the last method in a Zod schema chain.

This promotes a consistent and predictable pattern for schema metadata placement.

## Why?

Placing `.meta()` calls at the end of the schema chain:

1. Makes the schema definition more readable and maintainable
2. Creates a consistent pattern across your codebase
3. Separates the schema's validation logic from its metadata
4. Makes it easier to spot and manage metadata information

## Examples

### ❌ Invalid

```ts
// .meta() followed by other methods
z.string().meta({ description: 'desc' }).trim();

// .meta() in the middle of the chain
z.string().min(5).meta({ foo: 'bar' }).max(10);

// .meta() before transform
z.string()
  .meta({ foo: 'bar' })
  .transform((x) => x.toUpperCase());
```

### ✅ Valid

```ts
// .meta() at the end of the chain
z.string().min(5).max(10).meta({ description: 'my string' });

// Multiple .meta() calls at the end are valid
z.string().min(5).max(10).meta({ a: 1 }).meta({ b: 2 });

// Schema without meta() is valid
z.string().min(5).max(10);
```

## When Not To Use It

If you have a specific need to call methods after `.meta()` or if you're working with a codebase that has an established different convention for metadata placement, you might want to disable this rule.

## Further Reading

- [Zod - Schema Metadata](https://zod.dev/metadata)
