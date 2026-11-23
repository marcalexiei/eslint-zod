---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'@eslint-zod/utils': patch
---

fix(no-unnecessary-readonly): offer a suggestion instead of an autofix, since removing `readonly` drops `readOnly` from generated JSON Schema.
