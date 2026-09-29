---
'eslint-plugin-zod-mini': major
---

feat!: split configs into `recommended`, `strict`, `stylistic` and `all`.

#### Migration guide

`recommended` now holds only rules that catch bugs or deprecated APIs.
Three rules left it for `stylistic`: `prefer-enum-over-literal-union`, `prefer-meta` and `prefer-nullish`.

Two rules joined it: `no-conflicting-checks` and `no-transform-in-record-key`.

To keep every rule you had, add `stylistic`:

```diff
 export default defineConfig(
   eslintPluginZodMini.configs.recommended,
+  eslintPluginZodMini.configs.stylistic,
 );
```

`stylistic` also enables rules that were in no config before.
To avoid them, re-enable only the three rules instead:

```js
{
  rules: {
    'zod-mini/prefer-enum-over-literal-union': 'error',
    'zod-mini/prefer-meta': 'error',
    'zod-mini/prefer-nullish': 'error',
  },
}
```

In Oxlint, spread each config's `rules` the same way.
