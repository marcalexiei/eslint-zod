# eslint-plugin-zod-core

## 2.1.3

### Patch Changes

- Updated dependencies [[`2f4f585`](https://github.com/marcalexiei/eslint-zod/commit/2f4f585fc7c49b1e32ef68ab04c10dca6c250226), [`9a6810b`](https://github.com/marcalexiei/eslint-zod/commit/9a6810b9ef5686f0082d208687cd917a97383284), [`ae6d0ac`](https://github.com/marcalexiei/eslint-zod/commit/ae6d0acb0e59817fa367e632f93f1ee2c064b785)]:
  - @eslint-zod/utils@6.4.0

## 2.1.2

### Patch Changes

- Updated dependencies [[`d5f877f`](https://github.com/marcalexiei/eslint-zod/commit/d5f877fa11f06d90730480c0758158fcb5bb6b0f), [`2908981`](https://github.com/marcalexiei/eslint-zod/commit/2908981415f34086cb84c2921c74012b7e2a789a), [`13234f6`](https://github.com/marcalexiei/eslint-zod/commit/13234f62c7aad1ccaafffe83b7cd92ea6ffb18db)]:
  - @eslint-zod/utils@6.3.0

## 2.1.1

### Patch Changes

- [#566](https://github.com/marcalexiei/eslint-zod/pull/566) [`020a144`](https://github.com/marcalexiei/eslint-zod/commit/020a144e135ed51dae52edc3074963c518a1082f) - fix(consistent-import): the autofix no longer breaks code nor drops comments, and imports inside `declare module` blocks are checked on their own
- Updated dependencies [[`020a144`](https://github.com/marcalexiei/eslint-zod/commit/020a144e135ed51dae52edc3074963c518a1082f), [`020a144`](https://github.com/marcalexiei/eslint-zod/commit/020a144e135ed51dae52edc3074963c518a1082f)]:
  - @eslint-zod/utils@6.2.0

## 2.1.0

**`eslint` is no longer needed to use this plugin.**
It loads without `eslint` ([#539](https://github.com/marcalexiei/eslint-zod/pull/539)), and it no longer depends on `@typescript-eslint/utils` ([#560](https://github.com/marcalexiei/eslint-zod/pull/560)), whose required `eslint` and `typescript` peers were installed along with it.
With oxlint, nothing from ESLint has to be installed.

### Minor Changes

- [#500](https://github.com/marcalexiei/eslint-zod/pull/500) [`5adf57a`](https://github.com/marcalexiei/eslint-zod/commit/5adf57aaf6dc3cdfd033d1e5ea1529e2a987ab6e) - fix: lint `.mts` and `.cts` files, and register the exported plugin in each config so it can be re-registered.

### Patch Changes

- [#539](https://github.com/marcalexiei/eslint-zod/pull/539) [`6f4051c`](https://github.com/marcalexiei/eslint-zod/commit/6f4051c49b21bc81e8f68e288fdeab001472df0e) - fix: load without `eslint` installed

- [#536](https://github.com/marcalexiei/eslint-zod/pull/536) [`db50ed6`](https://github.com/marcalexiei/eslint-zod/commit/db50ed6a00cf7d121ac65258d54059108760b312) - fix: apply the shared configs to `.mts` and `.cts` files

- [#559](https://github.com/marcalexiei/eslint-zod/pull/559) [`0adfa55`](https://github.com/marcalexiei/eslint-zod/commit/0adfa55e87a33f75668f30d06770cadd561eebd3) - fix(consistent-import): drop the `named` syntax from `eslint-plugin-zod-core`, whose fix imported a `z` that `zod/v4/core` does not export

- [#560](https://github.com/marcalexiei/eslint-zod/pull/560) [`5f3da15`](https://github.com/marcalexiei/eslint-zod/commit/5f3da15bee748aee01a819c13960c61a8be1e9f3) - refactor: drop the `@typescript-eslint/utils` dependency, and with it its required `eslint` and `typescript` peers

- [#538](https://github.com/marcalexiei/eslint-zod/pull/538) [`8ee7aa6`](https://github.com/marcalexiei/eslint-zod/commit/8ee7aa6921952a5ba691feb4ff4321fda71d9091) - fix: keep `tsc -b` output out of the published packages
- Updated dependencies [[`52e42d5`](https://github.com/marcalexiei/eslint-zod/commit/52e42d537c964cc75da11d8e9839400a9ad18b0c), [`9f0c4f2`](https://github.com/marcalexiei/eslint-zod/commit/9f0c4f23a8573c3cde985322d09967290bd1a2d5), [`d479242`](https://github.com/marcalexiei/eslint-zod/commit/d4792420d74fc0392190d07e70bd7343d14c5031), [`1fd9cc4`](https://github.com/marcalexiei/eslint-zod/commit/1fd9cc430954a533b7d4e9344408e71ffb342db9), [`8f5efaf`](https://github.com/marcalexiei/eslint-zod/commit/8f5efaf10851c956bf9cbd3d13f20f5dbbe5674b), [`16c7cc6`](https://github.com/marcalexiei/eslint-zod/commit/16c7cc62ddadfae82cfb9e5a3885fdff269e9a1b), [`1e998a1`](https://github.com/marcalexiei/eslint-zod/commit/1e998a1620a122f9bcacb8d9a01d86a1d0a403e4), [`e283a27`](https://github.com/marcalexiei/eslint-zod/commit/e283a27474e0c754dfadf2b1fe503a4a811dee43), [`6f4051c`](https://github.com/marcalexiei/eslint-zod/commit/6f4051c49b21bc81e8f68e288fdeab001472df0e), [`3f2542d`](https://github.com/marcalexiei/eslint-zod/commit/3f2542d4f8cf99b68f8ede1c96c82a1f497be9cb), [`9cbc143`](https://github.com/marcalexiei/eslint-zod/commit/9cbc14386727a2c72815033f5fa1470794592c0e), [`551b0f4`](https://github.com/marcalexiei/eslint-zod/commit/551b0f486f55b2ac1a3faac0176daa1cd329b601), [`e4017fd`](https://github.com/marcalexiei/eslint-zod/commit/e4017fd6da3d54333d50fa04385f384d1829d9f6), [`9fe66d9`](https://github.com/marcalexiei/eslint-zod/commit/9fe66d9a31b78b51edea2afa468f3d3e75cf6115), [`4667778`](https://github.com/marcalexiei/eslint-zod/commit/4667778005cf1d3ea928a5344a1754841055a480), [`e9b2bad`](https://github.com/marcalexiei/eslint-zod/commit/e9b2bad05274bcea4583c69f13d21ed0836f1061), [`a6ccfa1`](https://github.com/marcalexiei/eslint-zod/commit/a6ccfa111abcc411fa2facd48d4bcb04396646e5), [`1d9095b`](https://github.com/marcalexiei/eslint-zod/commit/1d9095ba8f8e55c3f833a4dcd0f6947913b6c6f9), [`67ce5a3`](https://github.com/marcalexiei/eslint-zod/commit/67ce5a3c0ee1daf9a02901e65d41b71e438adfa6), [`ff227b1`](https://github.com/marcalexiei/eslint-zod/commit/ff227b105a0174903d3e394476799527b6984c7c), [`b9c6460`](https://github.com/marcalexiei/eslint-zod/commit/b9c6460cf55fa1b8ad5dd0192d4fbc924a70004e), [`9e5ad45`](https://github.com/marcalexiei/eslint-zod/commit/9e5ad4566698cd31c63285b53080949edfbb7484), [`69844b9`](https://github.com/marcalexiei/eslint-zod/commit/69844b9951c4c96a3f24e37474f0bd9759e479e6), [`0adfa55`](https://github.com/marcalexiei/eslint-zod/commit/0adfa55e87a33f75668f30d06770cadd561eebd3), [`5752bec`](https://github.com/marcalexiei/eslint-zod/commit/5752bec65ee66a075ca354174122818338f579bf), [`bc110d2`](https://github.com/marcalexiei/eslint-zod/commit/bc110d2d3379a76eef3324637adf3e91cf283581), [`20381b0`](https://github.com/marcalexiei/eslint-zod/commit/20381b078c52c2e2e12aca4f5f6d937f0a10892b), [`316715e`](https://github.com/marcalexiei/eslint-zod/commit/316715ed8948249eb2252df7eb5cc5342de96c21), [`59b045e`](https://github.com/marcalexiei/eslint-zod/commit/59b045ec458817f6f6f1789fc1ed9f6bf0e766ad), [`97169bc`](https://github.com/marcalexiei/eslint-zod/commit/97169bc0c5b8d4f0121fdad13cb9ba11da75ff83), [`bbdfcf6`](https://github.com/marcalexiei/eslint-zod/commit/bbdfcf6c6f80aac6b353d3a2c6b6763cd9ea0446), [`a13491d`](https://github.com/marcalexiei/eslint-zod/commit/a13491d8b901b6a048b6e0f2de27df4cff7edf1b), [`b81695b`](https://github.com/marcalexiei/eslint-zod/commit/b81695bda77af47eb723085d00739c7d045c8665), [`5d0b05c`](https://github.com/marcalexiei/eslint-zod/commit/5d0b05cf27f40eabc73564ed636f9229e81086fb), [`32006a3`](https://github.com/marcalexiei/eslint-zod/commit/32006a3843e533a2a1481f863fd47d84f438fcb0), [`0798a2b`](https://github.com/marcalexiei/eslint-zod/commit/0798a2bcc12b7b564558224dd7908b156c2984f4), [`5f3da15`](https://github.com/marcalexiei/eslint-zod/commit/5f3da15bee748aee01a819c13960c61a8be1e9f3), [`d353312`](https://github.com/marcalexiei/eslint-zod/commit/d3533124db19064d8718f9efd2b8dfec10248288), [`8ee7aa6`](https://github.com/marcalexiei/eslint-zod/commit/8ee7aa6921952a5ba691feb4ff4321fda71d9091)]:
  - @eslint-zod/utils@6.1.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`43ad93e`](https://github.com/marcalexiei/eslint-zod/commit/43ad93e42d642e9f133d1bb1c81b833693f4516a), [`1a9ab36`](https://github.com/marcalexiei/eslint-zod/commit/1a9ab36f4885a064ac74ee1fc8f132a33c06d251)]:
  - @eslint-zod/utils@6.0.1

## 2.0.0

### Major Changes

- [#475](https://github.com/marcalexiei/eslint-zod/pull/475) [`c227d7a`](https://github.com/marcalexiei/eslint-zod/commit/c227d7a8e82d9e8357ee20d3a0e7fc5188ca4919) - feat!: publish ESM only and require Node `^20.19 || ^22.12 || >=24`; CommonJS configs still load the package through `require()`, under `.default`.

### Patch Changes

- Updated dependencies [[`c227d7a`](https://github.com/marcalexiei/eslint-zod/commit/c227d7a8e82d9e8357ee20d3a0e7fc5188ca4919)]:
  - @eslint-zod/utils@6.0.0

## 1.1.4

### Patch Changes

- Updated dependencies [[`acb0e63`](https://github.com/marcalexiei/eslint-zod/commit/acb0e63282d938d8bbdae4d1ace132aaaed71afa)]:
  - @eslint-zod/utils@5.3.0

## 1.1.3

### Patch Changes

- Updated dependencies [[`56c6ee4`](https://github.com/marcalexiei/eslint-zod/commit/56c6ee40461d10f67dbbed70fc2fab3aff253cc0), [`a034823`](https://github.com/marcalexiei/eslint-zod/commit/a034823741eb5a5422e67c726574c276fa925da6)]:
  - @eslint-zod/utils@5.2.0

## 1.1.2

### Patch Changes

- Updated dependencies [[`e10c9a7`](https://github.com/marcalexiei/eslint-zod/commit/e10c9a76a50e07334d851205a8ce7e2032a7ec33)]:
  - @eslint-zod/utils@5.1.0

## 1.1.1

### Patch Changes

- Updated dependencies [[`703ed5e`](https://github.com/marcalexiei/eslint-zod/commit/703ed5e0442ef017080b3987b00253eafc7d8685)]:
  - @eslint-zod/utils@5.0.1

## 1.1.0

### Minor Changes

- [#435](https://github.com/marcalexiei/eslint-zod/pull/435) [`12eca40`](https://github.com/marcalexiei/eslint-zod/commit/12eca408edbf6794aa6aca32886e7b7361b201be) - feat: add `prefer-validate` with suggestions for success-only synchronous and asynchronous parsing

### Patch Changes

- Updated dependencies [[`3124361`](https://github.com/marcalexiei/eslint-zod/commit/3124361d363d4f1ac95985c5b4f1840311a22d66), [`62608ad`](https://github.com/marcalexiei/eslint-zod/commit/62608ad20e6ac8084702af171c4cab34ab1672f4), [`12eca40`](https://github.com/marcalexiei/eslint-zod/commit/12eca408edbf6794aa6aca32886e7b7361b201be), [`3124361`](https://github.com/marcalexiei/eslint-zod/commit/3124361d363d4f1ac95985c5b4f1840311a22d66)]:
  - @eslint-zod/utils@5.0.0

## 1.0.14

### Patch Changes

- Updated dependencies [[`940c4fd`](https://github.com/marcalexiei/eslint-zod/commit/940c4fdd5316daf654bdcd9d07bea0da86f398d8)]:
  - @eslint-zod/utils@4.0.0

## 1.0.13

### Patch Changes

- Updated dependencies [[`f9c7171`](https://github.com/marcalexiei/eslint-zod/commit/f9c7171b0ff1d727ac64b621b181cc369f738c02), [`f9c7171`](https://github.com/marcalexiei/eslint-zod/commit/f9c7171b0ff1d727ac64b621b181cc369f738c02)]:
  - @eslint-zod/utils@3.3.0

## 1.0.12

### Patch Changes

- Updated dependencies [[`3084477`](https://github.com/marcalexiei/eslint-zod/commit/30844770e85f0e2c03e851363a2c34576fd18728)]:
  - @eslint-zod/utils@3.2.0

## 1.0.11

### Patch Changes

- [#404](https://github.com/marcalexiei/eslint-zod/pull/404) [`cb7b394`](https://github.com/marcalexiei/eslint-zod/commit/cb7b3948e769dc78ea99669e44f0e3a463bc5c18) - chore: migrate to `changesets` v3

  Changelog entries no longer carry a `Thanks @…!` attribution; the pull request and commit links are unchanged.

- Updated dependencies [[`6929124`](https://github.com/marcalexiei/eslint-zod/commit/6929124167701b011f021a51d6e6d0cac3601c06), [`5dae17b`](https://github.com/marcalexiei/eslint-zod/commit/5dae17b12d64a49f12c9ebc9b1b7ec3f9fef1370), [`cb7b394`](https://github.com/marcalexiei/eslint-zod/commit/cb7b3948e769dc78ea99669e44f0e3a463bc5c18)]:
  - @eslint-zod/utils@3.1.0

## 1.0.10

### Patch Changes

- [#376](https://github.com/marcalexiei/eslint-zod/pull/376) [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `consistent-import` alias collision between two zod sources

  Every rewritten import group received the alias `z`, so a file importing from two sources was fixed into two `import * as z` declarations.
  Each group now gets a distinct alias.

- Updated dependencies [[`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`fb49a63`](https://github.com/marcalexiei/eslint-zod/commit/fb49a639c3bee68268861b6c44ea9626c0cac6c6), [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd), [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd), [`fb49a63`](https://github.com/marcalexiei/eslint-zod/commit/fb49a639c3bee68268861b6c44ea9626c0cac6c6), [`4d8edae`](https://github.com/marcalexiei/eslint-zod/commit/4d8edae60e525cd1816f87600d1f825b3146fa35)]:
  - @eslint-zod/utils@3.0.0

## 1.0.9

### Patch Changes

- Updated dependencies [[`6bbcdf0`](https://github.com/marcalexiei/eslint-zod/commit/6bbcdf06cb37a151e36af25146297c24897846d0)]:
  - @eslint-zod/utils@2.5.0

## 1.0.8

### Patch Changes

- Updated dependencies [[`0913e38`](https://github.com/marcalexiei/eslint-zod/commit/0913e3886976ed138f6a060cead6297be14e8e8d), [`5547b24`](https://github.com/marcalexiei/eslint-zod/commit/5547b24ef00a084a8aa943b6c57fd7d0cacbf8d3), [`dc8e969`](https://github.com/marcalexiei/eslint-zod/commit/dc8e9696f37cf00404bd78b5d38c6268009b9c1b), [`250e526`](https://github.com/marcalexiei/eslint-zod/commit/250e526df7c0870b9f7a98177fc0d9e8e0b78278)]:
  - @eslint-zod/utils@2.4.0

## 1.0.7

### Patch Changes

- Updated dependencies [[`de44e4c`](https://github.com/marcalexiei/eslint-zod/commit/de44e4cefcc64d8aae394081d777a90d3f4f283d)]:
  - @eslint-zod/utils@2.3.0

## 1.0.6

### Patch Changes

- Updated dependencies [[`d183319`](https://github.com/marcalexiei/eslint-zod/commit/d1833192088a28d9db1595d6bc90d02c29cb1ba5)]:
  - @eslint-zod/utils@2.2.0

## 1.0.5

### Patch Changes

- [#327](https://github.com/marcalexiei/eslint-zod/pull/327) [`a10f137`](https://github.com/marcalexiei/eslint-zod/commit/a10f137ffcd03f6e04f6c88e53124836e0375cb6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - chore: use GitHub env for OIDC publishing

- Updated dependencies [[`a10f137`](https://github.com/marcalexiei/eslint-zod/commit/a10f137ffcd03f6e04f6c88e53124836e0375cb6)]:
  - @eslint-zod/utils@2.1.2

## 1.0.4

### Patch Changes

- Updated dependencies [[`6faef20`](https://github.com/marcalexiei/eslint-zod/commit/6faef206f23c703bc2a06d8378f04fe660268a07)]:
  - @eslint-zod/utils@2.1.1

## 1.0.3

### Patch Changes

- Updated dependencies [[`b084557`](https://github.com/marcalexiei/eslint-zod/commit/b08455769d81682e32feae0cc3306e62d5b3c549), [`0544a19`](https://github.com/marcalexiei/eslint-zod/commit/0544a197af5859b8a48615e49ff09bf6bcaaf884)]:
  - @eslint-zod/utils@2.1.0

## 1.0.2

### Patch Changes

- [#315](https://github.com/marcalexiei/eslint-zod/pull/315) [`a89b181`](https://github.com/marcalexiei/eslint-zod/commit/a89b1815b75ec735abf96dd1f5ebdada1487ee35) Thanks [@nimaebra](https://github.com/nimaebra)! - refactor: update rule builder imports to per-file `@eslint-zod/utils/rule-builders/*` paths

- Updated dependencies [[`a89b181`](https://github.com/marcalexiei/eslint-zod/commit/a89b1815b75ec735abf96dd1f5ebdada1487ee35)]:
  - @eslint-zod/utils@2.0.0

## 1.0.1

### Patch Changes

- Updated dependencies [[`b073f04`](https://github.com/marcalexiei/eslint-zod/commit/b073f0404c06a808aa6f0712020728d97b39a26f)]:
  - @eslint-zod/utils@1.3.0

## 1.0.0

### Major Changes

- [#293](https://github.com/marcalexiei/eslint-zod/pull/293) [`74117f9`](https://github.com/marcalexiei/eslint-zod/commit/74117f9ad94697911f42f77b958e59b4d2239017) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: initial release

### Patch Changes

- Updated dependencies [[`74117f9`](https://github.com/marcalexiei/eslint-zod/commit/74117f9ad94697911f42f77b958e59b4d2239017)]:
  - @eslint-zod/utils@1.2.0
