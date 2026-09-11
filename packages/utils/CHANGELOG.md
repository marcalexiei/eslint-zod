# @eslint-zod/utils

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
