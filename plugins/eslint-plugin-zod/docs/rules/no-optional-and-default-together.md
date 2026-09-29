# zod/no-optional-and-default-together

📝 Disallow using both `.optional()` and `.default()` on the same Zod schema.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule reports when both `.optional()` and `.default()` are used on the same Zod schema.
Since having a default value implicitly makes a schema optional, using both methods is redundant.

## Options

<!-- begin auto-generated rule options list -->

| Name              | Description                                           | Type   | Choices                       |
| :---------------- | :---------------------------------------------------- | :----- | :---------------------------- |
| `preferredMethod` | Determines which method to keep when both are present | String | `none`, `default`, `optional` |

<!-- end auto-generated rule options list -->

### `preferredMethod: 'none'` (default)

Reports the error without providing an automatic fix.
This allows developers to manually decide how to resolve the issue.

### `preferredMethod: 'default'`

Reports the error and provides an automatic fix that removes `.optional()` and keeps `.default()`.

### `preferredMethod: 'optional'`

Reports the error and provides an automatic fix that removes `.default()` and keeps `.optional()`.

## Examples

### `preferredMethod: 'none'`

#### ✅ Valid

```ts
z.string().default('Hello World');

z.string().optional();

z.string();

z.string().trim().toLowerCase().default('hello');

z.string().trim().toLowerCase().optional();
```

#### ❌ Invalid

```ts
z.string().optional().default('Hello World');

z.string().default('Hello World').optional();

z.string().trim().optional().default('hello');

z.number().optional().default(42);
```

### `preferredMethod: 'default'`

#### ✅ Valid

```ts
z.string().default('Hello World');

z.string().optional();

z.string();
```

#### ❌ Invalid

```ts
// Automatically fixed to: z.string().default("Hello World")
z.string().optional().default('Hello World');

// Automatically fixed to: z.string().default("Hello World")
z.string().default('Hello World').optional();

// Automatically fixed to: z.string().trim().default("hello")
z.string().trim().optional().default('hello');

// Automatically fixed to: z.number().default(42)
z.number().optional().default(42);
```

### `preferredMethod: 'optional'`

#### ✅ Valid

```ts
z.string().default('Hello World');

z.string().optional();

z.string();
```

#### ❌ Invalid

```ts
// Automatically fixed to: z.string().optional()
z.string().optional().default('Hello World');

// Automatically fixed to: z.string().optional()
z.string().default('Hello World').optional();

// Automatically fixed to: z.string().trim().optional()
z.string().trim().default('hello').optional();

// Automatically fixed to: z.number().optional()
z.number().default(42).optional();
```

## Limitations

The rule deliberately ignores `z.exactOptional(schema).default(value)`.
The redundancy it reports is that `.default()` already makes a field optional, so `.optional()` adds nothing.
That argument does not carry over to `exactOptional`, which rejects an explicitly-passed `undefined` while allowing the key to be absent.
`.default()` accepts that `undefined` and substitutes the default, so the two are a real, if unusual, combination rather than a redundancy.

## When Not To Use It

If you have a specific use case that requires both `.optional()` and `.default()` in your schema, you may want to disable this rule.
However, this is generally not recommended as it creates redundant and potentially confusing code.

## Further Reading

- [Zod - Defaults](https://zod.dev/api?id=defaults)
- [Zod - Optionals](https://zod.dev/api?id=optionals)
