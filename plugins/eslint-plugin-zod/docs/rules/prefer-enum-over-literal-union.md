# zod/prefer-enum-over-literal-union

📝 Prefer `z.enum()` over `z.union()` when all members are string literals.

💼 This rule is enabled in the 🎨 `stylistic` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule suggests replacing `z.union([...])` composed exclusively of `z.literal()` schemas with `z.enum([...])`.

When all members of a union are string literals, `z.enum()` is the more idiomatic, concise, and intention-revealing Zod construct.

## Why?

Using `z.enum()` instead of a union of literals:

1. Results in clearer and more expressive schemas
2. Reduces verbosity and repetition
3. Aligns with Zod best practices for enumerated values
4. Improves readability by making the intent explicit

From Zod’s perspective, a union of string literals and an enum often represent the same domain concept, but `z.enum()` communicates that intent more directly.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod';

z.union([z.literal('foo'), z.literal('bar')]);
```

```ts
import * as zod from 'zod';

zod.union([zod.literal('foo'), zod.literal('bar')]);
```

### ✅ Valid

```ts
import * as z from 'zod';

z.enum(['foo', 'bar']);
```

```ts
import * as z from 'zod';

// Non-literal members make enum invalid
z.union([z.literal('foo'), z.literal('bar'), z.int()]);
```

## Autofix Behavior

When all union members are `z.literal(<string>)` calls and the schema can be safely rewritten, this rule will automatically:

- Replace `.union(...)` with `.enum(...)`
- Extract and preserve the original literal values (including quote style)

Example fix:

```ts
// Before
z.union([z.literal('foo'), z.literal('bar')]);

// After
z.enum(['foo', 'bar']);
```

### Limitations

Autofix is **not applied** when:

- The union is referenced via named imports (e.g. `import { union, literal } from 'zod'`)

In these cases, the rule will still report but will not modify the code.

## When Not To Use It

You may want to disable this rule if:

- You intentionally use `z.union()` for stylistic consistency
- You rely on patterns where unions may later include non-literal members
- Your codebase prefers explicit `z.literal()` unions for clarity or tooling reasons

## Further Reading

- [eslint-plugin-zod - prefer-enum](https://github.com/gajus/eslint-plugin-zod?tab=readme-ov-file#prefer-enum)
- [Zod – Enums](https://zod.dev/api?id=enums)
- [Zod – Literals](https://zod.dev/api?id=literals)
