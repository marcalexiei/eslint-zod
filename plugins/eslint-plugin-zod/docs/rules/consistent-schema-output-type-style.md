# zod/consistent-schema-output-type-style

📝 Enforce consistent use of z.infer or z.output for schema type inference.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule details

In Zod v4, `z.infer<typeof Schema>` and `z.output<typeof Schema>` are functionally equivalent — both represent the output type of a schema. This rule enforces a single consistent style across the codebase.

`z.infer` exists primarily for Zod v3 compatibility, while `z.output` pairs naturally with `z.input` for explicit input/output distinction.

## Options

<!-- begin auto-generated rule options list -->

| Name    | Description                                          | Type   | Choices           |
| :------ | :--------------------------------------------------- | :----- | :---------------- |
| `style` | Decides which style to use for schema type inference | String | `infer`, `output` |

<!-- end auto-generated rule options list -->

## Examples

### `output` (default)

#### ✅ Valid

```ts
type SchemaType = z.output<typeof Schema>;
```

#### ❌ Invalid

```ts
type SchemaType = z.infer<typeof Schema>;
```

### `infer`

#### ✅ Valid

```ts
type SchemaType = z.infer<typeof Schema>;
```

#### ❌ Invalid

```ts
type SchemaType = z.output<typeof Schema>;
```

## Further Reading

- [Zod - type inference](https://zod.dev/metadata?id=referencing-inferred-types)
