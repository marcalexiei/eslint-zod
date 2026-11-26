---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'@eslint-zod/utils': patch
---

fix: stop reporting a repeat when a value rewrite or a variable passed to `meta()` may have undone the earlier call.
