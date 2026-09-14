# zod-mini/prefer-validate

📝 Prefer boolean validation when only the success of parsing is used.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

Prefer `validate()` when a `safeParse()` result is used only to read `success`.
This opt-in rule requires **Zod 4.6 or later** and is not enabled in the recommended configuration.

The rule recognizes direct success access, destructuring of only `success` (including aliases), and local result variables whose reads all access `success`.
It also handles awaited `safeParseAsync()` calls with `validateAsync()`.
Both schema methods and standalone namespace or named-import parsing functions are supported.

## Why?

Boolean validation avoids constructing a full parse result and can stop at the first validation failure.
Use parsing when you need the parsed data or error details.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

const schema = z.string();
const ok = schema.safeParse(data).success;
const { success: valid } = schema.safeParse(data);
const result = await schema.safeParseAsync(data);
if (result.success) {
  accept(data);
}
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

const schema = z.string();
const ok = z.validate(schema, data);
const valid = z.validate(schema, data);
const result = await z.validateAsync(schema, data);
if (result) {
  accept(data);
}

// Keep safeParse when the result's data or error is needed.
const parsed = schema.safeParse(data);
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
Mini uses standalone `z.validate(schema, data)` and `z.validateAsync(schema, data)` calls.
Standalone calls retain their style; suggestions reuse an accessible validation import or namespace, or insert a collision-free named import from the same module.
Suggestions are withheld when the edit would discard comments.

## Limitations

Analysis is local and does not require TypeScript type information.
Schema methods are recognized on inline Zod schemas and immutable local schema bindings or aliases.
Imported schemas, parameter schemas, reassigned bindings, dynamic property names, optional chains, and unawaited promise chains are not analyzed.

Stored parse results are ignored when they escape, are exported, are reassigned, have an explicit type annotation, or are used beyond reading `success`.
Destructuring with defaults, rest properties, or additional properties is ignored.
Explicit `zod/v3` imports are ignored; the installed Zod version is not detected automatically.

## When Not To Use It

Leave this rule disabled with Zod versions older than 4.6, or when all refinements must run even after validation fails.

## Further Reading

- [Zod 4.6: validate](https://zod.dev/blog/zod-4-6#validate)
- [Rule request #426](https://github.com/marcalexiei/eslint-zod/issues/426)
