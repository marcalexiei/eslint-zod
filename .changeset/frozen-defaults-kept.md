---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'@eslint-zod/utils': patch
---

fix(no-unnecessary-readonly): keep `readonly` on a date schema and around `default` or `catch`, where it still freezes the value.
