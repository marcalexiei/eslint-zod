---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'@eslint-zod/utils': patch
---

fix(no-duplicate-schema-methods): stop reporting repeats that still affect the result, such as a validator after a rewrite or a second `brand()`.
