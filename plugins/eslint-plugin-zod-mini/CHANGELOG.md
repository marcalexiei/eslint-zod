# eslint-plugin-zod-mini

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
