---
'eslint-plugin-zod': patch
---

fix(prefer-trim-before-string-length-checks): withhold the fix when `.trim()` would move past a method that reads the value.
