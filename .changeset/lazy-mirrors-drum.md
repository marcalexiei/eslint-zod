---
'@eslint-zod/utils': minor
'eslint-plugin-zod': minor
'eslint-plugin-zod-mini': minor
---

feat: add `no-dynamic-schema-value` rule

Flags a non-static argument anywhere in schema expression:

- a function call result
- `new`
- `this`
- mutable variable

the criterion `zod-compiler` uses to decide what it can hoist.

Opt-in, not part of `recommended` config.
