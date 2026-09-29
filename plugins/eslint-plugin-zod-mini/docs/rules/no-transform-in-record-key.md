# zod-mini/no-transform-in-record-key

📝 Disallow transforms in z.record() key schemas, which can cause silent key mutations and data loss through key collisions.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule Details

This ESLint rule detects mutating checks in `z.record()` key schemas and prevents them.

In Zod Mini, transforms are standalone `$ZodCheck` functions passed into `.check()`. Using mutating checks like `z.trim()`, `z.toLowerCase()`, `z.toUpperCase()`, `z.normalize()`, or `z.overwrite()` on the key schema in `z.record()` causes silent key mutation and data loss through key collisions.

### The Problem

When you use `z.record(z.string().check(z.trim()), z.unknown())`, Zod Mini applies the `z.trim()` mutation to every object key during parsing. This creates two critical issues:

1. **Silent key mutation** — Keys are transformed without the developer realizing it, since `z.record()` looks like a validation boundary.

2. **Key collision and data loss** — Two distinct input keys can collapse into one after the transform:

   ```ts
   import * as z from 'zod/mini';

   const schema = z.record(z.string().check(z.trim()), z.unknown());
   const input = { ' id ': 'abc-123', id: 'def-456', '  source': 'google' };
   const result = schema.parse(input);
   // Result: { id: "def-456", source: "google" }
   // " id " -> "id" (collides with existing "id"), "abc-123" is silently lost!
   // "  source" -> "source" (mutated key)
   ```

This is especially dangerous when the record is forwarded to a backend API or analytics pipeline. The receiving system sees different keys than intended.

## Why?

Most developers reaching for `z.record(z.string().check(z.trim()), z.unknown())` intend to validate that keys are strings, not mutate them. Mutating checks inside record keys turn a validation boundary into an implicit rewrite step.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

// z.trim() silently rewrites keys
const config = z.record(z.string().check(z.trim()), z.unknown());

// z.toLowerCase() can collapse distinct keys into one
const userMap = z.record(z.string().check(z.toLowerCase()), z.unknown());

// z.normalize() also mutates keys
const aliases = z.record(z.string().check(z.normalize()), z.string());

// z.overwrite() is a mutating check too
const configWithOverwrite = z.record(
  z.string().check(z.overwrite((value) => value.trim())),
  z.unknown(),
);
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

// Plain string key
const config = z.record(z.string(), z.unknown());

// Validation-only checks are fine
const validatedKeys = z.record(z.string().check(z.minLength(1)), z.unknown());

// lowercase() validates; it does not mutate the key
const lowercaseKeys = z.record(z.string().check(z.lowercase()), z.number());

// Transform on the value schema is fine
const trimmedValues = z.record(z.string(), z.string().check(z.trim()));
```

## When Not To Use It

This rule should usually stay enabled. If you need to normalize external keys, do that before schema parsing or in a dedicated normalization step after validating the input shape.

## Further Reading

- [Zod - Records](https://zod.dev/api?id=records)
- [Zod Mini](https://zod.dev/packages/mini)
