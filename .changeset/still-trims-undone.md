---
'eslint-plugin-zod': patch
---

fix(no-duplicate-schema-methods): report a repeated `trim`, `toLowerCase`, `toUpperCase`, `normalize` or `describe` call only while the earlier one is still in effect.
