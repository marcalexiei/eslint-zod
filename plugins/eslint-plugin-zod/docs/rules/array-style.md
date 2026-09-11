# zod/array-style

📝 Enforce consistent Zod array style.

💼 This rule is enabled in the ✅ `recommended` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule details

This rule enforces a single, consistent style for defining Zod arrays: either the function style (`z.array(schema)`) or the method style (`schema.array()`).

It helps keep schemas uniform across a codebase, improves readability, and makes automated formatting/fixing predictable.

## Why?

- **Consistency**: reduces cognitive load when reading schemas.
- **Predictability**: codebase-wide conventions make reviews and diffs clearer.
- **Tooling**: the rule is automatically fixable, allowing batch or editor-driven fixes.

## Options

<!-- begin auto-generated rule options list -->

| Name    | Description                                | Type   | Choices              |
| :------ | :----------------------------------------- | :----- | :------------------- |
| `style` | Decides which style for zod array function | String | `function`, `method` |

<!-- end auto-generated rule options list -->

You can choose between:

- **Function style**: `z.array(...)`
- **Method style**: `.array()`

`function` is used as default to maintain consistency with TypeScript’s `Array` generic syntax.

## Examples

### `function`

#### ✅ Valid

```ts
z.array(z.string());
```

#### ❌ Invalid

```ts
z.string().array();

z.string().trim().array();
```

### `method`

#### ✅ Valid

```ts
z.string().array(); // method
```

#### ❌ Invalid

```ts
z.array(z.string());

z.array(z.string().trim());
```

## Autofix Behavior

With `style: "method"` the fix moves the element schema out of the call:

```ts
// Before
z.array(z.string()).optional();
// After
z.string().array().optional();
```

The rule reports without fixing when the call:

- takes extra arguments: `z.array(z.string(), { error: 'Expected a list' })`
- has explicit type arguments: `z.array<z.ZodType<string>>(z.literal('x'))`
- uses optional chaining: `z?.array(z.string())`, `z.array(schemas?.element)`
- has an element that is not an identifier, member access or call: `z.array(flag ? z.string() : z.number())`
- has a comment outside the element schema: `z./* keep this */array(z.string())`

Calls whose `z` is shadowed by a local binding or imported only as a type are ignored.

## Further Reading

- [Array Types in TypeScript](https://tkdodo.eu/blog/array-types-in-type-script)
