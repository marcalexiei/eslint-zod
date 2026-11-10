---
'eslint-plugin-zod': minor
'eslint-plugin-zod-mini': minor
'@eslint-zod/utils': minor
---

feat: follow `let` and `var` bindings that are never reassigned, as `const` bindings already are

Rules that read a schema or value through a variable now report the same code whichever keyword declares it.
