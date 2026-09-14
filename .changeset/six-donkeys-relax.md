---
'@eslint-zod/utils': minor
'eslint-plugin-zod': minor
'eslint-plugin-zod-mini': minor
---

feat: add `no-function-scoped-schema` rule

Flags a schema built inside a function body instead of once at module scope.
When using `import 'zod/compile'` a per-call schema is rebuilt and recompiled on every call.

Opt-in, not part of `recommended` config.
