---
'eslint-plugin-zod': patch
---

fix(array-style): only rewrite `z.array()` calls the fix can preserve

The `style: "method"` fix now skips calls with extra arguments, type arguments, optional chaining, an element needing parentheses, or a comment it would drop.
A `z` that is shadowed or imported as a type is ignored.
