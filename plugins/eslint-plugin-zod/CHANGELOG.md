# eslint-plugin-zod

## 4.13.0

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

## 4.12.1

### Patch Changes

- [#427](https://github.com/marcalexiei/eslint-zod/pull/427) [`39c6b15`](https://github.com/marcalexiei/eslint-zod/commit/39c6b154917d0ce71aa0dc969f0bc0cac162da64) - fix(array-style): only rewrite `z.array()` calls the fix can preserve

  The `style: "method"` fix now skips calls with extra arguments, type arguments, optional chaining, an element needing parentheses, or a comment it would drop.
  A `z` that is shadowed or imported as a type is ignored.

- [#421](https://github.com/marcalexiei/eslint-zod/pull/421) [`940c4fd`](https://github.com/marcalexiei/eslint-zod/commit/940c4fdd5316daf654bdcd9d07bea0da86f398d8) - refactor: `buildNoTransformInRecordKeyCreate` now takes the transform names instead of a `findTransformNode` strategy, and the report points at the offending method or check rather than the whole key schema.
- Updated dependencies [[`940c4fd`](https://github.com/marcalexiei/eslint-zod/commit/940c4fdd5316daf654bdcd9d07bea0da86f398d8)]:
  - @eslint-zod/utils@4.0.0

## 4.12.0

### Minor Changes

- [#417](https://github.com/marcalexiei/eslint-zod/pull/417) [`f9c7171`](https://github.com/marcalexiei/eslint-zod/commit/f9c7171b0ff1d727ac64b621b181cc369f738c02) - feat: recognize `z.creditCard()`, the string format added in zod 4.5

### Patch Changes

- [#417](https://github.com/marcalexiei/eslint-zod/pull/417) [`f9c7171`](https://github.com/marcalexiei/eslint-zod/commit/f9c7171b0ff1d727ac64b621b181cc369f738c02) - fix(consistent-schema-var-name): stop reporting `z.validate()` and `z.validateAsync()` results, which are booleans rather than schemas
- Updated dependencies [[`f9c7171`](https://github.com/marcalexiei/eslint-zod/commit/f9c7171b0ff1d727ac64b621b181cc369f738c02), [`f9c7171`](https://github.com/marcalexiei/eslint-zod/commit/f9c7171b0ff1d727ac64b621b181cc369f738c02)]:
  - @eslint-zod/utils@3.3.0

## 4.11.0

### Minor Changes

- [#410](https://github.com/marcalexiei/eslint-zod/pull/410) [`29fcc59`](https://github.com/marcalexiei/eslint-zod/commit/29fcc596a4f1bcadb6464abe815c09298ad69fc0) - feat: add `prefer-map-set-size-over-min-max` rule, which collapses `.min(n).max(n)` with the same value on a set or map schema into `.size(n)`

### Patch Changes

- [#413](https://github.com/marcalexiei/eslint-zod/pull/413) [`3084477`](https://github.com/marcalexiei/eslint-zod/commit/30844770e85f0e2c03e851363a2c34576fd18728) - fix: report deprecated methods reached through a computed member

  `no-number-schema-with-int`, `no-string-schema-with-uuid` and `prefer-top-level-string-formats` now report `z['string']().uuid()` and friends, without offering a fix — matching `no-number-schema-with-safe`.

- Updated dependencies [[`3084477`](https://github.com/marcalexiei/eslint-zod/commit/30844770e85f0e2c03e851363a2c34576fd18728)]:
  - @eslint-zod/utils@3.2.0

## 4.10.0

### Minor Changes

- [#407](https://github.com/marcalexiei/eslint-zod/pull/407) [`6929124`](https://github.com/marcalexiei/eslint-zod/commit/6929124167701b011f021a51d6e6d0cac3601c06) - feat: add `prefer-string-length-over-min-max` rule

  Collapses `.min(n).max(n)` with the same value on a string schema to `.length(n)`.
  Not enabled in `recommended`.

### Patch Changes

- [#403](https://github.com/marcalexiei/eslint-zod/pull/403) [`5dae17b`](https://github.com/marcalexiei/eslint-zod/commit/5dae17b12d64a49f12c9ebc9b1b7ec3f9fef1370) - refactor: build `no-native-enum` and `no-promise-schema` from the shared rule builders

  No behavior change.

- [#404](https://github.com/marcalexiei/eslint-zod/pull/404) [`cb7b394`](https://github.com/marcalexiei/eslint-zod/commit/cb7b3948e769dc78ea99669e44f0e3a463bc5c18) - chore: migrate to `changesets` v3

  Changelog entries no longer carry a `Thanks @…!` attribution; the pull request and commit links are unchanged.

- Updated dependencies [[`6929124`](https://github.com/marcalexiei/eslint-zod/commit/6929124167701b011f021a51d6e6d0cac3601c06), [`5dae17b`](https://github.com/marcalexiei/eslint-zod/commit/5dae17b12d64a49f12c9ebc9b1b7ec3f9fef1370), [`cb7b394`](https://github.com/marcalexiei/eslint-zod/commit/cb7b3948e769dc78ea99669e44f0e3a463bc5c18)]:
  - @eslint-zod/utils@3.1.0

## 4.9.1

### Patch Changes

- [#376](https://github.com/marcalexiei/eslint-zod/pull/376) [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `consistent-import` alias collision between two zod sources

  Every rewritten import group received the alias `z`, so a file importing from both `zod` and `zod/v3` was fixed into two `import * as z` declarations.
  Each group now gets a distinct alias.

- [#383](https://github.com/marcalexiei/eslint-zod/pull/383) [`6b4122e`](https://github.com/marcalexiei/eslint-zod/commit/6b4122ebe44bdd245afdea04661c3947094ee01d) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `no-number-schema-with-safe`, `-finite` and `-step` missed the deprecated method mid-chain

  All three required the deprecated call to be the last one in the chain, so `z.number().safe().min(0)` went unreported while `z.number().safe()` was flagged.
  `-step` additionally renamed the chain's outermost property, which would have rewritten `.min()` instead of `.step()`.

- [#379](https://github.com/marcalexiei/eslint-zod/pull/379) [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `no-conflicting-checks` now recognises every deprecated chained string format

  `.ipv4()`, `.guid()`, `.ksuid()`, `.uuidv4()`, `.xid()` and others were missing
  from the rule's table, so conflicts involving them went unreported.

- [#400](https://github.com/marcalexiei/eslint-zod/pull/400) [`fb49a63`](https://github.com/marcalexiei/eslint-zod/commit/fb49a639c3bee68268861b6c44ea9626c0cac6c6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `no-conflicting-checks` no longer flags a narrowed string format as impossible

  `z.string().uuid().uuidv4()` and `z.string().guid().uuid()` are refinements, not
  contradictions — the GUID/UUID family nests. Two different UUID versions still
  conflict.

  Also fixes `no-number-schema-with-safe`/`-step`/`-finite` matching the factory of
  an aliased import (`import { number as safe }`), and stops `no-native-enum` and
  `prefer-string-schema-with-trim` crashing on a computed factory.

- [#376](https://github.com/marcalexiei/eslint-zod/pull/376) [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `no-any-schema` crash on a computed factory call

  The rule threw on `z['any']()`.
  It now reports the schema without a rename suggestion.

- Updated dependencies [[`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`fb49a63`](https://github.com/marcalexiei/eslint-zod/commit/fb49a639c3bee68268861b6c44ea9626c0cac6c6), [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd), [`dfa974b`](https://github.com/marcalexiei/eslint-zod/commit/dfa974b3bde278fee13f5e0fc2b2f8f7fffc4e50), [`b1f666a`](https://github.com/marcalexiei/eslint-zod/commit/b1f666a0c86b7cfb335d60307aa0b9aa697bb1dd), [`fb49a63`](https://github.com/marcalexiei/eslint-zod/commit/fb49a639c3bee68268861b6c44ea9626c0cac6c6), [`4d8edae`](https://github.com/marcalexiei/eslint-zod/commit/4d8edae60e525cd1816f87600d1f825b3146fa35)]:
  - @eslint-zod/utils@3.0.0

## 4.9.0

### Minor Changes

- [#374](https://github.com/marcalexiei/eslint-zod/pull/374) [`6bbcdf0`](https://github.com/marcalexiei/eslint-zod/commit/6bbcdf06cb37a151e36af25146297c24897846d0) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `prefer-nullish` rule

  Flags chaining `.optional()` and `.nullable()` (in either order) when the two methods are directly adjacent, and autofixes the pair to `.nullish()`. Enabled in `recommended`.

### Patch Changes

- Updated dependencies [[`6bbcdf0`](https://github.com/marcalexiei/eslint-zod/commit/6bbcdf06cb37a151e36af25146297c24897846d0)]:
  - @eslint-zod/utils@2.5.0

## 4.8.0

### Minor Changes

- [#373](https://github.com/marcalexiei/eslint-zod/pull/373) [`dc8e969`](https://github.com/marcalexiei/eslint-zod/commit/dc8e9696f37cf00404bd78b5d38c6268009b9c1b) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `no-conflicting-checks` rule

  Flags check combinations that can never match (`.gt(10).lt(5)`, `.uuid().email()`, `.uuid().max(1)`) or are redundant/confusing (`.gt(0).positive()`, `.lowercase().uppercase()`).

  Three option-gated categories, all on by default; no autofix.

- [#370](https://github.com/marcalexiei/eslint-zod/pull/370) [`5547b24`](https://github.com/marcalexiei/eslint-zod/commit/5547b24ef00a084a8aa943b6c57fd7d0cacbf8d3) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `no-unnecessary-readonly` rule

  Flags `.readonly()` on schemas whose output is already immutable — primitives/scalars, number sub-types, top-level string formats, and doubled `readonly`.

  Autofix removes the call.

- [#364](https://github.com/marcalexiei/eslint-zod/pull/364) [`250e526`](https://github.com/marcalexiei/eslint-zod/commit/250e526df7c0870b9f7a98177fc0d9e8e0b78278) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `prefer-tuple-over-array-length` rule

  Flags a length-constrained `z.array()` (`.length()`, `.min()`, `.max()`) and suggests `z.tuple()`, which preserves the element count in the inferred type.

  Autofixes `.length(n)` and equal-bound `.min(n).max(n)` to a fixed tuple, and `.min(n)` to a rest tuple; everything else is report-only.

### Patch Changes

- Updated dependencies [[`0913e38`](https://github.com/marcalexiei/eslint-zod/commit/0913e3886976ed138f6a060cead6297be14e8e8d), [`5547b24`](https://github.com/marcalexiei/eslint-zod/commit/5547b24ef00a084a8aa943b6c57fd7d0cacbf8d3), [`dc8e969`](https://github.com/marcalexiei/eslint-zod/commit/dc8e9696f37cf00404bd78b5d38c6268009b9c1b), [`250e526`](https://github.com/marcalexiei/eslint-zod/commit/250e526df7c0870b9f7a98177fc0d9e8e0b78278)]:
  - @eslint-zod/utils@2.4.0

## 4.7.1

### Patch Changes

- [#357](https://github.com/marcalexiei/eslint-zod/pull/357) [`101b1ae`](https://github.com/marcalexiei/eslint-zod/commit/101b1ae988b6bbd2bfba873ba1074386dff0dc7c) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: remove deprecated `no-string-schema-with-uuid` rule from the `recommended` config

  The rule is deprecated and superseded by `prefer-top-level-string-formats`, which is also enabled in `recommended`.
  With both rules enabled `z.string().uuid()` produced duplicate reports.

## 4.7.0

### Minor Changes

- [#342](https://github.com/marcalexiei/eslint-zod/pull/342) [`de44e4c`](https://github.com/marcalexiei/eslint-zod/commit/de44e4cefcc64d8aae394081d777a90d3f4f283d) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `no-coerce-boolean` rule

  Disallow `z.coerce.boolean()`, which relies on `Boolean()` and treats any non-empty string (including `"false"`) as `true`.\
  The rule offers a suggestion to replace it with `z.stringbool()`.

### Patch Changes

- [#345](https://github.com/marcalexiei/eslint-zod/pull/345) [`338e96e`](https://github.com/marcalexiei/eslint-zod/commit/338e96ed2fc4455be05fbc639b715972aba06524) Thanks [@skyswordw](https://github.com/skyswordw)! - fix(no-duplicate-schema-methods): allow chaining of array methods

  Repeated `.array()` calls are now recognized as valid nested array schemas instead of being flagged as duplicate schema method usage.

- Updated dependencies [[`de44e4c`](https://github.com/marcalexiei/eslint-zod/commit/de44e4cefcc64d8aae394081d777a90d3f4f283d)]:
  - @eslint-zod/utils@2.3.0

## 4.6.0

### Minor Changes

- [#339](https://github.com/marcalexiei/eslint-zod/pull/339) [`d183319`](https://github.com/marcalexiei/eslint-zod/commit/d1833192088a28d9db1595d6bc90d02c29cb1ba5) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `no-duplicate-schema-methods` rule

  Disallows calling the same schema method more than once in a single chain.\
  Methods that are valid to repeat are excluded from the check:
  - `and`
  - `check`
  - `or`
  - `pipe`
  - `refine`
  - `register`
  - `superRefine`
  - `transform`

### Patch Changes

- Updated dependencies [[`d183319`](https://github.com/marcalexiei/eslint-zod/commit/d1833192088a28d9db1595d6bc90d02c29cb1ba5)]:
  - @eslint-zod/utils@2.2.0

## 4.5.4

### Patch Changes

- [#327](https://github.com/marcalexiei/eslint-zod/pull/327) [`a10f137`](https://github.com/marcalexiei/eslint-zod/commit/a10f137ffcd03f6e04f6c88e53124836e0375cb6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - chore: use GitHub env for OIDC publishing

- Updated dependencies [[`a10f137`](https://github.com/marcalexiei/eslint-zod/commit/a10f137ffcd03f6e04f6c88e53124836e0375cb6)]:
  - @eslint-zod/utils@2.1.2

## 4.5.3

### Patch Changes

- [#325](https://github.com/marcalexiei/eslint-zod/pull/325) [`6faef20`](https://github.com/marcalexiei/eslint-zod/commit/6faef206f23c703bc2a06d8378f04fe660268a07) Thanks [@toto6038](https://github.com/toto6038)! - fix(consistent-schema-var-name): refine prefix/suffix handling

  accept a bare token matching either affix case-insensitively when only one side is configured, and use the configured affix casing in rename suggestions

- Updated dependencies [[`6faef20`](https://github.com/marcalexiei/eslint-zod/commit/6faef206f23c703bc2a06d8378f04fe660268a07)]:
  - @eslint-zod/utils@2.1.1

## 4.5.2

### Patch Changes

- [#323](https://github.com/marcalexiei/eslint-zod/pull/323) [`0544a19`](https://github.com/marcalexiei/eslint-zod/commit/0544a197af5859b8a48615e49ff09bf6bcaaf884) Thanks [@marcalexiei](https://github.com/marcalexiei)! - refactor(no-transform-in-record-key): use `@eslint-zod/utils/rule-builders/no-transform-in-record-key`

- [#318](https://github.com/marcalexiei/eslint-zod/pull/318) [`b084557`](https://github.com/marcalexiei/eslint-zod/commit/b08455769d81682e32feae0cc3306e62d5b3c549) Thanks [@nimaebra](https://github.com/nimaebra)! - refactor(no-throw-in-refine): use `@eslint-zod/utils/rule-builders/no-throw-in-refine`

- [#321](https://github.com/marcalexiei/eslint-zod/pull/321) [`15578f4`](https://github.com/marcalexiei/eslint-zod/commit/15578f4873b5271cd4d27cef80faef451915797b) Thanks [@nimaebra](https://github.com/nimaebra)! - fix(no-transform-in-record-key): add `normalize` and `overwrite` methods

- Updated dependencies [[`b084557`](https://github.com/marcalexiei/eslint-zod/commit/b08455769d81682e32feae0cc3306e62d5b3c549), [`0544a19`](https://github.com/marcalexiei/eslint-zod/commit/0544a197af5859b8a48615e49ff09bf6bcaaf884)]:
  - @eslint-zod/utils@2.1.0

## 4.5.1

### Patch Changes

- [#315](https://github.com/marcalexiei/eslint-zod/pull/315) [`a89b181`](https://github.com/marcalexiei/eslint-zod/commit/a89b1815b75ec735abf96dd1f5ebdada1487ee35) Thanks [@nimaebra](https://github.com/nimaebra)! - refactor: update rule builder imports to per-file `@eslint-zod/utils/rule-builders/*` paths

- Updated dependencies [[`a89b181`](https://github.com/marcalexiei/eslint-zod/commit/a89b1815b75ec735abf96dd1f5ebdada1487ee35)]:
  - @eslint-zod/utils@2.0.0

## 4.5.0

### Minor Changes

- [#311](https://github.com/marcalexiei/eslint-zod/pull/311) [`6b98008`](https://github.com/marcalexiei/eslint-zod/commit/6b98008f68a7173e853240e2c0b060957086b03c) Thanks [@nimaebra](https://github.com/nimaebra)! - feat: add `no-promise-schema` rule

### Patch Changes

- [#314](https://github.com/marcalexiei/eslint-zod/pull/314) [`b073f04`](https://github.com/marcalexiei/eslint-zod/commit/b073f0404c06a808aa6f0712020728d97b39a26f) Thanks [@marcalexiei](https://github.com/marcalexiei)! - refactor: extract `prefer-enum-over-literal-union` rule logic into shared `@eslint-zod/utils` factory

- Updated dependencies [[`b073f04`](https://github.com/marcalexiei/eslint-zod/commit/b073f0404c06a808aa6f0712020728d97b39a26f)]:
  - @eslint-zod/utils@1.3.0

## 4.4.0

### Minor Changes

- [#307](https://github.com/marcalexiei/eslint-zod/pull/307) [`365bdec`](https://github.com/marcalexiei/eslint-zod/commit/365bdec8aadcc605245c4987e0d44842033790c3) Thanks [@nimaebra](https://github.com/nimaebra)! - feat: add `no-schema-with-is-nullable` rule

## 4.3.0

### Minor Changes

- [#305](https://github.com/marcalexiei/eslint-zod/pull/305) [`53a0796`](https://github.com/marcalexiei/eslint-zod/commit/53a07963acf527862e6de341995a99fbc5f15d4b) Thanks [@nimaebra](https://github.com/nimaebra)! - feat: add `no-schema-with-is-optional` rule

- [#303](https://github.com/marcalexiei/eslint-zod/pull/303) [`1122ec9`](https://github.com/marcalexiei/eslint-zod/commit/1122ec9322c76b547ca25695a1a5d9af5ec4a541) Thanks [@nimaebra](https://github.com/nimaebra)! - feat: add `prefer-strict-object` and `prefer-loose-object` rules

## 4.2.2

### Patch Changes

- Updated dependencies [[`74117f9`](https://github.com/marcalexiei/eslint-zod/commit/74117f9ad94697911f42f77b958e59b4d2239017)]:
  - @eslint-zod/utils@1.2.0

## 4.2.1

### Patch Changes

- [#297](https://github.com/marcalexiei/eslint-zod/pull/297) [`66dcfca`](https://github.com/marcalexiei/eslint-zod/commit/66dcfca1aceb8c5dc2d85e4e06147561495491e6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - refactor: make fixer return `null` instead of having two branch for `context.report` (1 with and 1 without the fixer)

- Updated dependencies [[`66dcfca`](https://github.com/marcalexiei/eslint-zod/commit/66dcfca1aceb8c5dc2d85e4e06147561495491e6), [`66dcfca`](https://github.com/marcalexiei/eslint-zod/commit/66dcfca1aceb8c5dc2d85e4e06147561495491e6), [`38429ee`](https://github.com/marcalexiei/eslint-zod/commit/38429ee89494bc1605d3248b10e46c8a6ec0a58c)]:
  - @eslint-zod/utils@1.1.0

## 4.2.0

### Minor Changes

- [#294](https://github.com/marcalexiei/eslint-zod/pull/294) [`ce6b90d`](https://github.com/marcalexiei/eslint-zod/commit/ce6b90df2055564296ee955a3ca7c6570a33c973) Thanks [@nimaebra](https://github.com/nimaebra)! - feat: add `no-native-enum` rule

## 4.1.0

### Minor Changes

- [#288](https://github.com/marcalexiei/eslint-zod/pull/288) [`482950a`](https://github.com/marcalexiei/eslint-zod/commit/482950abe122cd0ba2c9ab73f54f0823469a3d99) Thanks [@nimaebra](https://github.com/nimaebra)! - feat: add new `prefer-top-level-string-formats` rule

  The new `zod/prefer-top-level-string-formats` rule consolidates deprecated `z.string().<format>()` checks into a single rule.

  ### Migration from `no-string-schema-with-uuid`

  ```diff
    // eslint.config.js
    rules: {
  -   'zod/no-string-schema-with-uuid': 'error',
  +   'zod/prefer-top-level-string-formats': 'error',
    }
  ```

  If you rely on the `recommended` config, no manual change is needed. The config has been updated automatically.

  `zod/no-string-schema-with-uuid` is now deprecated and will be removed in a future major release.

## 4.0.1

### Patch Changes

- [#286](https://github.com/marcalexiei/eslint-zod/pull/286) [`9cfe2bb`](https://github.com/marcalexiei/eslint-zod/commit/9cfe2bb16ba1a70f12bf81a6bd1ed47e97200889) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `dist` folder is missing in published package

- Updated dependencies [[`9cfe2bb`](https://github.com/marcalexiei/eslint-zod/commit/9cfe2bb16ba1a70f12bf81a6bd1ed47e97200889)]:
  - @eslint-zod/utils@1.0.1

## 4.0.0

### Major Changes

- [#279](https://github.com/marcalexiei/eslint-zod/pull/279) [`b3fe829`](https://github.com/marcalexiei/eslint-zod/commit/b3fe829b06e98ded153ba12b00201e476d3850df) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat!: remove `zod/require-schema-suffix` rule

  Use `zod/consistent-schema-var-name` instead:

  ```diff
    // eslint.config.js
    import { defineConfig } from 'eslint/config';
    import eslintPluginZod from 'eslint-plugin-zod';

    export default defineConfig(
      {
        plugins: {
          zod: eslintPluginZod,
        },
        rules: {
  -       'zod/require-schema-suffix': 'error',
  +       'zod/consistent-schema-var-name': 'error',
        }
      }
    );
  ```

- [#279](https://github.com/marcalexiei/eslint-zod/pull/279) [`b3fe829`](https://github.com/marcalexiei/eslint-zod/commit/b3fe829b06e98ded153ba12b00201e476d3850df) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat!: remove `zod/prefer-namespace-import` rule

  Use `zod/consistent-import` instead:

  ```diff
    // eslint.config.js
    import { defineConfig } from 'eslint/config';
    import eslintPluginZod from 'eslint-plugin-zod';

    export default defineConfig(
      {
        plugins: {
          zod: eslintPluginZod,
        },
        rules: {
  -       'zod/prefer-namespace-import': 'error',
  +       'zod/consistent-import': 'error', // Uses 'namespace' syntax as default
        }
      }
    );
  ```

- [#277](https://github.com/marcalexiei/eslint-zod/pull/277) [`349991f`](https://github.com/marcalexiei/eslint-zod/commit/349991fc60a7909af4830d0aa117d2878f306557) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat!: split `zod-mini` rules in a separate plugin

  `eslint-plugin-zod` now only applies to `zod`, `zod/v4`, and `zod/v3` imports.
  Rules no longer fire on `zod/mini` or `zod/v4-mini` imports.

  If you were using `eslint-plugin-zod` to lint Zod Mini schemas, install the new dedicated plugin:

  ```shell
  npm i --save-dev eslint-plugin-zod-mini
  ```

  Then replace `configs.recommendedMini` with the new plugin's `configs.recommended`:

  ```diff
    // eslint.config.js
    import { defineConfig } from 'eslint/config';
    import eslint from '@eslint/js';
    import eslintPluginZod from 'eslint-plugin-zod';
  + import eslintPluginZodMini from 'eslint-plugin-zod-mini';

    export default defineConfig(
      eslint.configs.recommended,
      eslintPluginZod.configs.recommended,
  -   eslintPluginZod.configs.recommendedMini,
  +   eslintPluginZodMini.configs.recommended,
    );
  ```

- [#282](https://github.com/marcalexiei/eslint-zod/pull/282) [`2b5e41d`](https://github.com/marcalexiei/eslint-zod/commit/2b5e41d7f79f28e173171b7542ca860886da0792) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(consistent-import-source)!: rules now apply only to zod imports

  The plugin now ignores `zod/mini` and `zod/v4-mini` imports

### Patch Changes

- Updated dependencies [[`349991f`](https://github.com/marcalexiei/eslint-zod/commit/349991fc60a7909af4830d0aa117d2878f306557)]:
  - @eslint-zod/utils@1.0.0

## 3.12.1

### Patch Changes

- [`8803483`](https://github.com/marcalexiei/eslint-zod/commit/8803483726ea1c00bca0e0b725d3ea6a8d29c4e5) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: rules documentation reference now point to the installed tag rather than HEAD

## 3.12.0

### Minor Changes

- [#269](https://github.com/marcalexiei/eslint-zod/pull/269) [`63607d9`](https://github.com/marcalexiei/eslint-zod/commit/63607d95bdf1fc2c1afb492681ac3649af782833) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(prefer-trim-before-string-length-checks): add new rule

## 3.11.0

### Minor Changes

- [#261](https://github.com/marcalexiei/eslint-zod/pull/261) [`5c36c93`](https://github.com/marcalexiei/eslint-zod/commit/5c36c931616e785c552c5a7f3c95dc99d7ea5b0d) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(consistent-schema-var-name): rename

  `3.10.0` changelog entry has been updated accordingly.

## 3.10.0

### Minor Changes

- [#259](https://github.com/marcalexiei/eslint-zod/pull/259) [`05066a4`](https://github.com/marcalexiei/eslint-zod/commit/05066a426468a35cea07f25d33b8125bb5a5fa0a) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(consistent-schema-var-name): add new rule

  The new `zod/consistent-schema-var-name` rule replaces `zod/require-schema-suffix` and supports enforcing both a prefix (`before`) and/or a suffix (`after`) on Zod schema variable names.

  The default behavior is identical to `require-schema-suffix`: it enforces an `'Schema'` suffix.

  ### Migration from `require-schema-suffix`

  ```diff
    // eslint.config.js
    rules: {
  -   'zod/require-schema-suffix': 'error',
  +   'zod/consistent-schema-var-name': 'error',
    }
  ```

  If you rely on the `recommended` or `recommendedMini` configs, no manual changes are needed — both configs have been updated automatically.

  `zod/require-schema-suffix` is now deprecated and will be removed in a future major release.

## 3.9.0

### Minor Changes

- [#254](https://github.com/marcalexiei/eslint-zod/pull/254) [`95f008c`](https://github.com/marcalexiei/eslint-zod/commit/95f008c3f54a928392caeb06349b9daf51dd27da) Thanks [@andidev](https://github.com/andidev)! - feat(no-number-schema-with-step): add new rule

- [#254](https://github.com/marcalexiei/eslint-zod/pull/254) [`95f008c`](https://github.com/marcalexiei/eslint-zod/commit/95f008c3f54a928392caeb06349b9daf51dd27da) Thanks [@andidev](https://github.com/andidev)! - feat(no-number-schema-with-safe): add new rule

- [#254](https://github.com/marcalexiei/eslint-zod/pull/254) [`95f008c`](https://github.com/marcalexiei/eslint-zod/commit/95f008c3f54a928392caeb06349b9daf51dd27da) Thanks [@andidev](https://github.com/andidev)! - feat(no-number-schema-with-is-int): add new rule

- [#254](https://github.com/marcalexiei/eslint-zod/pull/254) [`95f008c`](https://github.com/marcalexiei/eslint-zod/commit/95f008c3f54a928392caeb06349b9daf51dd27da) Thanks [@andidev](https://github.com/andidev)! - feat(no-number-schema-with-is-finite): add new rule

- [#254](https://github.com/marcalexiei/eslint-zod/pull/254) [`95f008c`](https://github.com/marcalexiei/eslint-zod/commit/95f008c3f54a928392caeb06349b9daf51dd27da) Thanks [@andidev](https://github.com/andidev)! - feat(no-number-schema-with-finite): add new rule

## 3.8.0

### Minor Changes

- [#251](https://github.com/marcalexiei/eslint-zod/pull/251) [`435514a`](https://github.com/marcalexiei/eslint-zod/commit/435514abc6f677de64476fa5e8e0e03a4bf4ad79) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(consistent-schema-output-type-style): add new rule

## 3.7.0

### Minor Changes

- [#236](https://github.com/marcalexiei/eslint-zod/pull/236) [`1c536be`](https://github.com/marcalexiei/eslint-zod/commit/1c536be3e151c122ac3f5a2fd9b43f2a894b8f2f) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add support for `oxlint`

  Installation instructions are available in the [README](https://github.com/marcalexiei/eslint-zod/tree/oxlint?tab=readme-ov-file#oxlint)!

## 3.6.0

### Minor Changes

- [#247](https://github.com/marcalexiei/eslint-zod/pull/247) [`3fcd70a`](https://github.com/marcalexiei/eslint-zod/commit/3fcd70a29ea18c1ffd83959b06b4506b064b1365) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(no-transform-in-record-key): add new rule

## 3.5.4

### Patch Changes

- [#244](https://github.com/marcalexiei/eslint-zod/pull/244) [`403978a`](https://github.com/marcalexiei/eslint-zod/commit/403978a81a4632af82163c2cbed78144e2a03633) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(prefer-string-schema-with-trim): skip record key schemas to prevent data loss

## 3.5.3

### Patch Changes

- [#238](https://github.com/marcalexiei/eslint-zod/pull/238) [`c3b5541`](https://github.com/marcalexiei/eslint-zod/commit/c3b55410181339aac7e9b315cd8afc06e0c7fa74) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(require-error-message): report missing parameter error only on schema node, not entire chain

- [#241](https://github.com/marcalexiei/eslint-zod/pull/241) [`241796d`](https://github.com/marcalexiei/eslint-zod/commit/241796d85ea39d93fe1b05a6f67adad463c67cd5) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(require-error-message): check all refine/custom methods in chain

- [#238](https://github.com/marcalexiei/eslint-zod/pull/238) [`560aa16`](https://github.com/marcalexiei/eslint-zod/commit/560aa16634cfc5a5c6017ff91d4d211b4d5c24ce) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(no-empty-custom-schema): chaining method to a custom schema reports a false positive

## 3.5.2

### Patch Changes

- [#235](https://github.com/marcalexiei/eslint-zod/pull/235) [`a401c09`](https://github.com/marcalexiei/eslint-zod/commit/a401c0935255a9d52aaaf57832e7b9ee5542133b) Thanks [@marcalexiei](https://github.com/marcalexiei)! - chore: migrate build to `tsdown`

- [#233](https://github.com/marcalexiei/eslint-zod/pull/233) [`755c1e4`](https://github.com/marcalexiei/eslint-zod/commit/755c1e478c7d70c093d5515d8ae5f9681407039d) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(array-style): fixer removes additional methods in the chain

## 3.5.1

### Patch Changes

- [#227](https://github.com/marcalexiei/eslint-zod/pull/227) [`694e492`](https://github.com/marcalexiei/eslint-zod/commit/694e4927493512b086fc3cc58134e7c71ad2ff9c) Thanks [@mikededo](https://github.com/mikededo)! - fix(require-schema-suffix): Error formatting utilities should not be reported

## 3.5.0

### Minor Changes

- [#220](https://github.com/marcalexiei/eslint-zod/pull/220) [`8d09bf4`](https://github.com/marcalexiei/eslint-zod/commit/8d09bf4bffdc6fee9d471015a41db1c62347dd00) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add support for ESLint 10

## 3.4.0

### Minor Changes

- [#217](https://github.com/marcalexiei/eslint-zod/pull/217) [`5f7492a`](https://github.com/marcalexiei/eslint-zod/commit/5f7492a988320913cdca83a12478afd705000b35) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: add `zod/mini` partial support

## 3.3.0

### Minor Changes

- [#211](https://github.com/marcalexiei/eslint-zod/pull/211) [`4357023`](https://github.com/marcalexiei/eslint-zod/commit/4357023bdef806b838fd861b5d930cecfcc9a150) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(prefer-string-schema-with-trim): add new rule

  Enforce `z.string().trim()` to prevent accidental leading/trailing whitespace.

### Patch Changes

- [#213](https://github.com/marcalexiei/eslint-zod/pull/213) [`5970085`](https://github.com/marcalexiei/eslint-zod/commit/5970085d1f4c275c050835d9fa41d5a8f436af50) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(build-zod-chain-replacement-fix): retain function parameters when applying fix

  this change is applied to the following rules:
  - `no-number-schema-with-int`
  - `no-string-schema-with-uuid`

## 3.2.0

### Minor Changes

- [#205](https://github.com/marcalexiei/eslint-zod/pull/205) [`f33e7b9`](https://github.com/marcalexiei/eslint-zod/commit/f33e7b9d14df7a0b1fc08e4d45762ea9c7ae091d) Thanks [@pourdaavar](https://github.com/pourdaavar)! - feat(no-string-schema-with-uuid): add new rule

## 3.1.0

### Minor Changes

- [#201](https://github.com/marcalexiei/eslint-zod/pull/201) [`6b1eece`](https://github.com/marcalexiei/eslint-zod/commit/6b1eecec612aac02eac2bf6536d26d1da27f98ca) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(prefer-namespace-import): deprecate rule in favour of `zod/consistent-import`

- [#179](https://github.com/marcalexiei/eslint-zod/pull/179) [`51563cf`](https://github.com/marcalexiei/eslint-zod/commit/51563cfc91c68c94caf27cbfac10057f02ca55ba) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(consistent-import): add new rule

## 3.0.2

### Patch Changes

- [#195](https://github.com/marcalexiei/eslint-zod/pull/195) [`45bbc49`](https://github.com/marcalexiei/eslint-zod/commit/45bbc49ee7a52d868b57d872e7e2b7d4c3d61c44) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(array-style): use collectZodChainMethods to improve detection logic

- [#197](https://github.com/marcalexiei/eslint-zod/pull/197) [`187d7a2`](https://github.com/marcalexiei/eslint-zod/commit/187d7a2e6d4792d5c5fed60116c5a5d89be5fc70) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(prefer-meta-last): simplify detect logic

- [#197](https://github.com/marcalexiei/eslint-zod/pull/197) [`187d7a2`](https://github.com/marcalexiei/eslint-zod/commit/187d7a2e6d4792d5c5fed60116c5a5d89be5fc70) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(no-number-schema-with-int): simplify detect logic

- [#193](https://github.com/marcalexiei/eslint-zod/pull/193) [`2f2184d`](https://github.com/marcalexiei/eslint-zod/commit/2f2184d839c67a1d676281257ef7b320cb33da70) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(no-throw-in-refine): missing report when refine is not the last method

- [#196](https://github.com/marcalexiei/eslint-zod/pull/196) [`fb0fe80`](https://github.com/marcalexiei/eslint-zod/commit/fb0fe8046cc0b50713992d6f393a1ff93f9a3bce) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(prefer-enum-over-literal-union): optional string literal unions are not flagged

## 3.0.1

### Patch Changes

- [#190](https://github.com/marcalexiei/eslint-zod/pull/190) [`294b4b1`](https://github.com/marcalexiei/eslint-zod/commit/294b4b17060d30354be707a3400cced43915df2c) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(prefer-enum-over-literal-union): handle empty methods

## 3.0.0

### Major Changes

- [`5f4db68`](https://github.com/marcalexiei/eslint-zod/commit/5f4db6830555b65a0e1607fa8ad65988c6bfb8ef) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat!: `eslint-plugin-zod-x` is now `eslint-plugin-zod`

  ***

  The author of `eslint-plugin-zod` has kindly shared ownership of the package, allowing `eslint-plugin-zod-x` to become `eslint-plugin-zod`.

  Thanks @gajus!

  ## Migrating from `eslint-plugin-zod-x`

  You can replace `eslint-plugin-zod-x` directly with `eslint-plugin-zod`.

  ### Rule prefix changes

  If you have customized rules, remove the `-x` suffix from the rule namespace.

  ```diff
  - 'zod-x/array-style': 'error',
  + 'zod/array-style': 'error',
  ```

  ### Configuration update

  ```diff
  // eslint.config.js
  import { defineConfig } from 'eslint/config';
  import eslint from '@eslint/js';
  - import eslintPluginZodX from 'eslint-plugin-zod-x';
  + import eslintPluginZod from 'eslint-plugin-zod';

  export default defineConfig(
    eslint.configs.recommended,
  - eslintPluginZodX.configs.recommended,
  + eslintPluginZod.configs.recommended,
  );
  ```

  ## Update `eslint-plugin-zod`

  When the project was taken over, `eslint-plugin-zod-x` was already at version `2.x`.

  To avoid versioning conflicts, `eslint-plugin-zod` will not publish any `2.x` releases and will instead start at version `3.x`.

  ### Supported ESLint and Zod versions

  This release supports **ESLint 9** and **Zod 4** only.
  If your project depends on an older versions, you must upgrade before adopting this version.

  ### Configuration compatibility

  You are encouraged to use the `recommended` configuration, as shown in the README.

  If the recommended configuration does not meet your requirements, the following table shows the equivalent rules between `eslint-plugin-zod-x` and `eslint-plugin-zod`:
  - `prefer-enum` → `prefer-enum-over-literal-union`
  - `require-strict` → `consistent-object-schema-type` with `allow: ['strictObject']`
  - `no-any` → `no-any-schema`

  #### Example custom configuration

  ```ts
  // eslint.config.js
  import { defineConfig } from 'eslint/config';
  import eslint from '@eslint/js';
  import eslintPluginZod from 'eslint-plugin-zod';

  export default defineConfig(eslint.configs.recommended, {
    plugins: {
      zod: eslintPluginZod,
    },
    rules: {
      'zod/no-any-schema': 'error',
      'zod/prefer-enum-over-literal-union': 'error',
      'zod/consistent-object-schema-type': [
        'error',
        {
          allow: ['strictObject'],
        },
      ],
    },
  });
  ```

## 2.1.0

### Minor Changes

- [#183](https://github.com/marcalexiei/eslint-zod/pull/183) [`70f5add`](https://github.com/marcalexiei/eslint-zod/commit/70f5addfeb6e8438c3b0fdf5b5fa0ae32dc5057e) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(prefer-enum-over-literal-union): add new rule

- [#184](https://github.com/marcalexiei/eslint-zod/pull/184) [`950f61f`](https://github.com/marcalexiei/eslint-zod/commit/950f61f8957f81a7dd5627c7e406f512dde6ad7e) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: `eslint-plugin-zod-x` deprecation notice

  This is the last `eslint-plugin-zod-x` release.
  Soon I'll release a new major version on `eslint-plugin-zod`.
  See [Takeover eslint-plugin-zod](https://github.com/marcalexiei/issues/171) for additional information.

## 2.0.1

### Patch Changes

- [#176](https://github.com/marcalexiei/eslint-zod/pull/176) [`d64dbc2`](https://github.com/marcalexiei/eslint-zod/commit/d64dbc21f032b341ffdafbcf397ea58018a6fc19) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: `detectZodSchemaRootNode` doesn't detect named `z` import

- [#177](https://github.com/marcalexiei/eslint-zod/pull/177) [`070a9a5`](https://github.com/marcalexiei/eslint-zod/commit/070a9a5fbd9ea1a5c0e506648d742f63c7fdd7d7) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(schema-error-property-style): rule should report invalid esQuery selectors

- [#162](https://github.com/marcalexiei/eslint-zod/pull/162) [`b6eb583`](https://github.com/marcalexiei/eslint-zod/commit/b6eb5833dde8438c59bae4279c4f2fc59645082f) Thanks [@marcalexiei](https://github.com/marcalexiei)! - docs: separate rule name into title; move description to its own paragraph

  Change coming from `eslint-doc-generator` update to v3
  - <https://github.com/bmish/eslint-doc-generator/releases/tag/v3.0.0>
  - <https://github.com/bmish/eslint-doc-generator/pull/835>
  - <https://github.com/bmish/eslint-doc-generator/pull/839>

- [#155](https://github.com/marcalexiei/eslint-zod/pull/155) [`84657fc`](https://github.com/marcalexiei/eslint-zod/commit/84657fc57724f4ad9eb5984c9b66ed878bf70297) Thanks [@ShayanTheNerd](https://github.com/ShayanTheNerd)! - fix(schema-error-property-style): correct typos in schema property descriptions

- [#173](https://github.com/marcalexiei/eslint-zod/pull/173) [`14bde3e`](https://github.com/marcalexiei/eslint-zod/commit/14bde3e84442f231d1fa3892fbbbd19caa422291) Thanks [@marcalexiei](https://github.com/marcalexiei)! - docs(prefer-namespace-import): add treeshaking issue link

## 2.0.0

### Major Changes

- [#154](https://github.com/marcalexiei/eslint-zod/pull/154) [`8e72b23`](https://github.com/marcalexiei/eslint-zod/commit/8e72b23e8534deca30314f985a3877ea4e167b95) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat!: rename `no-any` to `no-any-schema`

  The `no-any` rule has been renamed to `no-any-schema` to align with the naming convention used by other rules such as `no-unknown-schema` and `consistent-object-schema-type`.

  If you are using the `recommend` configuration, no changes are required.

  For manual configurations, update your rule key as shown below:

  ```diff
    // eslint.config.js
    import { defineConfig } from 'eslint/config';
    import eslintPluginZodX from 'eslint-plugin-zod';

    export default defineConfig(
      {
        plugins: {
          'zod-x': eslintPluginZodX,
        },
        rules: {
  -       'zod-x/no-any': 'error',
  +       'zod-x/no-any-schema': 'error',
        }
      }
    );
  ```

- [#153](https://github.com/marcalexiei/eslint-zod/pull/153) [`a1a7612`](https://github.com/marcalexiei/eslint-zod/commit/a1a7612986d912f0f6058d60629c53f4f9771e05) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(prefer-strict-object)!: remove rule

  Use `consistent-object-schema-type` instead:

  ```diff
    // eslint.config.js
    import { defineConfig } from 'eslint/config';
    import eslintPluginZodX from 'eslint-plugin-zod';

    export default defineConfig(
      {
        plugins: {
          'zod-x': eslintPluginZodX,
        },
        rules: {
  -       'zod-x/prefer-strict-object': 'error',
  +       'zod-x/consistent-object-schema-type': [
  +         'error',
  +         { allow: ['strictObject'] },
  +       ],
        }
      }
    );
  ```

## 1.13.2

### Patch Changes

- [#149](https://github.com/marcalexiei/eslint-zod/pull/149) [`2479a93`](https://github.com/marcalexiei/eslint-zod/commit/2479a932a79f32ea541c32587b2df939dc9e6e1c) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(array-style): handle chain methods with `style: ‘method’`

## 1.13.1

### Patch Changes

- [#144](https://github.com/marcalexiei/eslint-zod/pull/144) [`4463fca`](https://github.com/marcalexiei/eslint-zod/commit/4463fca7000425cd197534a814a345e6c0d511df) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(no-any): handle chained method when creating fixer

## 1.13.0

### Minor Changes

- [#139](https://github.com/marcalexiei/eslint-zod/pull/139) [`77e7dde`](https://github.com/marcalexiei/eslint-zod/commit/77e7dde560233d5df7ea2658b860e465ad8e77b0) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(prefer-namespace-import): add autofix for all import references

- [#137](https://github.com/marcalexiei/eslint-zod/pull/137) [`cae9847`](https://github.com/marcalexiei/eslint-zod/commit/cae9847a9e5b441571d715dabf2819ec93ff10d1) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(prefer-strict-object): deprecate rule (use `consistent-object-schema-type`)

### Patch Changes

- [#139](https://github.com/marcalexiei/eslint-zod/pull/139) [`77e7dde`](https://github.com/marcalexiei/eslint-zod/commit/77e7dde560233d5df7ea2658b860e465ad8e77b0) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(prefer-namespace-import): handle named imports autofix correctly

## 1.12.0

### Minor Changes

- [#132](https://github.com/marcalexiei/eslint-zod/pull/132) [`d559140`](https://github.com/marcalexiei/eslint-zod/commit/d559140264d6024fcb079d8ad1a55b52f01da65a) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(no-unknown-schema): add new rule

### Patch Changes

- [#133](https://github.com/marcalexiei/eslint-zod/pull/133) [`49c73fe`](https://github.com/marcalexiei/eslint-zod/commit/49c73fecd210471016896da23f27e29f3580602e) Thanks [@marcalexiei](https://github.com/marcalexiei)! - docs: ensure consistent structure across rules documentation

## 1.11.2

### Patch Changes

- [#125](https://github.com/marcalexiei/eslint-zod/pull/125) [`62b8ce3`](https://github.com/marcalexiei/eslint-zod/commit/62b8ce30212b981f3db818e122b9a59d8fdbc839) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(require-schema-suffix): remove unsafe autofix

  If you previously relied on this feature, you can safely update your code by using your IDE’s rename functionality.

  For more details, see the [`require-schema-suffix` documentation](https://github.com/marcalexiei/eslint-zod/blob/main/docs/rules/require-schema-suffix.md).

## 1.11.1

### Patch Changes

- [#122](https://github.com/marcalexiei/eslint-zod/pull/122) [`85a1ec7`](https://github.com/marcalexiei/eslint-zod/commit/85a1ec72e7508b8c1e0e7a4908b20d1b072186a7) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(prefer-meta): do not process non-zod expressions

## 1.11.0

### Minor Changes

- [#119](https://github.com/marcalexiei/eslint-zod/pull/119) [`725c4de`](https://github.com/marcalexiei/eslint-zod/commit/725c4de6fb004489ef12bb0410b4a6f3104c6e7a) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(consistent-object-schema-type): add new rule

## 1.10.0

### Minor Changes

- [#110](https://github.com/marcalexiei/eslint-zod/pull/110) [`d54bade`](https://github.com/marcalexiei/eslint-zod/commit/d54bade9949834e53c11c50aef31961c2af2d3bf) Thanks [@marcalexiei](https://github.com/marcalexiei)! - This release adds support for Zod named exports.
  All rules should now work with default, namespace, and named import styles,
  this required a major rewrite.

  ***

  Some rules do not yet provide automatic fixes when using named imports.
  Fixes for those cases are more complex because they often require modifying import statements.

  ***

  🤕🤕🤕
  This is not a major release since doesn't add any breaking change,
  however there might be some issues due to the major refactor.

### Patch Changes

- [#112](https://github.com/marcalexiei/eslint-zod/pull/112) [`bbbb147`](https://github.com/marcalexiei/eslint-zod/commit/bbbb147433e554a11ad7193e0ffa7286dc8f9f0a) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: new find logic perf improvements

## 1.9.0

### Minor Changes

- [#103](https://github.com/marcalexiei/eslint-zod/pull/103) [`44fb4bf`](https://github.com/marcalexiei/eslint-zod/commit/44fb4bfc20b0afb3d205cb1d9f2bc3556778c949) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(consistent-import-source): add suggestion

## 1.8.3

### Patch Changes

- [#105](https://github.com/marcalexiei/eslint-zod/pull/105) [`3dfcd52`](https://github.com/marcalexiei/eslint-zod/commit/3dfcd525464018da8e89003d4cee7058ac5be767) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(meta): make zod an optional peer dependency

## 1.8.2

### Patch Changes

- [#102](https://github.com/marcalexiei/eslint-zod/pull/102) [`8dd776d`](https://github.com/marcalexiei/eslint-zod/commit/8dd776dd2bdca0ddbf81489a7eb394cb64499220) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(array-style): correct rule name

- [#99](https://github.com/marcalexiei/eslint-zod/pull/99) [`a07e3fc`](https://github.com/marcalexiei/eslint-zod/commit/a07e3fc52272d8165c0816abf23dd67ee41beffd) Thanks [@V1RE](https://github.com/V1RE)! - fix(schema-error-property-style): correct rule name from 'consistent-import-source'

- [#101](https://github.com/marcalexiei/eslint-zod/pull/101) [`0642e50`](https://github.com/marcalexiei/eslint-zod/commit/0642e5001d1fcaf566dc871e5cc326acd1ccf3f7) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(require-brand-type-parameter): correct `removeBrandFunction` message typo

## 1.8.1

### Patch Changes

- [#96](https://github.com/marcalexiei/eslint-zod/pull/96) [`6b282b4`](https://github.com/marcalexiei/eslint-zod/commit/6b282b4076801556c4fdbc20be2fd650d75ddca2) Thanks [@andreww2012](https://github.com/andreww2012)! - fix(array-style): disallow extra properties in rule options

- [#95](https://github.com/marcalexiei/eslint-zod/pull/95) [`7b28d3a`](https://github.com/marcalexiei/eslint-zod/commit/7b28d3a28ae91ae0a3ff55f3ad530d2691cecf2a) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(prefer-namespace-import): treat each source as standalone group to allow using multiple versions

- [#96](https://github.com/marcalexiei/eslint-zod/pull/96) [`6b282b4`](https://github.com/marcalexiei/eslint-zod/commit/6b282b4076801556c4fdbc20be2fd650d75ddca2) Thanks [@andreww2012](https://github.com/andreww2012)! - fix(prefer-strict-object): disallow extra properties in rule options

- [#97](https://github.com/marcalexiei/eslint-zod/pull/97) [`4ae924f`](https://github.com/marcalexiei/eslint-zod/commit/4ae924f488e8305d2bf5d6a2e9de7f3bb87e3eac) Thanks [@andreww2012](https://github.com/andreww2012)! - fix(meta): remove anchor from rule url prefix

## 1.8.0

### Minor Changes

- [#90](https://github.com/marcalexiei/eslint-zod/pull/90) [`13653a6`](https://github.com/marcalexiei/eslint-zod/commit/13653a68372779dea5ef626b997d109d487580b7) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(schema-error-property-style): add new rule

- [#89](https://github.com/marcalexiei/eslint-zod/pull/89) [`56e9aff`](https://github.com/marcalexiei/eslint-zod/commit/56e9aff6086ea3c76e8b7bdffbba54662b93bea9) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat: support Node 25

- [#92](https://github.com/marcalexiei/eslint-zod/pull/92) [`707ee6f`](https://github.com/marcalexiei/eslint-zod/commit/707ee6f6ca054432879a970f7db7e38196638e32) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(require-brand-type-parameter): add new rule

## 1.7.1

### Patch Changes

- [#69](https://github.com/marcalexiei/eslint-zod/pull/69) [`fb209b7`](https://github.com/marcalexiei/eslint-zod/commit/fb209b79d5e17ef68f6d10232ebf61b2909a575b) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(package.json): add hash to readme in `homepage` field

- [#75](https://github.com/marcalexiei/eslint-zod/pull/75) [`c8718d8`](https://github.com/marcalexiei/eslint-zod/commit/c8718d85b221fe901a286c9020e7df92ed4fc6de) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(require-schema-suffix): false positive if last method in chain is not a parse-like method

- [#73](https://github.com/marcalexiei/eslint-zod/pull/73) [`01820c0`](https://github.com/marcalexiei/eslint-zod/commit/01820c0bb414b0b1da820eb379572b7be6b2d77e) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(prefer-meta-last): handle meta inside objects

## 1.7.0

### Minor Changes

- [#61](https://github.com/marcalexiei/eslint-zod/pull/61) [`926b6bd`](https://github.com/marcalexiei/eslint-zod/commit/926b6bdd12902bb68e0c689b8f7c58e09f38e5aa) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(no-number-schema-with-int): add new rule

  Thanks to @ulrichstark for the proposal

### Patch Changes

- [#67](https://github.com/marcalexiei/eslint-zod/pull/67) [`e1b3955`](https://github.com/marcalexiei/eslint-zod/commit/e1b3955a12ecdcdd92b438e3a759906d3beae008) Thanks [@marcalexiei](https://github.com/marcalexiei)! - docs: format rules descriptions consistently marking methods with “`”

- [#68](https://github.com/marcalexiei/eslint-zod/pull/68) [`ce8132a`](https://github.com/marcalexiei/eslint-zod/commit/ce8132a2c021c94edf4dffbb88ed726b6a0ba08d) Thanks [@marcalexiei](https://github.com/marcalexiei)! - docs(README): improve install and configuration

- [#65](https://github.com/marcalexiei/eslint-zod/pull/65) [`45dbdc8`](https://github.com/marcalexiei/eslint-zod/commit/45dbdc81f1e9f43955c5c41232858ad39ace4e54) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: create compatible plugin/config types to avoid external types references

## 1.6.0

### Minor Changes

- [#53](https://github.com/marcalexiei/eslint-zod/pull/53) [`2dba641`](https://github.com/marcalexiei/eslint-zod/commit/2dba641334936362e95a8d802ff8a182344434fd) Thanks [@ulrichstark](https://github.com/ulrichstark)! - feat(no-optional-and-default-together): add new rule

- [#57](https://github.com/marcalexiei/eslint-zod/pull/57) [`fd12dcb`](https://github.com/marcalexiei/eslint-zod/commit/fd12dcbfaf63a6be90416184e0924d1c5895cadd) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(no-optional-and-default-together): add different message when `preferredMethod` !== `none`

## 1.5.1

### Patch Changes

- [#45](https://github.com/marcalexiei/eslint-zod/pull/45) [`caee00f`](https://github.com/marcalexiei/eslint-zod/commit/caee00fc60cb29193ea90d696969dd9ab9ab96b6) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: simplify plugin type

  Refactor plugin `rules` object to use `Record<string, TSESLint.LooseRuleDefinition>` type.
  This eliminates the need to export rule options from individual rule files, fixing the `TS4023` TypeScript error:

  ```text
  Exported variable 'eslintPluginZodX' has or is using name 'Options' from external module "./src/rules/array-style" but cannot be named.
  ```

- [#50](https://github.com/marcalexiei/eslint-zod/pull/50) [`65f6dc8`](https://github.com/marcalexiei/eslint-zod/commit/65f6dc809179e444329e812fe4b8a9800478f9ca) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix: plugin type is incompatible with `eslint#defineConfig`

## 1.5.0

### Minor Changes

- [#41](https://github.com/marcalexiei/eslint-zod/pull/41) [`0e7b30a`](https://github.com/marcalexiei/eslint-zod/commit/0e7b30aeddacdcc37308dd741af5a280a6646214) Thanks [@SimonVadier](https://github.com/SimonVadier)! - feat(consistent-import-source): add support for `zod/mini` and `zod/v4-mini`

### Patch Changes

- [#40](https://github.com/marcalexiei/eslint-zod/pull/40) [`8dff683`](https://github.com/marcalexiei/eslint-zod/commit/8dff6836adbf9a22952a498f180c58d214404053) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(prefer-namespace-import): account for type imports

- [#36](https://github.com/marcalexiei/eslint-zod/pull/36) [`da86f6f`](https://github.com/marcalexiei/eslint-zod/commit/da86f6f84cbb91cca411d281402d57a4c1fcd261) Thanks [@marcalexiei](https://github.com/marcalexiei)! - docs: improve description meta

- [#43](https://github.com/marcalexiei/eslint-zod/pull/43) [`66f2ab5`](https://github.com/marcalexiei/eslint-zod/commit/66f2ab56674853d0fb580b2d153c990a1416088e) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(prefer-meta-last): Matching meta() from other packages

## 1.4.0

### Minor Changes

- [#26](https://github.com/marcalexiei/eslint-zod/pull/26) [`426005f`](https://github.com/marcalexiei/eslint-zod/commit/426005f3ca646051309968ad38131a25908a3628) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(require-error-message): add new rule

### Patch Changes

- [#28](https://github.com/marcalexiei/eslint-zod/pull/28) [`5156928`](https://github.com/marcalexiei/eslint-zod/commit/5156928b8fe2713e193d1f7a8d46f3d031a0c09a) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(require-schema-suffix): some data returning methods are missing

- [#29](https://github.com/marcalexiei/eslint-zod/pull/29) [`2cf9d64`](https://github.com/marcalexiei/eslint-zod/commit/2cf9d64f641e00fc632151a93583cb2735eca900) Thanks [@marcalexiei](https://github.com/marcalexiei)! - fix(require-schema-suffix): ignore codec

## 1.3.0

### Minor Changes

- [#21](https://github.com/marcalexiei/eslint-zod/pull/21) [`530182d`](https://github.com/marcalexiei/eslint-zod/commit/530182d3d135aa85dc042ba322da551f23ae3f51) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(require-schema-suffix): add new rule

## 1.2.0

### Minor Changes

- [#19](https://github.com/marcalexiei/eslint-zod/pull/19) [`f2b43dd`](https://github.com/marcalexiei/eslint-zod/commit/f2b43dd52faba9253a2f8610d3c7ae30c9b6c73a) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(consistent-import-source): add new rule

## 1.1.0

### Minor Changes

- [#15](https://github.com/marcalexiei/eslint-zod/pull/15) [`70057a3`](https://github.com/marcalexiei/eslint-zod/commit/70057a31517f17a0e24566e3782025aa1b47b7d4) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(no-empty-custom-schema): add new rule

- [#17](https://github.com/marcalexiei/eslint-zod/pull/17) [`978b12f`](https://github.com/marcalexiei/eslint-zod/commit/978b12f04ae359bfdc2da504b249b9f13b8f272a) Thanks [@marcalexiei](https://github.com/marcalexiei)! - docs: uniform rules documentation

## 1.0.2

### Patch Changes

- [`4ad66fc`](https://github.com/marcalexiei/eslint-zod/commit/4ad66fcaa29c0d214a0b204bec39a8ea21c45d2b) Thanks [@marcalexiei](https://github.com/marcalexiei)! - chore: refine `.npmrc` (userland not affected)

## 1.0.1

### Patch Changes

- [`dccc798`](https://github.com/marcalexiei/eslint-zod/commit/dccc798bffad3300e1da7de4f48d73afa7696e22) Thanks [@marcalexiei](https://github.com/marcalexiei)! - chore: retry trusted publising

## 1.0.0

### Major Changes

- [`97b9d55`](https://github.com/marcalexiei/eslint-zod/commit/97b9d55ad27fea0d2e4e90653bacee4f38d1ddfd) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat!: initial release

### Minor Changes

- [`f2b3200`](https://github.com/marcalexiei/eslint-zod/commit/f2b3200344bbf673fb432fa991a0d6b48263f74a) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(no-any): add new rule

- [`25e049f`](https://github.com/marcalexiei/eslint-zod/commit/25e049fbcbb090c6b42e9bf43687a88ec2c05eb1) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(no-throw-in-refine): add new rule

- [`44f370f`](https://github.com/marcalexiei/eslint-zod/commit/44f370f4d9c7594c33ff19d48991072c3b1ed2fb) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(array-style): add new rule

- [`35ae1ad`](https://github.com/marcalexiei/eslint-zod/commit/35ae1ad6e9a8c2438afc17a6584bacd01334f5c7) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(prefer-namespace-import): add new rule

- [`bcedf76`](https://github.com/marcalexiei/eslint-zod/commit/bcedf76533b3efc2c1a20db7c50354f5f8ae262a) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(prefer-strict-object): add new rule

- [`aa189ea`](https://github.com/marcalexiei/eslint-zod/commit/aa189ea5f6a1da8f2cb79853842a2c5db60ce961) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(prefer-meta-last): new rule

- [`672f6ee`](https://github.com/marcalexiei/eslint-zod/commit/672f6ee368ad3dd9a762b68542a43f705dadf6bc) Thanks [@marcalexiei](https://github.com/marcalexiei)! - feat(prefer-meta): add new rule
