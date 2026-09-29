# zod/no-coerce-boolean

📝 Disallow `z.coerce.boolean()` because it treats any non-empty string as `true`.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

`z.coerce.boolean()` coerces its input with the JavaScript `Boolean()` constructor.
`Boolean()` returns `true` for **any** non-empty string — including `"false"`, `"0"`, and `"no"`.

```ts
import * as z from 'zod';

const schema = z.object({
  isUrgent: z.coerce.boolean().optional(),
});

schema.parse({ isUrgent: 'false' });
// → { isUrgent: true } ❌ probably not what you wanted
```

This is a common source of bugs when parsing URL query parameters or form data,
where every value arrives as a string. This rule flags `z.coerce.boolean()` so the
intended truthiness is expressed explicitly.

Replacing `z.coerce.boolean()` is not a mechanical rename: the correct mapping from
string to boolean depends on which values you want to treat as `true`, so it cannot
be inferred reliably from the schema expression alone.

## Examples

### Invalid

```ts
import * as z from 'zod';

const schema = z.coerce.boolean();
const optionalSchema = z.coerce.boolean().optional();
```

```ts
import { coerce } from 'zod';

const schema = coerce.boolean();
```

### Valid

```ts
import * as z from 'zod';

// Use `z.stringbool()`, which maps `"true"`/`"false"` (and similar pairs) explicitly:
const schema = z.stringbool();

// Map known string values explicitly:
const transformSchema = z.string().transform((v) => v === 'true');

// Accept actual booleans too:
const flexibleSchema = z.union([z.boolean(), z.string().transform((v) => v === 'true')]);
```

## When Not To Use It

Disable this rule if you intentionally rely on `Boolean()` truthiness coercion and
understand that strings such as `"false"` resolve to `true`.

## Further Reading

- [Zod - coercion](https://zod.dev/api#coercion)
- [Zod – `z.stringbool()`](https://zod.dev/api#stringbool)
- [MDN - `Boolean()` coercion](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)
