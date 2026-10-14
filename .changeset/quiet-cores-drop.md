---
'eslint-plugin-zod-core': patch
'@eslint-zod/utils': patch
---

fix(consistent-import): drop the `named` syntax from `eslint-plugin-zod-core`, whose fix imported a `z` that `zod/v4/core` does not export
