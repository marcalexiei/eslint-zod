---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'@eslint-zod/utils': patch
---

fix: stop treating methods called on a parsed value as schema checks in `no-duplicate-schema-methods` and `no-conflicting-checks`.
