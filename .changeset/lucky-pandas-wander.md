---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
---

fix(no-duplicate-schema-methods): a type-changing method starts a new chain segment, so `z.string().min(1).array().min(1)` is no longer reported
