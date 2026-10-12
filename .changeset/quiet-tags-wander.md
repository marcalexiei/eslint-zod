---
'eslint-plugin-zod': patch
'eslint-plugin-zod-mini': patch
'@eslint-zod/utils': patch
---

fix(consistent-schema-var-name): ignore a parse result whose chain continues after a property access, such as `.parse(input).tags.map(fn)`.
