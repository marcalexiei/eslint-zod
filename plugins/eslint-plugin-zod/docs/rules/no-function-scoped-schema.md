# zod/no-function-scoped-schema

📝 Disallow constructing a Zod schema inside a function body.

<!-- end auto-generated rule header -->

## Rule Details

This rule flags a zod schema built inside a function body — as the function's return expression, or as a
declaration inside its block — instead of once at module scope. A schema nested inside another
function-scoped schema (e.g. the `z.string()` inside a `z.object({ ... })` that is itself flagged) is
reported once, at the outermost schema.

## Why?

Under [`import 'zod/compile'`](https://zod.dev/compile), each schema instance is compiled lazily on its
first `parse` call, and the compiled function is cached on that instance. A schema built inside a function
is a new instance on every call, so it is rebuilt — and recompiled — every time, defeating the point of
`zod/compile`. Building the schema once at module scope means every call reuses the same compiled instance.

## Examples

### ❌ Invalid

```ts
const getSchema = () => z.string();

function validate(value) {
  const schema = z.string();
  return schema.parse(value);
}
```

### ✅ Valid

```ts
const schema = z.string();

function validate(value) {
  return schema.parse(value);
}
```

## When Not To Use It

If you don't use `import 'zod/compile'`, a per-call schema still has some construction overhead but no
recompilation cost — this rule may not be worth enabling.

## Further Reading

- [Zod - `zod/compile`](https://zod.dev/compile)
