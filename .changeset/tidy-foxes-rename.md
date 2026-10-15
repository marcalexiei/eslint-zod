---
'@eslint-zod/utils': patch
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'eslint-plugin-zod-core': patch
---

fix(consistent-import): the autofix no longer breaks code nor drops comments, and imports inside `declare module` blocks are checked on their own
