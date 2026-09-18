---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'@eslint-zod/utils': minor
---

fix(no-function-scoped-schema): stop reporting top-level helpers that consume a schema, such as `z.toJSONSchema()` and `z.prettifyError()`
