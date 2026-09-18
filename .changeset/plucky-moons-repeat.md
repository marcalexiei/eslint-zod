---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'@eslint-zod/utils': minor
---

fix: stop `consistent-schema-var-name` and `no-dynamic-schema-value` reporting top-level helpers such as `z.toJSONSchema()` and `z.prettifyError()`
