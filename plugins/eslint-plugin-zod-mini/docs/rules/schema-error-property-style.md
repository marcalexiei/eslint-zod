# zod-mini/schema-error-property-style

📝 Enforce consistent style for error messages in Zod Mini schema validation (using ESQuery patterns).

💼 This rule is enabled in the 🎨 `stylistic` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces how error messages should be formatted in Zod Mini schema validation using `z.refine()` and `z.custom()` methods.

In Zod Mini, `z.refine()` is a standalone `$ZodCheck` function passed to `.check()`, not a chained method.

## Options

<!-- begin auto-generated rule options list -->

| Name       | Description                                                   | Type   |
| :--------- | :------------------------------------------------------------ | :----- |
| `example`  | Example code to help the user understand the required pattern | String |
| `selector` | An ESQuery string to match the required pattern               | String |

<!-- end auto-generated rule options list -->

### Default Options

```json
{
  "selector": "Literal,TemplateLiteral",
  "example": "'error message'"
}
```

### Custom Configuration Example

```json
{
  "rules": {
    "zod-mini/schema-error-property-style": [
      "error",
      {
        "selector": "Literal",
        "example": "'static error message'"
      }
    ]
  }
}
```

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

// Default configuration
z.custom(() => true, { error: () => 'my error' });
z.custom(() => true, { error: getError() });
z.string().check(z.refine(() => true, { error: () => 'my error' }));

// Custom configuration with selector "Literal"
z.custom(() => true, { error: `template string` });
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

// Default configuration (Literal or TemplateLiteral)
z.custom(() => true, { error: 'my error' });
z.custom(() => true, `my error`);
z.string().check(z.refine(() => true, { error: 'my error' }));
z.string().check(z.refine(() => true, `my error`));

// Custom configuration with selector "Literal"
z.custom(() => true, { error: 'my error' });
```

## Further Reading

- [ESQuery - Syntax Documentation](https://github.com/estools/esquery)
