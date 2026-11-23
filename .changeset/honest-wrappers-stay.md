---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'@eslint-zod/utils': patch
---

fix: withhold autofixes when later code depends on the replaced schema or the fix would restore dropped metadata.
