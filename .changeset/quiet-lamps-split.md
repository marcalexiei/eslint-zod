---
'eslint-plugin-zod': major
---

feat!: split configs into `recommended`, `strict`, `stylistic` and `all`.

#### Migration guide

`recommended` now holds only rules that catch bugs or deprecated APIs.
Nine rules left it:

- to `stylistic`: `array-style`, `prefer-enum-over-literal-union`, `prefer-loose-object`, `prefer-meta`, `prefer-meta-last`, `prefer-nullish`, `prefer-strict-object`, `prefer-string-schema-with-trim`
- to `strict`: `prefer-trim-before-string-length-checks`

Two rules joined it: `no-conflicting-checks` and `no-transform-in-record-key`.

To keep every rule you had, add `stylistic` and switch to `strict`:

```diff
 export default defineConfig(
-  eslintPluginZod.configs.recommended,
+  eslintPluginZod.configs.strict,
+  eslintPluginZod.configs.stylistic,
 );
```

Both configs also enable rules that were in no config before.
To avoid them, stay on `recommended` and re-enable the rules you want one by one:

```js
{
  rules: {
    'zod/array-style': 'error',
    'zod/prefer-trim-before-string-length-checks': 'error',
  },
}
```

In Oxlint, spread each config's `rules` the same way.
