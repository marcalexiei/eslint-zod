---
'@eslint-zod/utils': patch
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'eslint-plugin-zod-core': patch
---

fix(consistent-import): the autofix no longer writes `z.y.string()` when Zod is imported twice as a whole module
