# zod-mini/no-function-scoped-schema

📝 Disallow constructing a Zod Mini schema inside a function body.

<!-- end auto-generated rule header -->

## Rule Details

This rule flags a zod/mini schema built inside a function body — as the function's return expression, or
as a declaration inside its block — instead of once at module scope. A schema nested inside another
function-scoped schema (e.g. the `z.string()` inside a `z.object({ ... })` that is itself flagged) is
reported once, at the outermost schema.

A schema that _must_ live in a function is not reported: the getter of a recursive object schema, and the
thunk passed to `z.lazy()`. What counts is where the schema they belong to is declared — either idiom
inside a function is still reported, once.

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
// A recursive schema's getter and a `z.lazy()` thunk are exempt: the schema they
// belong to is still declared once, at module scope.
const Category = z.object({
  name: z.string(),
  get subcategories() {
    return z.array(Category);
  },
});

const Node = z.lazy(() => z.object({ value: z.string() }));

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
