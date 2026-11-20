---
'eslint-plugin-zod': patch
---

fix(no-duplicate-schema-methods): skip a repeated `trim`, `toLowerCase`, `toUpperCase` or `normalize` that a method in between may undo.
