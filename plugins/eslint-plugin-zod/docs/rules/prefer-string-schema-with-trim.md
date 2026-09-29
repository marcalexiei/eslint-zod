# zod/prefer-string-schema-with-trim

📝 Enforce `z.string().trim()` to prevent accidental leading/trailing whitespace.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

When defining string schemas,
it is very common to require the string not to have leading or trailing whitespaces.

Zod provides `.trim()` on `z.string()` to accomplish this.
Failing to trim strings from user inputs or other boundaries might lead to issues like spaces affecting validation or database storage.

This rule enforces adding `.trim()` to any `z.string()` schema to improve robustness.

## Rule Details

This rule reports an error when `z.string()` lacks `.trim()`.

It includes an auto-fixer, which adds a `.trim()` after the schema type declaration.

### ❌ Invalid

```ts
import * as z from 'zod';

const schema = z.string();
```

```ts
import * as z from 'zod';

const schema = z.string().min(1);
```

### ✅ Valid

```ts
import * as z from 'zod';

const schema = z.string().trim();
```

```ts
import * as z from 'zod';

const schema = z.string().trim().min(1);
```

## Further Reading

- [Zod - Strings](https://zod.dev/api#strings)
- [MDN - String.prototype.trim](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim)
