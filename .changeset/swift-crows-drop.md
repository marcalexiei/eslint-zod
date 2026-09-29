---
'eslint-plugin-zod': major
'eslint-plugin-zod-mini': major
'eslint-plugin-zod-core': major
'@eslint-zod/utils': major
---

feat!: publish ESM only and require Node `^20.19 || ^22.12 || >=24`; CommonJS configs still load the package through `require()`, under `.default`.
