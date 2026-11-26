---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'@eslint-zod/utils': patch
---

fix(no-conflicting-checks): compare the checks before a type-changing method, reporting that they conflict rather than that the schema can never match.
