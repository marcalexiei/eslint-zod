# zod-core/prefer-validate

📝 Prefer boolean validation when only the success of parsing is used.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

Prefer `core.validate()` when a `core.safeParse()` result is used only to read `success`.
This opt-in rule requires **Zod 4.6 or later** and is not enabled in the recommended configuration.

The rule recognizes direct success access, destructuring of only `success` (including aliases), and local result variables whose reads all access `success`.
It also handles awaited `core.safeParseAsync()` calls with `core.validateAsync()`.

`zod/v4/core` schemas carry no parsing methods, so only the standalone `core.safeParse(schema, data)` form is analyzed.

## Why?

Boolean validation avoids constructing a full parse result and can stop at the first validation failure.
Use parsing when you need the parsed data or error details.

## Examples

### ❌ Invalid

```ts
import * as core from 'zod/v4/core';

const ok = core.safeParse(Schema, data).success;
const { success: valid } = core.safeParse(Schema, data);
const result = await core.safeParseAsync(Schema, data);
if (result.success) {
  accept(data);
}
```

### ✅ Valid

```ts
import * as core from 'zod/v4/core';

const ok = core.validate(Schema, data);
const valid = core.validate(Schema, data);
const result = await core.validateAsync(Schema, data);
if (result) {
  accept(data);
}

// Keep safeParse when the result's data or error is needed.
const parsed = core.safeParse(Schema, data);
if (parsed.success) {
  accept(parsed.data);
}
```

## Suggestions

This rule offers editor suggestions; `eslint --fix` does not apply them.
Validation can short-circuit, so later refinements and their side effects may no longer execute.
Review this behavior before accepting a suggestion.

A suggestion rewrites the parse call and all success reads together, preserving argument evaluation and `await`.
Success-only destructuring becomes a boolean variable with the same local name.
Suggestions reuse an accessible validation import or namespace, or add a collision-free named import to the existing `zod/v4/core` import.
Suggestions are withheld when the edit would discard comments.

## Limitations

Analysis is local and does not require TypeScript type information.
Dynamic property names, optional chains, and unawaited promise chains are not analyzed.

Stored parse results are ignored when they escape, are exported, are reassigned, have an explicit type annotation, or are used beyond reading `success`.
Destructuring with defaults, rest properties, or additional properties is ignored.

## Conflict with `@typescript-eslint/no-unnecessary-condition`

`core.validate(schema, data)` is a type predicate (`data is core.input<Schema>`) while `core.safeParse().success` is a plain boolean.
With `checkTypePredicates` enabled, `@typescript-eslint/no-unnecessary-condition` reports the call whenever the value already has that type.
The schema still checks what TypeScript cannot express, so disable that line or leave `checkTypePredicates` off.

## When Not To Use It

Leave this rule disabled with Zod versions older than 4.6, or when all refinements must run even after validation fails.

## Further Reading

- [Zod 4.6: validate](https://zod.dev/blog/zod-4-6#validate)
- [Rule request #426](https://github.com/marcalexiei/eslint-zod/issues/426)
- [`@typescript-eslint/no-unnecessary-condition`](https://typescript-eslint.io/rules/no-unnecessary-condition/)
