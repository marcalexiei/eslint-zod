---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'@eslint-zod/utils': patch
---

fix(no-unnecessary-readonly): keep a `readonly` around `default` or `catch`, whose value skips any inner `readonly`.
