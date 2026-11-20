---
'eslint-plugin-zod-mini': minor
'@eslint-zod/utils': minor
---

feat(no-duplicate-schema-methods): report a repeated `trim`, `toLowerCase`, `toUpperCase`, `normalize` or `describe` check argument in zod/mini.
The message now reads `` `<name>()` is applied more than once in this schema chain``.
