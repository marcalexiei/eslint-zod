# zod-core/no-duplicate-union-members

📝 Disallow repeated members in `core._union()`, `core._discriminatedUnion()`, `core._enum()` and `core._literal()`.

💼 This rule is enabled in the ✅ `recommended` config.

🔧💡 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) and manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

Reports a member listed twice in `core._union()`, `core._discriminatedUnion()`, `core._enum()` or `core._literal([...])`.
A repeat is almost always a copy-paste leftover hiding the member that was meant,
and TypeScript collapses the repeat in the inferred type, so nothing else reports it.

The member list is the argument after the schema class (and, for `core._discriminatedUnion()`, after the discriminator).
Members are compared as written:

- `core._enum()` and `core._literal([...])` compare literal values, so `'a'` and `"a"` match and `1` and `1n` do not.
  An identifier or any other expression is never compared.
- `core._union()` and `core._discriminatedUnion()` compare the members' syntax, ignoring whitespace and comments.

The rule skips a member list that is not an array literal, or that holds a spread or a hole.
Schemas built with `new` (`new core.$ZodUnion({ … })`) are not analyzed.

## Examples

### ❌ Invalid

```ts
import * as core from 'zod/v4/core';

core._enum(core.$ZodEnum, ['draft', 'published', 'draft']);
core._literal(core.$ZodLiteral, ['a', 'a']);
core._union(core.$ZodUnion, [StringSchema, NumberSchema, StringSchema]);
core._discriminatedUnion(core.$ZodDiscriminatedUnion, 'kind', [Circle, Square, Circle]);
```

### ✅ Valid

```ts
import * as core from 'zod/v4/core';

core._enum(core.$ZodEnum, ['draft', 'published', 'archived']);
core._literal(core.$ZodLiteral, ['a', 'b']);
core._union(core.$ZodUnion, [StringSchema, NumberSchema]);
core._discriminatedUnion(core.$ZodDiscriminatedUnion, 'kind', [Circle, Square]);
```

## Autofix Behavior

Removing a repeat changes nothing that parses, but only `core._enum()` dedupes everything else too, so only `core._enum()` is autofixed.
The other builders get a suggestion:

- `core._literal([...])` keeps the repeat in its error message and in its JSON Schema `enum`.
- `core._union()` tries every member, so its `invalid_union` issue has one `errors` entry per member, repeats included.
- `core._discriminatedUnion()` throws `Duplicate discriminator value` on its first parse.
  Removing the repeat makes the schema usable, which is a change of behavior.

Neither the fix nor the suggestion is offered when a comment sits between the repeat and the member before it, or when the repeat is parenthesized.

## Further Reading

- [Zod: `zod/v4/core`](https://zod.dev/packages/core)
- [Zod: unions](https://zod.dev/api?id=unions)
- [Zod: discriminated unions](https://zod.dev/api?id=discriminated-unions)
