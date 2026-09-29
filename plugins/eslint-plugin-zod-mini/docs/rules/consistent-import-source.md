# zod-mini/consistent-import-source

📝 Enforce consistent source from Zod Mini imports.

💼 This rule is enabled in the 🎨 `stylistic` config.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces consistent import sources for Zod Mini across your project.

The rule only applies to imports within the `zod/mini` scope: `'zod/mini'` and `'zod/v4-mini'`.
Imports from `zod`, `zod/v4`, or `zod/v3` are out of scope and are never flagged — use [`zod/consistent-import-source`](../../eslint-plugin-zod/docs/rules/consistent-import-source.md) for those.

---

This rule is disabled by default since equivalent behavior can be enforced by other, more specialized rules.

- <https://eslint.org/docs/latest/rules/no-restricted-imports>
- <https://typescript-eslint.io/rules/no-restricted-imports>

## Options

<!-- begin auto-generated rule options list -->

| Name      | Description                             | Type     |
| :-------- | :-------------------------------------- | :------- |
| `sources` | An array of allowed Zod import sources. | String[] |

<!-- end auto-generated rule options list -->

## Examples

### ❌ Invalid

```ts
// When sources is set to ['zod/mini'] (default)
import z from 'zod/v4-mini';

// When sources is set to ['zod/v4-mini']
import z from 'zod/mini';
```

### ✅ Valid

```ts
// Default configuration (sources: ['zod/mini'])
import z from 'zod/mini';

// With sources: ['zod/v4-mini']
import z from 'zod/v4-mini';

// Non-mini zod imports are out of scope and are never flagged
import z from 'zod';
```

## Configuration Examples

### Default Configuration

```json
{
  "rules": {
    "zod-mini/consistent-import-source": "error"
  }
}
```

This will only allow imports from `'zod/mini'`.

### Specific Version Configuration

```json
{
  "rules": {
    "zod-mini/consistent-import-source": [
      "error",
      {
        "sources": ["zod/v4-mini"]
      }
    ]
  }
}
```

This will only allow imports from `'zod/v4-mini'`.

## When Not To Use It

If you need to:

- Use multiple versions of Zod Mini in the same project for compatibility reasons
- Gradually migrate from one version to another
- You are using other rules to achieve this behavior:
  - <https://eslint.org/docs/latest/rules/no-restricted-imports>
  - <https://typescript-eslint.io/rules/no-restricted-imports>
