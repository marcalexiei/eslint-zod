---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'@eslint-zod/utils': patch
---

fix(consistent-schema-var-name): keep the suggested name camelCase when `before` ends in a letter, so `user` becomes `zUser` rather than `zuser`.
