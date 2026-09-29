# zod/no-transform-in-record-key

📝 Disallow transforms in z.record() key schemas, which can cause silent key mutations and data loss through key collisions.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule details

This ESLint rule detects **transforms in `z.record()` key schemas** and prevents them.

Using transforms (like `.trim()`, `.normalize()`, `.toLowerCase()`, `.toUpperCase()`, `.overwrite()`, or `.transform()`) on the key schema in `z.record()` causes silent key mutation and data loss through key collisions.

### The Problem

When you use `z.record(z.string().trim(), z.unknown())`, Zod applies the `.trim()` transform to every object key during parsing. This creates two critical issues:

1. **Silent key mutation** — Keys are transformed without the developer realizing it, since `z.record` looks like a validation boundary.

2. **Key collision and data loss** — Two distinct input keys can collapse into one after the transform:

   ```ts
   const schema = z.record(z.string().trim(), z.unknown());
   const input = { ' id ': 'abc-123', id: 'def-456', '  source': 'google' };
   const result = schema.parse(input);
   // Result: { id: "def-456", source: "google" }
   // " id " → "id" (collides with existing "id"), "abc-123" is silently lost!
   // "  source" → "source" (mutated key)
   ```

This is especially dangerous when the record is forwarded to a backend API or analytics pipeline — the receiving system sees different keys than intended.

## Why?

Most developers reaching for `z.record(z.string().trim(), z.unknown())` intend to **validate** that keys are strings, not **transform** them. The transform happens silently, making this a footgun.

## Examples

### ❌ Invalid

```ts
// .trim() is a transform — silently rewrites keys
const config = z.record(z.string().trim(), z.unknown());

// .toLowerCase() is a transform — causes key collisions
// e.g. { "Foo": 1, "foo": 2 } → { "foo": 2 }, silently drops "Foo"
const config = z.record(z.string().toLowerCase(), z.unknown());

// .toUpperCase() — same class of problem
const config = z.record(z.string().toUpperCase(), z.number());

// Chained transforms on the key
const config = z.record(z.string().trim().toLowerCase(), z.unknown());

// .normalize() mutates the parsed key value
const config = z.record(z.string().normalize(), z.unknown());

// .overwrite() still rewrites the parsed key, even if the inferred type stays the same
const config = z.record(
  z.string().overwrite((value) => value.trim()),
  z.unknown(),
);

// .transform() is never allowed on keys
const config = z.record(
  z.string().transform((v) => v.trim()),
  z.unknown(),
);
```

### ✅ Valid

```ts
// Plain string key — no transform, just validation
const config = z.record(z.string(), z.unknown());

// String key with refinement (validates but doesn't mutate)
const config = z.record(z.string().min(1), z.unknown());

// Enum key — no transform
const config = z.record(z.enum(['a', 'b', 'c']), z.number());

// Transform on the *value* schema is fine — values aren't used as keys
const config = z.record(z.string(), z.string().trim());

// Same for normalize()/overwrite() on values
const config = z.record(z.string(), z.string().normalize());
const config = z.record(
  z.string(),
  z.string().overwrite((value) => value.trim()),
);
```

## When Not To Use It

This rule should always be enabled. Disabling it would reintroduce the risk of silent data loss.

If you genuinely need to normalize keys before use, consider normalizing them at a different layer of your code, not in the record schema itself.

## Further reading

- [Zod - Records](https://zod.dev/api?id=records)
- [Zod - Transforms](https://zod.dev/api?id=transform)
