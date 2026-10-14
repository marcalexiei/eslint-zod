# eslint-plugin-zod-mini

## 2.1.0

**`eslint` is no longer needed to use this plugin.**
It loads without `eslint` ([#539](https://github.com/marcalexiei/eslint-zod/pull/539)), and it no longer depends on `@typescript-eslint/utils` ([#560](https://github.com/marcalexiei/eslint-zod/pull/560)), whose required `eslint` and `typescript` peers were installed along with it.
With oxlint, nothing from ESLint has to be installed.

### Minor Changes

- [#500](https://github.com/marcalexiei/eslint-zod/pull/500) [`5adf57a`](https://github.com/marcalexiei/eslint-zod/commit/5adf57aaf6dc3cdfd033d1e5ea1529e2a987ab6e) - fix: lint `.mts` and `.cts` files, and register the exported plugin in each config so it can be re-registered.

### Patch Changes

- [#505](https://github.com/marcalexiei/eslint-zod/pull/505) [`9f0c4f2`](https://github.com/marcalexiei/eslint-zod/commit/9f0c4f23a8573c3cde985322d09967290bd1a2d5) - fix: stop crashing on a factory call that shares a method's name

- [#548](https://github.com/marcalexiei/eslint-zod/pull/548) [`1fd9cc4`](https://github.com/marcalexiei/eslint-zod/commit/1fd9cc430954a533b7d4e9344408e71ffb342db9) - fix: withhold more fixes that would drop a comment

- [#529](https://github.com/marcalexiei/eslint-zod/pull/529) [`8f5efaf`](https://github.com/marcalexiei/eslint-zod/commit/8f5efaf10851c956bf9cbd3d13f20f5dbbe5674b) - fix(no-conflicting-checks): stop comparing checks across a mutating check

- [#512](https://github.com/marcalexiei/eslint-zod/pull/512) [`16c7cc6`](https://github.com/marcalexiei/eslint-zod/commit/16c7cc62ddadfae82cfb9e5a3885fdff269e9a1b) - fix(no-conflicting-checks): stop crashing on a zero bigint divisor

- [#522](https://github.com/marcalexiei/eslint-zod/pull/522) [`1e998a1`](https://github.com/marcalexiei/eslint-zod/commit/1e998a1620a122f9bcacb8d9a01d86a1d0a403e4) - fix(require-error-message): handle shorthand, quoted and computed keys

- [#526](https://github.com/marcalexiei/eslint-zod/pull/526) [`dcd1ac8`](https://github.com/marcalexiei/eslint-zod/commit/dcd1ac8f4003c8538ed796b9a06dfb2fbd9ce6fa) - fix(no-duplicate-schema-methods): allow methods that are meant to repeat

- [#539](https://github.com/marcalexiei/eslint-zod/pull/539) [`6f4051c`](https://github.com/marcalexiei/eslint-zod/commit/6f4051c49b21bc81e8f68e288fdeab001472df0e) - fix: load without `eslint` installed

- [#524](https://github.com/marcalexiei/eslint-zod/pull/524) [`9cbc143`](https://github.com/marcalexiei/eslint-zod/commit/9cbc14386727a2c72815033f5fa1470794592c0e) - fix: withhold fixes that would drop a comment

- [#514](https://github.com/marcalexiei/eslint-zod/pull/514) [`551b0f4`](https://github.com/marcalexiei/eslint-zod/commit/551b0f486f55b2ac1a3faac0176daa1cd329b601) - fix(prefer-enum-over-literal-union): only accept bare `z.literal()` members

- [#552](https://github.com/marcalexiei/eslint-zod/pull/552) [`e4017fd`](https://github.com/marcalexiei/eslint-zod/commit/e4017fd6da3d54333d50fa04385f384d1829d9f6) - fix: stop two fixes moving a length check ahead of a check that rewrites the value

- [#530](https://github.com/marcalexiei/eslint-zod/pull/530) [`9fe66d9`](https://github.com/marcalexiei/eslint-zod/commit/9fe66d9a31b78b51edea2afa468f3d3e75cf6115) - fix(no-dynamic-schema-value): ignore the input of a chained parse call

- [#541](https://github.com/marcalexiei/eslint-zod/pull/541) [`4667778`](https://github.com/marcalexiei/eslint-zod/commit/4667778005cf1d3ea928a5344a1754841055a480) - fix(consistent-object-schema-type): rename the factory in the suggestion

- [#540](https://github.com/marcalexiei/eslint-zod/pull/540) [`46ba6f6`](https://github.com/marcalexiei/eslint-zod/commit/46ba6f6f3abbab3eb00b2346d5fffcd4e3780913) - fix(prefer-meta): leave a spread argument unfixed

- [#550](https://github.com/marcalexiei/eslint-zod/pull/550) [`a6ccfa1`](https://github.com/marcalexiei/eslint-zod/commit/a6ccfa111abcc411fa2facd48d4bcb04396646e5) - fix: treat `toJSONSchema()`, `isOptional()`, `isNullable()` and `apply()` as ending a schema chain

- [#518](https://github.com/marcalexiei/eslint-zod/pull/518) [`1d9095b`](https://github.com/marcalexiei/eslint-zod/commit/1d9095ba8f8e55c3f833a4dcd0f6947913b6c6f9) - fix(prefer-tuple-over-array-length): guard the fix against unsafe rewrites

- [#536](https://github.com/marcalexiei/eslint-zod/pull/536) [`db50ed6`](https://github.com/marcalexiei/eslint-zod/commit/db50ed6a00cf7d121ac65258d54059108760b312) - fix: apply the shared configs to `.mts` and `.cts` files

- [#553](https://github.com/marcalexiei/eslint-zod/pull/553) [`ff227b1`](https://github.com/marcalexiei/eslint-zod/commit/ff227b105a0174903d3e394476799527b6984c7c) - fix(no-conflicting-checks): stop comparing across a callback check or past a mutated literal

- [#528](https://github.com/marcalexiei/eslint-zod/pull/528) [`b9c6460`](https://github.com/marcalexiei/eslint-zod/commit/b9c6460cf55fa1b8ad5dd0192d4fbc924a70004e) - fix(schema-error-property-style): check the `refine()` / `custom()` call itself

- [#513](https://github.com/marcalexiei/eslint-zod/pull/513) [`9e5ad45`](https://github.com/marcalexiei/eslint-zod/commit/9e5ad4566698cd31c63285b53080949edfbb7484) - fix: stop fixes unbalancing a parenthesized receiver

- [#532](https://github.com/marcalexiei/eslint-zod/pull/532) [`69844b9`](https://github.com/marcalexiei/eslint-zod/commit/69844b9951c4c96a3f24e37474f0bd9759e479e6) - fix(no-throw-in-refine): check every `.refine()` and more statement kinds

- [#560](https://github.com/marcalexiei/eslint-zod/pull/560) [`5f3da15`](https://github.com/marcalexiei/eslint-zod/commit/5f3da15bee748aee01a819c13960c61a8be1e9f3) - refactor: drop the `@typescript-eslint/utils` dependency, and with it its required `eslint` and `typescript` peers

- [#533](https://github.com/marcalexiei/eslint-zod/pull/533) [`20381b0`](https://github.com/marcalexiei/eslint-zod/commit/20381b078c52c2e2e12aca4f5f6d937f0a10892b) - fix(no-conflicting-checks): analyse negative bounds and `z.iso.*()` factories

- [#517](https://github.com/marcalexiei/eslint-zod/pull/517) [`316715e`](https://github.com/marcalexiei/eslint-zod/commit/316715ed8948249eb2252df7eb5cc5342de96c21) - fix: stop collapsing bounds across a type-changing method or an opaque check

- [#555](https://github.com/marcalexiei/eslint-zod/pull/555) [`20c8372`](https://github.com/marcalexiei/eslint-zod/commit/20c83727400abb4b223f53f5904c7f2d5c405ab2) - fix(no-duplicate-schema-methods): drop `.or()` and `.and()`, which `zod/mini` does not have

- [#542](https://github.com/marcalexiei/eslint-zod/pull/542) [`bbdfcf6`](https://github.com/marcalexiei/eslint-zod/commit/bbdfcf6c6f80aac6b353d3a2c6b6763cd9ea0446) - fix(no-any-schema): only suggest renaming the `any` factory itself

- [#525](https://github.com/marcalexiei/eslint-zod/pull/525) [`a13491d`](https://github.com/marcalexiei/eslint-zod/commit/a13491d8b901b6a048b6e0f2de27df4cff7edf1b) - fix(require-brand-type-parameter): accept a brand named by a value argument

- [#535](https://github.com/marcalexiei/eslint-zod/pull/535) [`b81695b`](https://github.com/marcalexiei/eslint-zod/commit/b81695bda77af47eb723085d00739c7d045c8665) - fix: cover record variants, transform factory keys and `.nonempty()`

- [#547](https://github.com/marcalexiei/eslint-zod/pull/547) [`32006a3`](https://github.com/marcalexiei/eslint-zod/commit/32006a3843e533a2a1481f863fd47d84f438fcb0) - fix: stop judging a chain resumed after a property access by the factory before it

- [#527](https://github.com/marcalexiei/eslint-zod/pull/527) [`0798a2b`](https://github.com/marcalexiei/eslint-zod/commit/0798a2bcc12b7b564558224dd7908b156c2984f4) - fix(no-transform-in-record-key): read the key of the `record()` call itself

- [#538](https://github.com/marcalexiei/eslint-zod/pull/538) [`8ee7aa6`](https://github.com/marcalexiei/eslint-zod/commit/8ee7aa6921952a5ba691feb4ff4321fda71d9091) - fix: keep `tsc -b` output out of the published packages
- Updated dependencies [[`52e42d5`](https://github.com/marcalexiei/eslint-zod/commit/52e42d537c964cc75da11d8e9839400a9ad18b0c), [`9f0c4f2`](https://github.com/marcalexiei/eslint-zod/commit/9f0c4f23a8573c3cde985322d09967290bd1a2d5), [`d479242`](https://github.com/marcalexiei/eslint-zod/commit/d4792420d74fc0392190d07e70bd7343d14c5031), [`1fd9cc4`](https://github.com/marcalexiei/eslint-zod/commit/1fd9cc430954a533b7d4e9344408e71ffb342db9), [`8f5efaf`](https://github.com/marcalexiei/eslint-zod/commit/8f5efaf10851c956bf9cbd3d13f20f5dbbe5674b), [`16c7cc6`](https://github.com/marcalexiei/eslint-zod/commit/16c7cc62ddadfae82cfb9e5a3885fdff269e9a1b), [`1e998a1`](https://github.com/marcalexiei/eslint-zod/commit/1e998a1620a122f9bcacb8d9a01d86a1d0a403e4), [`e283a27`](https://github.com/marcalexiei/eslint-zod/commit/e283a27474e0c754dfadf2b1fe503a4a811dee43), [`6f4051c`](https://github.com/marcalexiei/eslint-zod/commit/6f4051c49b21bc81e8f68e288fdeab001472df0e), [`3f2542d`](https://github.com/marcalexiei/eslint-zod/commit/3f2542d4f8cf99b68f8ede1c96c82a1f497be9cb), [`9cbc143`](https://github.com/marcalexiei/eslint-zod/commit/9cbc14386727a2c72815033f5fa1470794592c0e), [`551b0f4`](https://github.com/marcalexiei/eslint-zod/commit/551b0f486f55b2ac1a3faac0176daa1cd329b601), [`e4017fd`](https://github.com/marcalexiei/eslint-zod/commit/e4017fd6da3d54333d50fa04385f384d1829d9f6), [`9fe66d9`](https://github.com/marcalexiei/eslint-zod/commit/9fe66d9a31b78b51edea2afa468f3d3e75cf6115), [`4667778`](https://github.com/marcalexiei/eslint-zod/commit/4667778005cf1d3ea928a5344a1754841055a480), [`e9b2bad`](https://github.com/marcalexiei/eslint-zod/commit/e9b2bad05274bcea4583c69f13d21ed0836f1061), [`a6ccfa1`](https://github.com/marcalexiei/eslint-zod/commit/a6ccfa111abcc411fa2facd48d4bcb04396646e5), [`1d9095b`](https://github.com/marcalexiei/eslint-zod/commit/1d9095ba8f8e55c3f833a4dcd0f6947913b6c6f9), [`67ce5a3`](https://github.com/marcalexiei/eslint-zod/commit/67ce5a3c0ee1daf9a02901e65d41b71e438adfa6), [`ff227b1`](https://github.com/marcalexiei/eslint-zod/commit/ff227b105a0174903d3e394476799527b6984c7c), [`b9c6460`](https://github.com/marcalexiei/eslint-zod/commit/b9c6460cf55fa1b8ad5dd0192d4fbc924a70004e), [`9e5ad45`](https://github.com/marcalexiei/eslint-zod/commit/9e5ad4566698cd31c63285b53080949edfbb7484), [`69844b9`](https://github.com/marcalexiei/eslint-zod/commit/69844b9951c4c96a3f24e37474f0bd9759e479e6), [`0adfa55`](https://github.com/marcalexiei/eslint-zod/commit/0adfa55e87a33f75668f30d06770cadd561eebd3), [`5752bec`](https://github.com/marcalexiei/eslint-zod/commit/5752bec65ee66a075ca354174122818338f579bf), [`bc110d2`](https://github.com/marcalexiei/eslint-zod/commit/bc110d2d3379a76eef3324637adf3e91cf283581), [`20381b0`](https://github.com/marcalexiei/eslint-zod/commit/20381b078c52c2e2e12aca4f5f6d937f0a10892b), [`316715e`](https://github.com/marcalexiei/eslint-zod/commit/316715ed8948249eb2252df7eb5cc5342de96c21), [`59b045e`](https://github.com/marcalexiei/eslint-zod/commit/59b045ec458817f6f6f1789fc1ed9f6bf0e766ad), [`97169bc`](https://github.com/marcalexiei/eslint-zod/commit/97169bc0c5b8d4f0121fdad13cb9ba11da75ff83), [`bbdfcf6`](https://github.com/marcalexiei/eslint-zod/commit/bbdfcf6c6f80aac6b353d3a2c6b6763cd9ea0446), [`a13491d`](https://github.com/marcalexiei/eslint-zod/commit/a13491d8b901b6a048b6e0f2de27df4cff7edf1b), [`b81695b`](https://github.com/marcalexiei/eslint-zod/commit/b81695bda77af47eb723085d00739c7d045c8665), [`5d0b05c`](https://github.com/marcalexiei/eslint-zod/commit/5d0b05cf27f40eabc73564ed636f9229e81086fb), [`32006a3`](https://github.com/marcalexiei/eslint-zod/commit/32006a3843e533a2a1481f863fd47d84f438fcb0), [`0798a2b`](https://github.com/marcalexiei/eslint-zod/commit/0798a2bcc12b7b564558224dd7908b156c2984f4), [`5f3da15`](https://github.com/marcalexiei/eslint-zod/commit/5f3da15bee748aee01a819c13960c61a8be1e9f3), [`d353312`](https://github.com/marcalexiei/eslint-zod/commit/d3533124db19064d8718f9efd2b8dfec10248288), [`8ee7aa6`](https://github.com/marcalexiei/eslint-zod/commit/8ee7aa6921952a5ba691feb4ff4321fda71d9091)]:
  - @eslint-zod/utils@6.1.0

## 2.0.1

### Patch Changes

- [#493](https://github.com/marcalexiei/eslint-zod/pull/493) [`43ad93e`](https://github.com/marcalexiei/eslint-zod/commit/43ad93e42d642e9f133d1bb1c81b833693f4516a) - fix(consistent-schema-var-name): keep the suggested name camelCase when `before` ends in a letter, so `user` becomes `zUser` rather than `zuser`.

- [#492](https://github.com/marcalexiei/eslint-zod/pull/492) [`1a9ab36`](https://github.com/marcalexiei/eslint-zod/commit/1a9ab36f4885a064ac74ee1fc8f132a33c06d251) - fix(consistent-schema-var-name): ignore a parse result whose chain continues after a property access, such as `.parse(input).tags.map(fn)`.
- Updated dependencies [[`43ad93e`](https://github.com/marcalexiei/eslint-zod/commit/43ad93e42d642e9f133d1bb1c81b833693f4516a), [`1a9ab36`](https://github.com/marcalexiei/eslint-zod/commit/1a9ab36f4885a064ac74ee1fc8f132a33c06d251)]:
  - @eslint-zod/utils@6.0.1

## 2.0.0

### Major Changes

- [#474](https://github.com/marcalexiei/eslint-zod/pull/474) [`ae3ae1a`](https://github.com/marcalexiei/eslint-zod/commit/ae3ae1a0db9066a32d2d91fef825dee8dd5aeb02) - feat!: split configs into `recommended`, `strict`, `stylistic` and `all`.

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

- [#475](https://github.com/marcalexiei/eslint-zod/pull/475) [`c227d7a`](https://github.com/marcalexiei/eslint-zod/commit/c227d7a8e82d9e8357ee20d3a0e7fc5188ca4919) - feat!: publish ESM only and require Node `^20.19 || ^22.12 || >=24`; CommonJS configs still load the package through `require()`, under `.default`.

### Patch Changes

- Updated dependencies [[`c227d7a`](https://github.com/marcalexiei/eslint-zod/commit/c227d7a8e82d9e8357ee20d3a0e7fc5188ca4919)]:
  - @eslint-zod/utils@6.0.0

## 1.11.2

### Patch Changes

- [#471](https://github.com/marcalexiei/eslint-zod/pull/471) [`acb0e63`](https://github.com/marcalexiei/eslint-zod/commit/acb0e63282d938d8bbdae4d1ace132aaaed71afa) - fix(no-duplicate-schema-methods): a type-changing method starts a new chain segment, so `z.string().min(1).array().min(1)` is no longer reported
- Updated dependencies [[`acb0e63`](https://github.com/marcalexiei/eslint-zod/commit/acb0e63282d938d8bbdae4d1ace132aaaed71afa)]:
  - @eslint-zod/utils@5.3.0

## 1.11.1

### Patch Changes

- [#467](https://github.com/marcalexiei/eslint-zod/pull/467) [`56c6ee4`](https://github.com/marcalexiei/eslint-zod/commit/56c6ee40461d10f67dbbed70fc2fab3aff253cc0) - fix: stop `consistent-schema-var-name` and `no-dynamic-schema-value` reporting top-level helpers such as `z.toJSONSchema()` and `z.prettifyError()`

- [#466](https://github.com/marcalexiei/eslint-zod/pull/466) [`a034823`](https://github.com/marcalexiei/eslint-zod/commit/a034823741eb5a5422e67c726574c276fa925da6) - fix(no-function-scoped-schema): stop reporting top-level helpers that consume a schema, such as `z.toJSONSchema()` and `z.prettifyError()`
- Updated dependencies [[`56c6ee4`](https://github.com/marcalexiei/eslint-zod/commit/56c6ee40461d10f67dbbed70fc2fab3aff253cc0), [`a034823`](https://github.com/marcalexiei/eslint-zod/commit/a034823741eb5a5422e67c726574c276fa925da6)]:
  - @eslint-zod/utils@5.2.0

## 1.11.0

### Minor Changes

- [#463](https://github.com/marcalexiei/eslint-zod/pull/463) [`e10c9a7`](https://github.com/marcalexiei/eslint-zod/commit/e10c9a76a50e07334d851205a8ce7e2032a7ec33) - feat(no-conflicting-checks): report content and pattern checks another one already implies

### Patch Changes

- Updated dependencies [[`e10c9a7`](https://github.com/marcalexiei/eslint-zod/commit/e10c9a76a50e07334d851205a8ce7e2032a7ec33)]:
  - @eslint-zod/utils@5.1.0

## 1.10.1

### Patch Changes

- Updated dependencies [[`703ed5e`](https://github.com/marcalexiei/eslint-zod/commit/703ed5e0442ef017080b3987b00253eafc7d8685)]:
  - @eslint-zod/utils@5.0.1

## 1.10.0

### Minor Changes

- [#433](https://github.com/marcalexiei/eslint-zod/pull/433) [`3124361`](https://github.com/marcalexiei/eslint-zod/commit/3124361d363d4f1ac95985c5b4f1840311a22d66) - feat: add `no-dynamic-schema-value` rule

  Flags a non-static argument anywhere in schema expression:

  - a function call result
  - `new`
  - `this`
  - mutable variable

  the criterion `zod-compiler` uses to decide what it can hoist.

  Opt-in, not part of `recommended` config.

- [#435](https://github.com/marcalexiei/eslint-zod/pull/435) [`12eca40`](https://github.com/marcalexiei/eslint-zod/commit/12eca408edbf6794aa6aca32886e7b7361b201be) - feat: add `prefer-validate` with suggestions for success-only synchronous and asynchronous parsing

- [#433](https://github.com/marcalexiei/eslint-zod/pull/433) [`3124361`](https://github.com/marcalexiei/eslint-zod/commit/3124361d363d4f1ac95985c5b4f1840311a22d66) - feat: add `no-function-scoped-schema` rule

  Flags a schema built inside a function body instead of once at module scope.
  When using `import 'zod/compile'` a per-call schema is rebuilt and recompiled on every call.

  Opt-in, not part of `recommended` config.

### Patch Changes

- Updated dependencies [[`3124361`](https://github.com/marcalexiei/eslint-zod/commit/3124361d363d4f1ac95985c5b4f1840311a22d66), [`62608ad`](https://github.com/marcalexiei/eslint-zod/commit/62608ad20e6ac8084702af171c4cab34ab1672f4), [`12eca40`](https://github.com/marcalexiei/eslint-zod/commit/12eca408edbf6794aa6aca32886e7b7361b201be), [`3124361`](https://github.com/marcalexiei/eslint-zod/commit/3124361d363d4f1ac95985c5b4f1840311a22d66)]:
  - @eslint-zod/utils@5.0.0

## 1.9.1

### Patch Changes

- [#421](https://github.com/marcalexiei/eslint-zod/pull/421) [`940c4fd`](https://github.com/marcalexiei/eslint-zod/commit/940c4fdd5316daf654bdcd9d07bea0da86f398d8) - refactor: `buildNoTransformInRecordKeyCreate` now takes the transform names instead of a `findTransformNode` strategy, and the report points at the offending method or check rather than the whole key schema.
- Updated dependencies [[`940c4fd`](https://github.com/marcalexiei/eslint-zod/commit/940c4fdd5316daf654bdcd9d07bea0da86f398d8)]:
  - @eslint-zod/utils@4.0.0

## 1.9.0

### Minor Changes

- [#417](https://github.com/marcalexiei/eslint-zod/pull/417) [`f9c7171`](https://github.com/marcalexiei/eslint-zod/commit/f9c7171b0ff1d727ac64b621b181cc369f738c02) - feat: recognize `z.creditCard()`, the string format added in zod 4.5

### Patch Changes

- [#417](https://github.com/marcalexiei/eslint-zod/pull/417) [`f9c7171`](https://github.com/marcalexiei/eslint-zod/commit/f9c7171b0ff1d727ac64b621b181cc369f738c02) - fix(consistent-schema-var-name): stop reporting `z.validate()` and `z.validateAsync()` results, which are booleans rather than schemas
- Updated dependencies [[`f9c7171`](https://github.com/marcalexiei/eslint-zod/commit/f9c7171b0ff1d727ac64b621b181cc369f738c02), [`f9c7171`](https://github.com/marcalexiei/eslint-zod/commit/f9c7171b0ff1d727ac64b621b181cc369f738c02)]:
  - @eslint-zod/utils@3.3.0

## 1.8.0

### Minor Changes

- [#410](https://github.com/marcalexiei/eslint-zod/pull/410) [`29fcc59`](https://github.com/marcalexiei/eslint-zod/commit/29fcc596a4f1bcadb6464abe815c09298ad69fc0) - feat: add `prefer-map-set-size-over-min-max` rule, which collapses `z.minSize(n)` and `z.maxSize(n)` with the same value into `z.size(n)`

### Patch Changes

- Updated dependencies [[`3084477`](https://github.com/marcalexiei/eslint-zod/commit/30844770e85f0e2c03e851363a2c34576fd18728)]:
  - @eslint-zod/utils@3.2.0

## 1.7.0

### Minor Changes

- [#403](https://github.com/marcalexiei/eslint-zod/pull/403) [`5dae17b`](https://github.com/marcalexiei/eslint-zod/commit/5dae17b12d64a49f12c9ebc9b1b7ec3f9fef1370) - feat: add `no-native-enum` and `no-promise-schema` rules

  Flag the deprecated `z.nativeEnum()` (autofixed to `z.enum()` for namespace calls) and `z.promise()`. Both enabled in `recommended`.

- [#407](https://github.com/marcalexiei/eslint-zod/pull/407) [`6929124`](https://github.com/marcalexiei/eslint-zod/commit/6929124167701b011f021a51d6e6d0cac3601c06) - feat: add `prefer-string-length-over-min-max` rule

  Collapses `z.minLength(n)` and `z.maxLength(n)` with the same value on a string schema to `z.length(n)`.
  Not enabled in `recommended`.

### Patch Changes

- [#404](https://github.com/marcalexiei/eslint-zod/pull/404) [`cb7b394`](https://github.com/marcalexiei/eslint-zod/commit/cb7b3948e769dc78ea99669e44f0e3a463bc5c18) - chore: migrate to `changesets` v3

  Changelog entries no longer carry a `Thanks @…!` attribution; the pull request and commit links are unchanged.

- Updated dependencies [[`6929124`](https://github.com/marcalexiei/eslint-zod/commit/6929124167701b011f021a51d6e6d0cac3601c06), [`5dae17b`](https://github.com/marcalexiei/eslint-zod/commit/5dae17b12d64a49f12c9ebc9b1b7ec3f9fef1370), [`cb7b394`](https://github.com/marcalexiei/eslint-zod/commit/cb7b3948e769dc78ea99669e44f0e3a463bc5c18)]:
  - @eslint-zod/utils@3.1.0

## 1.6.1

### Patch Changes

- [#401](https://github.com/marcalexiei/eslint-zod/pull/401) [`d240d10`](https://github.com/marcalexiei/eslint-zod/commit/d240d10df0a203d4a796e763562810923b41474a) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `prefer-meta` autofix corrupting a computed `z['describe'](…)` call

  The fixer renamed the callee's property to `meta` without checking that it was an identifier, so a computed key was rewritten into the undeclared identifier `meta`: `z['describe']('x')` became `z[meta]({ description: 'x' })`.
  Such a call is now reported without a fix.

- [#376](https://github.com/marcalexiei/eslint-zod/pull/376) [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `no-any-schema` crash on a computed factory call

  The rule threw on `z['any']()`.
  It now reports the schema without a rename suggestion.

- [#376](https://github.com/marcalexiei/eslint-zod/pull/376) [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `consistent-import` alias collision between two zod sources

  Every rewritten import group received the alias `z`, so a file importing from both `zod/mini` and `zod/v4-mini` was fixed into two `import * as z` declarations.
  Each group now gets a distinct alias.

- [#400](https://github.com/marcalexiei/eslint-zod/pull/400) [`fb49a63`](https://github.com/marcalexiei/eslint-zod/commit/fb49a639c3bee68268861b6c44ea9626c0cac6c6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `no-conflicting-checks` no longer flags a narrowed string format as impossible

  `z.string().check(z.uuid(), z.uuidv4())` is a refinement, not a contradiction —
  the GUID/UUID family nests. Two different UUID versions still conflict.

  Also stops `no-coerce-boolean`, `no-throw-in-refine` and
  `prefer-enum-over-literal-union` crashing on `z.coerce['boolean']()`,
  `z.string().check(z.refine())` and `z.literal()`.

- Updated dependencies [[`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`fb49a63`](https://github.com/marcalexiei/eslint-zod/commit/fb49a639c3bee68268861b6c44ea9626c0cac6c6), [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd), [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd), [`fb49a63`](https://github.com/marcalexiei/eslint-zod/commit/fb49a639c3bee68268861b6c44ea9626c0cac6c6), [`4d8edae`](https://github.com/marcalexiei/eslint-zod/commit/4d8edae60e525cd1816f87600d1f825b3146fa35)]:
  - @eslint-zod/utils@3.0.0

## 1.6.0

### Minor Changes

- [#374](https://github.com/marcalexiei/eslint-zod/pull/374) [`6bbcdf0`](https://github.com/marcalexiei/eslint-zod/commit/6bbcdf06cb37a151e36af25146297c24897846d0) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `prefer-nullish` rule

  Flags nesting `z.optional()` and `z.nullable()` (in either order) when the outer wrapper's single argument is directly the other bare wrapper, and autofixes it to `z.nullish()`. Enabled in `recommended`.

### Patch Changes

- Updated dependencies [[`6bbcdf0`](https://github.com/marcalexiei/eslint-zod/commit/6bbcdf06cb37a151e36af25146297c24897846d0)]:
  - @eslint-zod/utils@2.5.0

## 1.5.0

### Minor Changes

- [#373](https://github.com/marcalexiei/eslint-zod/pull/373) [`dc8e969`](https://github.com/marcalexiei/eslint-zod/commit/dc8e9696f37cf00404bd78b5d38c6268009b9c1b) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `no-conflicting-checks` rule

  Flags checks that can never match together (`z.check(z.gt(10), z.lt(5))`, `z.check(z.url(), z.email())`), redundant/confusing combinations, and checks that don't apply to the schema's base type (`z.number().check(z.minLength(1))` silently accepts everything).

  Three option-gated categories, all on by default; no autofix.

- [#364](https://github.com/marcalexiei/eslint-zod/pull/364) [`250e526`](https://github.com/marcalexiei/eslint-zod/commit/250e526df7c0870b9f7a98177fc0d9e8e0b78278) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `prefer-tuple-over-array-length` rule

  Flags a length-constrained `z.array()` (`.check(z.length())`, `.check(z.minLength())`, `.check(z.maxLength())`) and suggests `z.tuple()`, which preserves the element count in the inferred type.

  Autofixes `z.length(n)` and equal-bound `z.minLength(n)` + `z.maxLength(n)` to a fixed tuple, and `z.minLength(n)` to a rest tuple; everything else is report-only.

- [#370](https://github.com/marcalexiei/eslint-zod/pull/370) [`5547b24`](https://github.com/marcalexiei/eslint-zod/commit/5547b24ef00a084a8aa943b6c57fd7d0cacbf8d3) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `no-unnecessary-readonly` rule

  Flags `z.readonly()` on schemas whose output is already immutable — primitives/scalars, number sub-types, top-level string formats, and doubled `readonly`.

  Autofix unwraps the schema.

### Patch Changes

- Updated dependencies [[`0913e38`](https://github.com/marcalexiei/eslint-zod/commit/0913e3886976ed138f6a060cead6297be14e8e8d), [`5547b24`](https://github.com/marcalexiei/eslint-zod/commit/5547b24ef00a084a8aa943b6c57fd7d0cacbf8d3), [`dc8e969`](https://github.com/marcalexiei/eslint-zod/commit/dc8e9696f37cf00404bd78b5d38c6268009b9c1b), [`250e526`](https://github.com/marcalexiei/eslint-zod/commit/250e526df7c0870b9f7a98177fc0d9e8e0b78278)]:
  - @eslint-zod/utils@2.4.0

## 1.4.0

### Minor Changes

- [#342](https://github.com/marcalexiei/eslint-zod/pull/342) [`de44e4c`](https://github.com/marcalexiei/eslint-zod/commit/de44e4cefcc64d8aae394081d777a90d3f4f283d) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `no-coerce-boolean` rule

  Disallow `z.coerce.boolean()`, which relies on `Boolean()` and treats any non-empty string (including `"false"`) as `true`.\
  The rule offers a suggestion to replace it with `z.stringbool()`.

### Patch Changes

- Updated dependencies [[`de44e4c`](https://github.com/marcalexiei/eslint-zod/commit/de44e4cefcc64d8aae394081d777a90d3f4f283d)]:
  - @eslint-zod/utils@2.3.0

## 1.3.0

### Minor Changes

- [#339](https://github.com/marcalexiei/eslint-zod/pull/339) [`d183319`](https://github.com/marcalexiei/eslint-zod/commit/d1833192088a28d9db1595d6bc90d02c29cb1ba5) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `no-duplicate-schema-methods` rule

  Disallows calling the same schema method more than once in a single chain.\
  Methods that are valid to repeat are excluded from the check:
  - `and`
  - `check`
  - `or`
  - `register`

### Patch Changes

- Updated dependencies [[`d183319`](https://github.com/marcalexiei/eslint-zod/commit/d1833192088a28d9db1595d6bc90d02c29cb1ba5)]:
  - @eslint-zod/utils@2.2.0

## 1.2.2

### Patch Changes

- [#327](https://github.com/marcalexiei/eslint-zod/pull/327) [`a10f137`](https://github.com/marcalexiei/eslint-zod/commit/a10f137ffcd03f6e04f6c88e53124836e0375cb6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - chore: use GitHub env for OIDC publishing

- Updated dependencies [[`a10f137`](https://github.com/marcalexiei/eslint-zod/commit/a10f137ffcd03f6e04f6c88e53124836e0375cb6)]:
  - @eslint-zod/utils@2.1.2

## 1.2.1

### Patch Changes

- [#325](https://github.com/marcalexiei/eslint-zod/pull/325) [`6faef20`](https://github.com/marcalexiei/eslint-zod/commit/6faef206f23c703bc2a06d8378f04fe660268a07) Thanks [@toto6038](https://github.com/toto6038)! - fix(consistent-schema-var-name): refine prefix/suffix handling

  accept a bare token matching either affix case-insensitively when only one side is configured, and use the configured affix casing in rename suggestions

- Updated dependencies [[`6faef20`](https://github.com/marcalexiei/eslint-zod/commit/6faef206f23c703bc2a06d8378f04fe660268a07)]:
  - @eslint-zod/utils@2.1.1

## 1.2.0

### Minor Changes

- [#320](https://github.com/marcalexiei/eslint-zod/pull/320) [`97d8c7c`](https://github.com/marcalexiei/eslint-zod/commit/97d8c7ca00ba48f55eba9b5ddd63da950cb127ef) Thanks [@nimaebra](https://github.com/nimaebra)! - feat: add `no-transform-in-record-key` rule

- [#318](https://github.com/marcalexiei/eslint-zod/pull/318) [`b084557`](https://github.com/marcalexiei/eslint-zod/commit/b08455769d81682e32feae0cc3306e62d5b3c549) Thanks [@nimaebra](https://github.com/nimaebra)! - feat(rule-builders): add `no-throw-in-refine`

  The `no-throw-in-refine` create logic has been extracted into `@eslint-zod/utils` so both
  `eslint-plugin-zod` and `eslint-plugin-zod-mini` use the same shared implementation.

### Patch Changes

- [#323](https://github.com/marcalexiei/eslint-zod/pull/323) [`0544a19`](https://github.com/marcalexiei/eslint-zod/commit/0544a197af5859b8a48615e49ff09bf6bcaaf884) Thanks [@marcalexiei](https://github.com/marcalexiei)! - refactor(no-transform-in-record-key): use `@eslint-zod/utils/rule-builders/no-transform-in-record-key`

- Updated dependencies [[`b084557`](https://github.com/marcalexiei/eslint-zod/commit/b08455769d81682e32feae0cc3306e62d5b3c549), [`0544a19`](https://github.com/marcalexiei/eslint-zod/commit/0544a197af5859b8a48615e49ff09bf6bcaaf884)]:
  - @eslint-zod/utils@2.1.0

## 1.1.1

### Patch Changes

- [#315](https://github.com/marcalexiei/eslint-zod/pull/315) [`a89b181`](https://github.com/marcalexiei/eslint-zod/commit/a89b1815b75ec735abf96dd1f5ebdada1487ee35) Thanks [@nimaebra](https://github.com/nimaebra)! - refactor: update rule builder imports to per-file `@eslint-zod/utils/rule-builders/*` paths

- Updated dependencies [[`a89b181`](https://github.com/marcalexiei/eslint-zod/commit/a89b1815b75ec735abf96dd1f5ebdada1487ee35)]:
  - @eslint-zod/utils@2.0.0

## 1.1.0

### Minor Changes

- [#314](https://github.com/marcalexiei/eslint-zod/pull/314) [`b073f04`](https://github.com/marcalexiei/eslint-zod/commit/b073f0404c06a808aa6f0712020728d97b39a26f) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `prefer-enum-over-literal-union` rule

### Patch Changes

- Updated dependencies [[`b073f04`](https://github.com/marcalexiei/eslint-zod/commit/b073f0404c06a808aa6f0712020728d97b39a26f)]:
  - @eslint-zod/utils@1.3.0

## 1.0.3

### Patch Changes

- [#293](https://github.com/marcalexiei/eslint-zod/pull/293) [`74117f9`](https://github.com/marcalexiei/eslint-zod/commit/74117f9ad94697911f42f77b958e59b4d2239017) Thanks [@marcalexiei](https://github.com/marcalexiei)! - docs(README): correct `zod/mini` URL

- Updated dependencies [[`74117f9`](https://github.com/marcalexiei/eslint-zod/commit/74117f9ad94697911f42f77b958e59b4d2239017)]:
  - @eslint-zod/utils@1.2.0

## 1.0.2

### Patch Changes

- [#297](https://github.com/marcalexiei/eslint-zod/pull/297) [`66dcfca`](https://github.com/marcalexiei/eslint-zod/commit/66dcfca1aceb8c5dc2d85e4e06147561495491e6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - refactor(prefer-meta): rely on `detectZodSchemaRootNode` to detect describe methods

- Updated dependencies [[`66dcfca`](https://github.com/marcalexiei/eslint-zod/commit/66dcfca1aceb8c5dc2d85e4e06147561495491e6), [`66dcfca`](https://github.com/marcalexiei/eslint-zod/commit/66dcfca1aceb8c5dc2d85e4e06147561495491e6), [`38429ee`](https://github.com/marcalexiei/eslint-zod/commit/38429ee89494bc1605d3248b10e46c8a6ec0a58c)]:
  - @eslint-zod/utils@1.1.0

## 1.0.1

### Patch Changes

- [#286](https://github.com/marcalexiei/eslint-zod/pull/286) [`9cfe2bb`](https://github.com/marcalexiei/eslint-zod/commit/9cfe2bb16ba1a70f12bf81a6bd1ed47e97200889) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `dist` folder is missing in published package

- Updated dependencies [[`9cfe2bb`](https://github.com/marcalexiei/eslint-zod/commit/9cfe2bb16ba1a70f12bf81a6bd1ed47e97200889)]:
  - @eslint-zod/utils@1.0.1

## 1.0.0

### Major Changes

- [#277](https://github.com/marcalexiei/eslint-zod/pull/277) [`349991f`](https://github.com/marcalexiei/eslint-zod/commit/349991fc60a7909af4830d0aa117d2878f306557) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat!: initial release

  This plugin visits only schemas coming from `zod/mini` and `zod/v4-mini`

  It supports the following rules from `eslint-plugin-zod`:
  - `consistent-import`
  - `consistent-import-source`
  - `consistent-object-schema-type`
  - `consistent-schema-output-type-style`
  - `consistent-schema-var-name`
  - `no-any-schema`
  - `no-empty-custom-schema`
  - `no-unknown-schema`
  - `prefer-meta`
  - `require-brand-type-parameter`
  - `require-error-message`
  - `schema-error-property-style`

  A `recommended` config is exposed by the plugin for easy setup

### Patch Changes

- Updated dependencies [[`349991f`](https://github.com/marcalexiei/eslint-zod/commit/349991fc60a7909af4830d0aa117d2878f306557)]:
  - @eslint-zod/utils@1.0.0
