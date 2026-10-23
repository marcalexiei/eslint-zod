# @eslint-zod/utils

## 6.4.0

### Minor Changes

- [#583](https://github.com/marcalexiei/eslint-zod/pull/583) [`2f4f585`](https://github.com/marcalexiei/eslint-zod/commit/2f4f585fc7c49b1e32ef68ab04c10dca6c250226) - feat(utils): add `tracker.resolveZodSchema(node)` and a `localSchemas` option to `createSchemaVisitor`, so rules can follow `const` bindings to a schema.

### Patch Changes

- [#584](https://github.com/marcalexiei/eslint-zod/pull/584) [`9a6810b`](https://github.com/marcalexiei/eslint-zod/commit/9a6810b9ef5686f0082d208687cd917a97383284) - fix(no-dynamic-schema-value): accept a schema built from a local `const` and a member access on a static value, and report parse results.

- [#585](https://github.com/marcalexiei/eslint-zod/pull/585) [`ae6d0ac`](https://github.com/marcalexiei/eslint-zod/commit/ae6d0acb0e59817fa367e632f93f1ee2c064b785) - fix: report `isOptional`, `isNullable`, `isInt` and `isFinite` on a schema bound to a `const`.

## 6.3.0

### Minor Changes

- [#574](https://github.com/marcalexiei/eslint-zod/pull/574) [`13234f6`](https://github.com/marcalexiei/eslint-zod/commit/13234f62c7aad1ccaafffe83b7cd92ea6ffb18db) - feat: make an unreachable `buildNoDuplicateSchemaMethodsCreate` exclusion a type error

  Also exports the `ZodTypeChangingMethod` and `NoDuplicateSchemaMethodsExclusions` types.

### Patch Changes

- [#570](https://github.com/marcalexiei/eslint-zod/pull/570) [`d5f877f`](https://github.com/marcalexiei/eslint-zod/commit/d5f877fa11f06d90730480c0758158fcb5bb6b0f) - refactor: check zod name tables against zod's own declarations; no rule's behavior changes

- [#571](https://github.com/marcalexiei/eslint-zod/pull/571) [`2908981`](https://github.com/marcalexiei/eslint-zod/commit/2908981415f34086cb84c2921c74012b7e2a789a) - fix: drop unreachable type-changing method entries; no rule's behavior changes

## 6.2.0

### Minor Changes

- [#566](https://github.com/marcalexiei/eslint-zod/pull/566) [`020a144`](https://github.com/marcalexiei/eslint-zod/commit/020a144e135ed51dae52edc3074963c518a1082f) - feat(consistent-import): add the `default` syntax (`import z from 'zod'`)

### Patch Changes

- [#566](https://github.com/marcalexiei/eslint-zod/pull/566) [`020a144`](https://github.com/marcalexiei/eslint-zod/commit/020a144e135ed51dae52edc3074963c518a1082f) - fix(consistent-import): the autofix no longer breaks code nor drops comments, and imports inside `declare module` blocks are checked on their own

## 6.1.0

**Installing this package no longer pulls in `eslint`.**
It no longer depends on `@typescript-eslint/utils` ([#560](https://github.com/marcalexiei/eslint-zod/pull/560)), whose required `eslint` and `typescript` peers were installed along with it.
Its only typescript-eslint dependency is now `@typescript-eslint/types`, which has none.

### Minor Changes

- [#504](https://github.com/marcalexiei/eslint-zod/pull/504) [`d479242`](https://github.com/marcalexiei/eslint-zod/commit/d4792420d74fc0392190d07e70bd7343d14c5031) - feat: export the options types of the shared rule builders

- [#524](https://github.com/marcalexiei/eslint-zod/pull/524) [`9cbc143`](https://github.com/marcalexiei/eslint-zod/commit/9cbc14386727a2c72815033f5fa1470794592c0e) - feat: add `hasCommentInRange`

- [#513](https://github.com/marcalexiei/eslint-zod/pull/513) [`9e5ad45`](https://github.com/marcalexiei/eslint-zod/commit/9e5ad4566698cd31c63285b53080949edfbb7484) - feat: add `hasParenthesizedReceiver`

- [#507](https://github.com/marcalexiei/eslint-zod/pull/507) [`5752bec`](https://github.com/marcalexiei/eslint-zod/commit/5752bec65ee66a075ca354174122818338f579bf) - feat: add the `findZodChainedMethod` tracker method

- [#506](https://github.com/marcalexiei/eslint-zod/pull/506) [`bc110d2`](https://github.com/marcalexiei/eslint-zod/commit/bc110d2d3379a76eef3324637adf3e91cf283581) - feat: add `member` to the items of `collectZodChainMethods`

- [#560](https://github.com/marcalexiei/eslint-zod/pull/560) [`5f3da15`](https://github.com/marcalexiei/eslint-zod/commit/5f3da15bee748aee01a819c13960c61a8be1e9f3) - feat: add `createRuleCreator`, `createPluginMeta` and the `@eslint-zod/utils/rule-types` entry, replacing the `@typescript-eslint/utils` dependency

### Patch Changes

- [#531](https://github.com/marcalexiei/eslint-zod/pull/531) [`52e42d5`](https://github.com/marcalexiei/eslint-zod/commit/52e42d537c964cc75da11d8e9839400a9ad18b0c) - fix: detect a schema chain that ends in a property access

- [#505](https://github.com/marcalexiei/eslint-zod/pull/505) [`9f0c4f2`](https://github.com/marcalexiei/eslint-zod/commit/9f0c4f23a8573c3cde985322d09967290bd1a2d5) - fix: stop crashing on a factory call that shares a method's name

- [#548](https://github.com/marcalexiei/eslint-zod/pull/548) [`1fd9cc4`](https://github.com/marcalexiei/eslint-zod/commit/1fd9cc430954a533b7d4e9344408e71ffb342db9) - fix: withhold more fixes that would drop a comment

- [#529](https://github.com/marcalexiei/eslint-zod/pull/529) [`8f5efaf`](https://github.com/marcalexiei/eslint-zod/commit/8f5efaf10851c956bf9cbd3d13f20f5dbbe5674b) - fix(no-conflicting-checks): stop comparing checks across a mutating check

- [#512](https://github.com/marcalexiei/eslint-zod/pull/512) [`16c7cc6`](https://github.com/marcalexiei/eslint-zod/commit/16c7cc62ddadfae82cfb9e5a3885fdff269e9a1b) - fix(no-conflicting-checks): stop crashing on a zero bigint divisor

- [#522](https://github.com/marcalexiei/eslint-zod/pull/522) [`1e998a1`](https://github.com/marcalexiei/eslint-zod/commit/1e998a1620a122f9bcacb8d9a01d86a1d0a403e4) - fix(require-error-message): handle shorthand, quoted and computed keys

- [#503](https://github.com/marcalexiei/eslint-zod/pull/503) [`e283a27`](https://github.com/marcalexiei/eslint-zod/commit/e283a27474e0c754dfadf2b1fe503a4a811dee43) - fix(consistent-import): avoid false positive and invalid fix on every `import` in a plain JavaScript file

- [#539](https://github.com/marcalexiei/eslint-zod/pull/539) [`6f4051c`](https://github.com/marcalexiei/eslint-zod/commit/6f4051c49b21bc81e8f68e288fdeab001472df0e) - fix: load without `eslint` installed

- [#534](https://github.com/marcalexiei/eslint-zod/pull/534) [`3f2542d`](https://github.com/marcalexiei/eslint-zod/commit/3f2542d4f8cf99b68f8ede1c96c82a1f497be9cb) - fix: recognise zod factories imported under an alias

- [#514](https://github.com/marcalexiei/eslint-zod/pull/514) [`551b0f4`](https://github.com/marcalexiei/eslint-zod/commit/551b0f486f55b2ac1a3faac0176daa1cd329b601) - fix(prefer-enum-over-literal-union): only accept bare `z.literal()` members

- [#552](https://github.com/marcalexiei/eslint-zod/pull/552) [`e4017fd`](https://github.com/marcalexiei/eslint-zod/commit/e4017fd6da3d54333d50fa04385f384d1829d9f6) - fix: stop two fixes moving a length check ahead of a check that rewrites the value

- [#530](https://github.com/marcalexiei/eslint-zod/pull/530) [`9fe66d9`](https://github.com/marcalexiei/eslint-zod/commit/9fe66d9a31b78b51edea2afa468f3d3e75cf6115) - fix(no-dynamic-schema-value): ignore the input of a chained parse call

- [#541](https://github.com/marcalexiei/eslint-zod/pull/541) [`4667778`](https://github.com/marcalexiei/eslint-zod/commit/4667778005cf1d3ea928a5344a1754841055a480) - fix(consistent-object-schema-type): rename the factory in the suggestion

- [#515](https://github.com/marcalexiei/eslint-zod/pull/515) [`e9b2bad`](https://github.com/marcalexiei/eslint-zod/commit/e9b2bad05274bcea4583c69f13d21ed0836f1061) - fix: recognise `.slugify()`, `.with()` and the `minimum` / `maximum` checks

- [#550](https://github.com/marcalexiei/eslint-zod/pull/550) [`a6ccfa1`](https://github.com/marcalexiei/eslint-zod/commit/a6ccfa111abcc411fa2facd48d4bcb04396646e5) - fix: treat `toJSONSchema()`, `isOptional()`, `isNullable()` and `apply()` as ending a schema chain

- [#518](https://github.com/marcalexiei/eslint-zod/pull/518) [`1d9095b`](https://github.com/marcalexiei/eslint-zod/commit/1d9095ba8f8e55c3f833a4dcd0f6947913b6c6f9) - fix(prefer-tuple-over-array-length): guard the fix against unsafe rewrites

- [#516](https://github.com/marcalexiei/eslint-zod/pull/516) [`67ce5a3`](https://github.com/marcalexiei/eslint-zod/commit/67ce5a3c0ee1daf9a02901e65d41b71e438adfa6) - fix: stop the top-level factory fix dropping arguments or reordering

- [#553](https://github.com/marcalexiei/eslint-zod/pull/553) [`ff227b1`](https://github.com/marcalexiei/eslint-zod/commit/ff227b105a0174903d3e394476799527b6984c7c) - fix(no-conflicting-checks): stop comparing across a callback check or past a mutated literal

- [#528](https://github.com/marcalexiei/eslint-zod/pull/528) [`b9c6460`](https://github.com/marcalexiei/eslint-zod/commit/b9c6460cf55fa1b8ad5dd0192d4fbc924a70004e) - fix(schema-error-property-style): check the `refine()` / `custom()` call itself

- [#532](https://github.com/marcalexiei/eslint-zod/pull/532) [`69844b9`](https://github.com/marcalexiei/eslint-zod/commit/69844b9951c4c96a3f24e37474f0bd9759e479e6) - fix(no-throw-in-refine): check every `.refine()` and more statement kinds

- [#559](https://github.com/marcalexiei/eslint-zod/pull/559) [`0adfa55`](https://github.com/marcalexiei/eslint-zod/commit/0adfa55e87a33f75668f30d06770cadd561eebd3) - fix(consistent-import): drop the `named` syntax from `eslint-plugin-zod-core`, whose fix imported a `z` that `zod/v4/core` does not export

- [#533](https://github.com/marcalexiei/eslint-zod/pull/533) [`20381b0`](https://github.com/marcalexiei/eslint-zod/commit/20381b078c52c2e2e12aca4f5f6d937f0a10892b) - fix(no-conflicting-checks): analyse negative bounds and `z.iso.*()` factories

- [#517](https://github.com/marcalexiei/eslint-zod/pull/517) [`316715e`](https://github.com/marcalexiei/eslint-zod/commit/316715ed8948249eb2252df7eb5cc5342de96c21) - fix: stop collapsing bounds across a type-changing method or an opaque check

- [#551](https://github.com/marcalexiei/eslint-zod/pull/551) [`59b045e`](https://github.com/marcalexiei/eslint-zod/commit/59b045ec458817f6f6f1789fc1ed9f6bf0e766ad) - fix: withhold the top-level factory fix for a second deprecated format or after a `.check()`

- [#510](https://github.com/marcalexiei/eslint-zod/pull/510) [`97169bc`](https://github.com/marcalexiei/eslint-zod/commit/97169bc0c5b8d4f0121fdad13cb9ba11da75ff83) - fix: `resolveZodImport` ignores a re-declared import binding

- [#542](https://github.com/marcalexiei/eslint-zod/pull/542) [`bbdfcf6`](https://github.com/marcalexiei/eslint-zod/commit/bbdfcf6c6f80aac6b353d3a2c6b6763cd9ea0446) - fix(no-any-schema): only suggest renaming the `any` factory itself

- [#525](https://github.com/marcalexiei/eslint-zod/pull/525) [`a13491d`](https://github.com/marcalexiei/eslint-zod/commit/a13491d8b901b6a048b6e0f2de27df4cff7edf1b) - fix(require-brand-type-parameter): accept a brand named by a value argument

- [#535](https://github.com/marcalexiei/eslint-zod/pull/535) [`b81695b`](https://github.com/marcalexiei/eslint-zod/commit/b81695bda77af47eb723085d00739c7d045c8665) - fix: cover record variants, transform factory keys and `.nonempty()`

- [#544](https://github.com/marcalexiei/eslint-zod/pull/544) [`5d0b05c`](https://github.com/marcalexiei/eslint-zod/commit/5d0b05cf27f40eabc73564ed636f9229e81086fb) - fix: stop unwrapping an argument that needs parentheses or has a comment

- [#547](https://github.com/marcalexiei/eslint-zod/pull/547) [`32006a3`](https://github.com/marcalexiei/eslint-zod/commit/32006a3843e533a2a1481f863fd47d84f438fcb0) - fix: stop judging a chain resumed after a property access by the factory before it

- [#527](https://github.com/marcalexiei/eslint-zod/pull/527) [`0798a2b`](https://github.com/marcalexiei/eslint-zod/commit/0798a2bcc12b7b564558224dd7908b156c2984f4) - fix(no-transform-in-record-key): read the key of the `record()` call itself

- [#520](https://github.com/marcalexiei/eslint-zod/pull/520) [`d353312`](https://github.com/marcalexiei/eslint-zod/commit/d3533124db19064d8718f9efd2b8dfec10248288) - fix: stop hoisting an object modifier over a method that overrides it

- [#538](https://github.com/marcalexiei/eslint-zod/pull/538) [`8ee7aa6`](https://github.com/marcalexiei/eslint-zod/commit/8ee7aa6921952a5ba691feb4ff4321fda71d9091) - fix: keep `tsc -b` output out of the published packages

## 6.0.1

### Patch Changes

- [#493](https://github.com/marcalexiei/eslint-zod/pull/493) [`43ad93e`](https://github.com/marcalexiei/eslint-zod/commit/43ad93e42d642e9f133d1bb1c81b833693f4516a) - fix(consistent-schema-var-name): keep the suggested name camelCase when `before` ends in a letter, so `user` becomes `zUser` rather than `zuser`.

- [#492](https://github.com/marcalexiei/eslint-zod/pull/492) [`1a9ab36`](https://github.com/marcalexiei/eslint-zod/commit/1a9ab36f4885a064ac74ee1fc8f132a33c06d251) - fix(consistent-schema-var-name): ignore a parse result whose chain continues after a property access, such as `.parse(input).tags.map(fn)`.

## 6.0.0

### Major Changes

- [#475](https://github.com/marcalexiei/eslint-zod/pull/475) [`c227d7a`](https://github.com/marcalexiei/eslint-zod/commit/c227d7a8e82d9e8357ee20d3a0e7fc5188ca4919) - feat!: publish ESM only and require Node `^20.19 || ^22.12 || >=24`; CommonJS configs still load the package through `require()`, under `.default`.

## 5.3.0

### Minor Changes

- [#471](https://github.com/marcalexiei/eslint-zod/pull/471) [`acb0e63`](https://github.com/marcalexiei/eslint-zod/commit/acb0e63282d938d8bbdae4d1ace132aaaed71afa) - feat: export `ZOD_TYPE_CHANGING_METHODS`, the chained methods that rebuild a schema around another type

## 5.2.0

### Minor Changes

- [#467](https://github.com/marcalexiei/eslint-zod/pull/467) [`56c6ee4`](https://github.com/marcalexiei/eslint-zod/commit/56c6ee40461d10f67dbbed70fc2fab3aff253cc0) - fix: stop `consistent-schema-var-name` and `no-dynamic-schema-value` reporting top-level helpers such as `z.toJSONSchema()` and `z.prettifyError()`

- [#466](https://github.com/marcalexiei/eslint-zod/pull/466) [`a034823`](https://github.com/marcalexiei/eslint-zod/commit/a034823741eb5a5422e67c726574c276fa925da6) - fix(no-function-scoped-schema): stop reporting top-level helpers that consume a schema, such as `z.toJSONSchema()` and `z.prettifyError()`

## 5.1.0

### Minor Changes

- [#463](https://github.com/marcalexiei/eslint-zod/pull/463) [`e10c9a7`](https://github.com/marcalexiei/eslint-zod/commit/e10c9a76a50e07334d851205a8ce7e2032a7ec33) - feat(no-conflicting-checks): report content and pattern checks another one already implies

## 5.0.1

### Patch Changes

- [#443](https://github.com/marcalexiei/eslint-zod/pull/443) [`703ed5e`](https://github.com/marcalexiei/eslint-zod/commit/703ed5e0442ef017080b3987b00253eafc7d8685) - refactor: share the numeric sub-type name lists between the base-type and immutability tables

## 5.0.0

### Major Changes

- [#439](https://github.com/marcalexiei/eslint-zod/pull/439) [`62608ad`](https://github.com/marcalexiei/eslint-zod/commit/62608ad20e6ac8084702af171c4cab34ab1672f4) - feat!: `createTracker` takes a required `kind` and records only value, type, or both kinds of import

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

## 4.0.0

### Major Changes

- [#421](https://github.com/marcalexiei/eslint-zod/pull/421) [`940c4fd`](https://github.com/marcalexiei/eslint-zod/commit/940c4fdd5316daf654bdcd9d07bea0da86f398d8) - refactor: `buildNoTransformInRecordKeyCreate` now takes the transform names instead of a `findTransformNode` strategy, and the report points at the offending method or check rather than the whole key schema.

## 3.3.0

### Minor Changes

- [#417](https://github.com/marcalexiei/eslint-zod/pull/417) [`f9c7171`](https://github.com/marcalexiei/eslint-zod/commit/f9c7171b0ff1d727ac64b621b181cc369f738c02) - feat: recognize `z.creditCard()`, the string format added in zod 4.5

### Patch Changes

- [#417](https://github.com/marcalexiei/eslint-zod/pull/417) [`f9c7171`](https://github.com/marcalexiei/eslint-zod/commit/f9c7171b0ff1d727ac64b621b181cc369f738c02) - fix(consistent-schema-var-name): stop reporting `z.validate()` and `z.validateAsync()` results, which are booleans rather than schemas

## 3.2.0

### Minor Changes

- [#413](https://github.com/marcalexiei/eslint-zod/pull/413) [`3084477`](https://github.com/marcalexiei/eslint-zod/commit/30844770e85f0e2c03e851363a2c34576fd18728) - feat: add the `prefer-top-level-factory` rule pattern

  `buildPreferTopLevelFactoryCreate(options)` rewrites a deprecated method chained on a factory into the top-level factory that replaces it (`z.string().uuid()` → `z.uuid()`), keeping the methods in between.

## 3.1.0

### Minor Changes

- [#407](https://github.com/marcalexiei/eslint-zod/pull/407) [`6929124`](https://github.com/marcalexiei/eslint-zod/commit/6929124167701b011f021a51d6e6d0cac3601c06) - feat: add the `collapse-equal-bounds` rule pattern

  `buildCollapseEqualBoundsCreate(options)` collapses an equal lower/upper bound pair into the exact check of the same domain (`length`, `size`).

- [#403](https://github.com/marcalexiei/eslint-zod/pull/403) [`5dae17b`](https://github.com/marcalexiei/eslint-zod/commit/5dae17b12d64a49f12c9ebc9b1b7ec3f9fef1370) - feat: add `no-native-enum` and `no-promise-schema` rule builders

  `buildNoNativeEnumCreate(scope)` and `buildNoPromiseSchemaCreate(scope)`, one per `rule-builders/` subpath.

### Patch Changes

- [#404](https://github.com/marcalexiei/eslint-zod/pull/404) [`cb7b394`](https://github.com/marcalexiei/eslint-zod/commit/cb7b3948e769dc78ea99669e44f0e3a463bc5c18) - chore: migrate to `changesets` v3

  Changelog entries no longer carry a `Thanks @…!` attribution; the pull request and commit links are unchanged.

## 3.0.0

### Major Changes

- [#379](https://github.com/marcalexiei/eslint-zod/pull/379) [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat!: replace `createZodSchemaImportTrack(scope)` with `scope.createTracker()`

  Migration: `const { trackZodSchemaImports } = createZodSchemaImportTrack(scope)`

  - `trackZodSchemaImports()` becomes `scope.createTracker()`.

  The `ZOD_*` vocabulary tables are now `ReadonlyArray<string>` rather than `Array<string>`, and `ZodImportScope` accepts a `ReadonlyArray<string>` of sources.

- [#400](https://github.com/marcalexiei/eslint-zod/pull/400) [`fb49a63`](https://github.com/marcalexiei/eslint-zod/commit/fb49a639c3bee68268861b6c44ea9626c0cac6c6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix!: `collectZodChainMethods` returns `[]` instead of a partial chain

  When the walk hits a call it cannot name (`z['string']()`), the whole chain is
  dropped rather than truncated, so `chain[0]` is always the factory and `chain[i]`
  always matches `collectZodSchemaConstraints`' `chainIndex`. Rules that index the
  chain must handle the empty case — detection stays permissive.

- [#379](https://github.com/marcalexiei/eslint-zod/pull/379) [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat!: schema detection is reachable only through a tracker

  `detectZodSchemaRootNode` and `isZodNumberSchemaCallExpression` are no longer
  root exports — their 2nd and 3rd parameters were the tracker's private import
  maps, which no consumer can obtain. Use `scope.createTracker()`.

  - `isZodNumberSchemaCallExpression` becomes `isZodSchemaOfType(node, schemaType)`
  - the detection result no longer carries `node`: it always returned the node you
    passed in
  - `ZodImportScope`, `ZodSchemaMeta`, `ZodSchemaImportTracker` and `ZodChainItem`
    are now exported — all were already referenced by the public API

### Minor Changes

- [#379](https://github.com/marcalexiei/eslint-zod/pull/379) [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `canonicalizeZodConstraintName` and `getZodCheckDescriptor`

  One source of truth for what a Zod check is called and what it means, so rules no longer keep private spelling tables.
  Also adds `ZOD_STRING_FORMAT_METHODS`.

- [#379](https://github.com/marcalexiei/eslint-zod/pull/379) [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add rule patterns — `@eslint-zod/utils/rule-patterns/*`

  Recurring rule shapes parameterized by the names they differ in:

  - `buildDeprecatedSchemaPropertyCreate`
  - `buildDeprecatedSchemaMethodCreate`
  - `buildPreferDedicatedFactoryCreate`

- [#400](https://github.com/marcalexiei/eslint-zod/pull/400) [`fb49a63`](https://github.com/marcalexiei/eslint-zod/commit/fb49a639c3bee68268861b6c44ea9626c0cac6c6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `getZodChainedMethodNames(meta)`

  The methods chained onto a schema, factory removed — `meta.methods` includes it
  for a namespace schema but not for a named import, so `methods.includes('safe')`
  also matches `import { number as safe }`.

  Also fixes rule-builder crashes on `z.coerce['boolean']()`, `z.string().refine()`
  and `z.literal()`; restores `prefer-nullish`'s guard against autofixing
  `optional.foo(nullable(1))`; and makes `ZOD_IMMUTABLE_SCHEMA_TYPES` spread
  `ZOD_STRING_FORMAT_NAMES`, which had drifted (`mac` was missing).

- [#382](https://github.com/marcalexiei/eslint-zod/pull/382) [`4d8edae`](https://github.com/marcalexiei/eslint-zod/commit/4d8edae60e525cd1816f87600d1f825b3146fa35) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `tracker.createSchemaVisitor({ schemaType, onSchema })`

  Builds the `{ ImportDeclaration, CallExpression }` visitor a schema rule returns, with detection and the `schemaType` filter applied.
  Replaces the hand-wired preamble, where omitting `ImportDeclaration` silently disabled detection for the whole file.

### Patch Changes

- [#379](https://github.com/marcalexiei/eslint-zod/pull/379) [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: declare `types` conditions in the exports map

  - collapses the per-builder subpath entries into a `rule-builders/*` wildcard
  - adds `"sideEffects": false`.

- [#376](https://github.com/marcalexiei/eslint-zod/pull/376) [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `buildNoAnySchemaCreate` crash on an empty schema chain

  The builder destructured the first chain item unconditionally, throwing when a computed factory call produced no walkable chain.

- [#376](https://github.com/marcalexiei/eslint-zod/pull/376) [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `buildConsistentImportCreate` generating the same namespace alias for every group

  The alias counter was only incremented inside the branch that required it to be non-zero, so it never advanced past `z`.

## 2.5.0

### Minor Changes

- [#374](https://github.com/marcalexiei/eslint-zod/pull/374) [`6bbcdf0`](https://github.com/marcalexiei/eslint-zod/commit/6bbcdf06cb37a151e36af25146297c24897846d0) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `prefer-nullish` rule builder

  New `@eslint-zod/utils/rule-builders/prefer-nullish` export: `buildPreferNullishCreate(scope)` detects the redundant optional + nullable combination across both API styles — adjacent chained methods (`zod`) and directly nested wrapper calls (`zod/mini`) — and autofixes it to `nullish`.

## 2.4.0

### Minor Changes

- [#369](https://github.com/marcalexiei/eslint-zod/pull/369) [`0913e38`](https://github.com/marcalexiei/eslint-zod/commit/0913e3886976ed138f6a060cead6297be14e8e8d) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `collectZodSchemaConstraints` tracker helper and `buildZodConstraintsRemoveFix` fixer

  `collectZodSchemaConstraints(node)` flattens a schema chain into a normalized `ZodSchemaConstraint` list covering both API styles,
  chained methods (`zod`) and `.check(...)` arguments (`zod/mini`) — so shared rule builders navigate a schema's checks through one surface.

  `buildZodConstraintsRemoveFix` builds the fixes that remove constraints of either origin, deleting a `.check(...)` call only when every one of its arguments is targeted.

- [#370](https://github.com/marcalexiei/eslint-zod/pull/370) [`5547b24`](https://github.com/marcalexiei/eslint-zod/commit/5547b24ef00a084a8aa943b6c57fd7d0cacbf8d3) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `no-unnecessary-readonly` rule builder

  New `@eslint-zod/utils/rule-builders/no-unnecessary-readonly` export:

  `buildNoUnnecessaryReadonlyCreate(scope)` detects the chained `.readonly()` (`zod`) and the `z.readonly(...)` wrapper (`zod/mini`) with the same logic.

  The package root also gains `buildZodWrapperUnwrapFix` (replace a single-argument wrapper call with its argument) and `ZOD_IMMUTABLE_SCHEMA_TYPES`
  (schema factories whose output is already immutable).

- [#373](https://github.com/marcalexiei/eslint-zod/pull/373) [`dc8e969`](https://github.com/marcalexiei/eslint-zod/commit/dc8e9696f37cf00404bd78b5d38c6268009b9c1b) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `no-conflicting-checks` rule builder and `getZodSchemaBaseType`

  New `@eslint-zod/utils/rule-builders/no-conflicting-checks` export:

  `buildNoConflictingChecksCreate(scope)` analyzes a schema's checks (via `collectZodSchemaConstraints`, both API styles) for impossible, redundant/confusing, and type-inapplicable combinations. The module also exports the `NoConflictingChecksOptions` and `NoConflictingChecksMessageIds` contracts.

  The package root gains `getZodSchemaBaseType` (schema factory name → base type category) and `ZOD_STRING_FORMAT_NAMES` (the top-level string-format factory names).

- [#364](https://github.com/marcalexiei/eslint-zod/pull/364) [`250e526`](https://github.com/marcalexiei/eslint-zod/commit/250e526df7c0870b9f7a98177fc0d9e8e0b78278) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `prefer-tuple-over-array-length` rule builder

  New `@eslint-zod/utils/rule-builders/prefer-tuple-over-array-length` export.

  `buildPreferTupleOverArrayLengthCreate(scope)` owns the whole rule — length-constraint detection via `collectZodSchemaConstraints` (both API styles), the `z.tuple([...])` autofix, and reporting. Plugins only supply their import scope.

## 2.3.0

### Minor Changes

- [#342](https://github.com/marcalexiei/eslint-zod/pull/342) [`de44e4c`](https://github.com/marcalexiei/eslint-zod/commit/de44e4cefcc64d8aae394081d777a90d3f4f283d) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `no-coerce-boolean` rule builder

  New `@eslint-zod/utils/rule-builders/no-coerce-boolean` export exposing `buildNoCoerceBooleanCreate(scope)`, which flags `z.coerce.boolean()` and suggests `z.stringbool()`.

## 2.2.0

### Minor Changes

- [#339](https://github.com/marcalexiei/eslint-zod/pull/339) [`d183319`](https://github.com/marcalexiei/eslint-zod/commit/d1833192088a28d9db1595d6bc90d02c29cb1ba5) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `no-duplicate-schema-methods` rule builder

  Exposes `buildNoDuplicateSchemaMethodsCreate(scope, excludedMethods)` from `@eslint-zod/utils/rule-builders/no-duplicate-schema-methods`.
  The builder reports a method called more than once in a single schema chain, skipping any method name passed in `excludedMethods`.

## 2.1.2

### Patch Changes

- [#327](https://github.com/marcalexiei/eslint-zod/pull/327) [`a10f137`](https://github.com/marcalexiei/eslint-zod/commit/a10f137ffcd03f6e04f6c88e53124836e0375cb6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - chore: use GitHub env for OIDC publishing

## 2.1.1

### Patch Changes

- [#325](https://github.com/marcalexiei/eslint-zod/pull/325) [`6faef20`](https://github.com/marcalexiei/eslint-zod/commit/6faef206f23c703bc2a06d8378f04fe660268a07) Thanks [@toto6038](https://github.com/toto6038)! - fix(consistent-schema-var-name): refine prefix/suffix handling

  accept a bare token matching either affix case-insensitively when only one side is configured, and use the configured affix casing in rename suggestions

## 2.1.0

### Minor Changes

- [#318](https://github.com/marcalexiei/eslint-zod/pull/318) [`b084557`](https://github.com/marcalexiei/eslint-zod/commit/b08455769d81682e32feae0cc3306e62d5b3c549) Thanks [@nimaebra](https://github.com/nimaebra)! - feat: add `no-throw-in-refine` rule builder

- [#323](https://github.com/marcalexiei/eslint-zod/pull/323) [`0544a19`](https://github.com/marcalexiei/eslint-zod/commit/0544a197af5859b8a48615e49ff09bf6bcaaf884) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(rule-builders): add `no-transform-in-record-key`

  The shared list of mutating Zod check names is also now exposed as `ZOD_MUTATING_CHECK_NAMES`.

## 2.0.0

### Major Changes

- [#315](https://github.com/marcalexiei/eslint-zod/pull/315) [`a89b181`](https://github.com/marcalexiei/eslint-zod/commit/a89b1815b75ec735abf96dd1f5ebdada1487ee35) Thanks [@nimaebra](https://github.com/nimaebra)! - refactor(utils): introduce per-file rule builder exports

  Eleven additional shared rule `create` factories have been extracted from the plugins into `@eslint-zod/utils`, joining the existing `buildPreferEnumOverLiteralUnionCreate`. All rule builders are now exported as individual sub-path exports — one per rule — instead of from the package root.

  **New exports** (`@eslint-zod/utils/rule-builders/<rule-name>`):
  - `@eslint-zod/utils/rule-builders/consistent-import`
  - `@eslint-zod/utils/rule-builders/consistent-import-source`
  - `@eslint-zod/utils/rule-builders/consistent-object-schema-type`
  - `@eslint-zod/utils/rule-builders/consistent-schema-output-type-style`
  - `@eslint-zod/utils/rule-builders/consistent-schema-var-name`
  - `@eslint-zod/utils/rule-builders/no-any-schema`
  - `@eslint-zod/utils/rule-builders/no-empty-custom-schema`
  - `@eslint-zod/utils/rule-builders/no-unknown-schema`
  - `@eslint-zod/utils/rule-builders/prefer-enum-over-literal-union`
  - `@eslint-zod/utils/rule-builders/require-brand-type-parameter`
  - `@eslint-zod/utils/rule-builders/require-error-message`
  - `@eslint-zod/utils/rule-builders/schema-error-property-style`

  **Breaking changes** (removed from `@eslint-zod/utils` root):
  - `buildPreferEnumOverLiteralUnionCreate` → now exported from `@eslint-zod/utils/rule-builders/prefer-enum-over-literal-union`
  - `IMPORT_SYNTAXES` and `ImportSyntax` → now exported from `@eslint-zod/utils/rule-builders/consistent-import`
  - `isGroupFirstImportKindValidForSyntax`, `shouldIdentifierBeRenamed`, `getNamespaceAliasNameFrom`, `ImportGroupData` → removed from public API (internal to the rule builder)

## 1.3.0

### Minor Changes

- [#314](https://github.com/marcalexiei/eslint-zod/pull/314) [`b073f04`](https://github.com/marcalexiei/eslint-zod/commit/b073f0404c06a808aa6f0712020728d97b39a26f) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `buildPreferEnumOverLiteralUnionCreate` shared rule factory

## 1.2.0

### Minor Changes

- [#293](https://github.com/marcalexiei/eslint-zod/pull/293) [`74117f9`](https://github.com/marcalexiei/eslint-zod/commit/74117f9ad94697911f42f77b958e59b4d2239017) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: adds `zodCoreImportScope`

## 1.1.0

### Minor Changes

- [#297](https://github.com/marcalexiei/eslint-zod/pull/297) [`66dcfca`](https://github.com/marcalexiei/eslint-zod/commit/66dcfca1aceb8c5dc2d85e4e06147561495491e6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: remove `detectZodSchemaRootNode` from export

  This is technically a breaking change, but since this package is only used by the plugin within this repository, I'm releasing it as a minor version.

  If you were relying on the previous behavior, feel free to open an issue and I’ll cut a follow-up release to restore compatibility.

- [#297](https://github.com/marcalexiei/eslint-zod/pull/297) [`66dcfca`](https://github.com/marcalexiei/eslint-zod/commit/66dcfca1aceb8c5dc2d85e4e06147561495491e6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: `detectZodSchemaRootNode#schemaType` should be the zod public name not the local one

### Patch Changes

- [#295](https://github.com/marcalexiei/eslint-zod/pull/295) [`38429ee`](https://github.com/marcalexiei/eslint-zod/commit/38429ee89494bc1605d3248b10e46c8a6ec0a58c) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(ZodImportScope): simplify types using sources directly

## 1.0.1

### Patch Changes

- [#286](https://github.com/marcalexiei/eslint-zod/pull/286) [`9cfe2bb`](https://github.com/marcalexiei/eslint-zod/commit/9cfe2bb16ba1a70f12bf81a6bd1ed47e97200889) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `dist` folder is missing in published package

## 1.0.0

### Major Changes

- [#277](https://github.com/marcalexiei/eslint-zod/pull/277) [`349991f`](https://github.com/marcalexiei/eslint-zod/commit/349991fc60a7909af4830d0aa117d2878f306557) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: initial release
