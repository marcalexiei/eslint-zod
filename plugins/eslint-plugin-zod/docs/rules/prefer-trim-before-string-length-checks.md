# zod/prefer-trim-before-string-length-checks

📝 Enforce `.trim()` is called before string length checks to ensure accurate validation.

💼 This rule is enabled in the 🔒 `strict` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

When using `.trim()` with length constraints like `.min()`, `.max()`, or `.length()`, the order matters.

- `z.string().trim().min(1)` — trims first, then checks length → a string of spaces **fails** validation (correct behavior)
- `z.string().min(1).trim()` — checks length first, then trims → a string of spaces **passes** validation (likely unintended)

This rule enforces that `.trim()` always appears before any length checks to ensure the length is measured on the trimmed value.

## Rule Details

This rule reports an error when `.trim()` appears after `.min()`, `.max()`, or `.length()` in a `z.string()` chain.

It includes an auto-fixer that moves `.trim()` to immediately after `z.string()`.

### ❌ Invalid

```ts
import * as z from 'zod';

const schema = z.string().min(1).trim();
```

```ts
import * as z from 'zod';

const schema = z.string().length(5).trim();
```

```ts
import * as z from 'zod';

const schema = z.string().min(1).max(10).trim();
```

### ✅ Valid

```ts
import * as z from 'zod';

const schema = z.string().trim().min(1);
```

```ts
import * as z from 'zod';

const schema = z.string().trim().length(5);
```

```ts
import * as z from 'zod';

const schema = z.string().trim().min(1).max(10);
```

## Further Reading

- [Zod - Strings](https://zod.dev/api#strings)
- [MDN - String.prototype.trim](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim)
- [GitHub - Rule request issue](https://github.com/marcalexiei/eslint-zod/issues/253)
