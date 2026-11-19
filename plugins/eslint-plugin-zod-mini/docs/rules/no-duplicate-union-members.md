# zod-mini/no-duplicate-union-members

📝 Disallow repeated members in `z.union()`, `z.discriminatedUnion()`, `z.enum()` and `z.literal()`.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

🔧💡 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) and manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

Reports a member listed twice in `z.union()`, `z.discriminatedUnion()`, `z.enum()` or `z.literal([...])`.
A repeat is almost always a copy-paste leftover hiding the member that was meant (`'draft'` twice where the second should be `'published'`),
and TypeScript collapses the repeat in the inferred type, so nothing else reports it.

Members are compared as written:

- `z.enum()` and `z.literal([...])` compare literal values, so `'a'` and `"a"` match and `1` and `1n` do not.
  An identifier or any other expression is never compared.
- `z.union()` and `z.discriminatedUnion()` compare the members token by token, ignoring whitespace, comments and trailing commas.
  `z.string()` matches `z.string()`, and `A` matches `A`.
  Members that accept the same values but are written differently (`z.literal('a')` and `z.enum(['a'])`) are not reported.

The rule skips a member list that is not an array literal, or that holds a spread or a hole.
Each repeat is reported, pointing to the line of the first occurrence.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

z.enum(['draft', 'published', 'draft']);
z.literal(['a', 'a']);
z.union([z.string(), z.number(), z.string()]);
z.discriminatedUnion('kind', [Circle, Square, Circle]);
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

z.enum(['draft', 'published', 'archived']);
z.literal(['a', 'b']);
z.union([z.string(), z.number()]);
z.discriminatedUnion('kind', [Circle, Square]);
```

## Autofix Behavior

Removing a repeat changes nothing that parses, but only `z.enum()` dedupes everything else too, so only `z.enum()` is autofixed.
The other factories get a suggestion:

- `z.literal([...])` keeps the repeat in its error message (`expected one of "a"|"a"`) and in its JSON Schema `enum`.
- `z.union()` tries every member, so its `invalid_union` issue has one `errors` entry per member, repeats included.
- `z.discriminatedUnion()` throws `Duplicate discriminator value` on its first parse.
  Removing the repeat makes the schema usable, which is a change of behavior.

Neither the fix nor the suggestion is offered when a comment sits between the repeat and the member before it, or when the repeat is parenthesized.

## Further Reading

- [Zod: unions](https://zod.dev/api?id=unions)
- [Zod: discriminated unions](https://zod.dev/api?id=discriminated-unions)
- [Zod: enums](https://zod.dev/api?id=enums)
- [Zod: literals](https://zod.dev/api?id=literals)
