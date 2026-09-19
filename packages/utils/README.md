# @eslint-zod/utils

[![CI Status][CIBadge]][CIURL]
[![Code style: prettier][CodeStyleBadge]][CodeStyleURL]
[![Lint: eslint][lintBadge]][lintURL]
[![Open on npmx][npmVersionBadge]][npmVersionURL]
[![Open issue tracker][issuesBadge]][issuesURL]

[CIBadge]: https://img.shields.io/github/actions/workflow/status/marcalexiei/eslint-zod/ci.yml?style=for-the-badge&logo=github&event=push&label=CI
[CIURL]: https://github.com/marcalexiei/eslint-zod/actions/workflows/CI.yml/badge.svg
[CodeStyleBadge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge&logo=prettier
[CodeStyleURL]: https://prettier.io
[lintBadge]: https://img.shields.io/badge/lint-eslint-3A33D1?logo=eslint&style=for-the-badge
[lintURL]: https://eslint.org
[npmVersionBadge]: https://img.shields.io/npm/v/@eslint-zod/utils.svg?style=for-the-badge&logo=npm
[npmVersionURL]: https://npmx.dev/package/@eslint-zod/utils
[issuesBadge]: https://img.shields.io/github/issues/marcalexiei/eslint-zod.svg?style=for-the-badge
[issuesURL]: https://github.com/marcalexiei/eslint-zod/issues

Shared AST utilities for

- `eslint-plugin-zod`
- `eslint-plugin-zod-mini`
- `eslint-plugin-zod-core`

> [!NOTE]
> This package is a dependency of all previously listed packages, so you do not need to install it directly.

## API

Every export carries JSDoc with usage notes — refer to the linked source files (or hover in your editor) for the full description and examples. This README only lists what's available.

### Root exports — `@eslint-zod/utils`

AST parsing, import tracking, traversal, and fixer helpers.

**Import tracking & scopes**

- `ZodImportScope` — the class defining which import sources a plugin considers in-scope; `scope.createTracker({ kind })` is how rules get a per-file import tracker; `kind` is required, and `sourceCode` enables the scope-aware resolvers below
- `zodImportScope`, `zodMiniImportScope`, `zodCoreImportScope` — pre-built `ZodImportScope` instances
- `scope.createTracker({ kind, sourceCode? })` — the returned tracker exposes `createSchemaVisitor`, `detectZodSchemaRootNode`, `isZodSchemaOfType`, `collectZodChainMethods`, `collectZodSchemaConstraints`, and the import-lookup helpers. `getZodImportBindings()` returns every binding with the declaration it came from, and `resolveZodImport(node)` / `resolveZodExport(node)` resolve a node to its zod import honouring lexical scope, so a shadowed `z` resolves to `null` — use them over `isZodNamespace` in a rule whose fixer writes an import. `createTracker({ kind })` picks which specifiers are recorded, and is required — `'value'` skips `import type { … }` and `{ type … }`, `'type'` keeps only those, `'all'` keeps both and is what a rule reading a type position needs, since either form reaches one. Schema detection is reachable **only** through a tracker — the raw forms need the tracker's private import maps
- `tracker.createSchemaVisitor({ schemaType?, onSchema })` — builds the `{ ImportDeclaration, CallExpression }` visitor a rule returns, with detection and the `schemaType` filter already applied. **The standard shape for a schema rule**; spread it to add more visitor keys
- types `ZodSchemaImportTracker`, `ZodChainItem`, `ZodImportBinding`, `ZodImportKind`, `ZodSchemaVisitorOptions`, `ZodTrackerOptions`

**Schema detection & navigation**

- `findParentSchemaMatchingCondition(node, options)` — search up the AST for a matching ancestor schema call
- `getZodChainedMethodNames(meta)` — the methods chained _onto_ a schema, with the factory removed. `ZodSchemaMeta.methods` includes the factory for a namespace schema (`z.number().safe()` → `['number', 'safe']`) but not for a named import (`number().safe()` → `['safe']`), so a bare `methods.includes(name)` matches the factory of an aliased import. Use this to ask "does this schema chain method X?"
- `getZodSchemaBaseType(schemaType)` — map a schema factory name to its base type category; returns `ZodSchemaBaseType | null`, `null` for factories rules should not reason about
- type `ZodSchemaMeta` — what the tracker's `detectZodSchemaRootNode` returns (or `null`)
- types `ZodSchemaConstraint`, `ZodChainedConstraint`, `ZodCheckArgumentConstraint` — the normalized constraints produced by the tracker's `collectZodSchemaConstraints`

**Fixer helpers**

- `buildZodChainRemoveMethodFix(opts)` — remove one method from a chain
- `buildZodChainReplacementFix(opts)` — replace a run of methods
- `buildZodConstraintsRemoveFix(opts)` — remove a set of `ZodSchemaConstraint`s (chained or check-argument)
- `buildZodWrapperUnwrapFix(opts)` — replace a single-argument wrapper call with its argument

**Zod vocabulary tables**

- `ZOD_IMMUTABLE_SCHEMA_TYPES` — schema factory names whose parsed output is already immutable
- `ZOD_MUTATING_CHECK_NAMES` — Zod check names that mutate the validated value
- `ZOD_NON_SCHEMA_PRODUCING_METHODS` — Zod method names that do not return a schema
- `ZOD_NON_SCHEMA_HELPER_NAMES` / `isZodNonSchemaHelperCall(meta)` — top-level `z` exports whose call yields something other than a schema (`z.toJSONSchema`, `z.registry`, `z.parse`); unlike the complement of `isZodSchemaFactoryCall` it leaves standalone checks alone
- `ZOD_SCHEMA_FACTORY_NAMES` / `isZodSchemaFactoryName(name)` — every top-level Zod export whose call evaluates to a schema; use the predicate instead of a per-rule factory list
- `isZodSchemaFactoryCall(meta)` — whether a `detectZodSchemaRootNode` result builds a schema; resolves the `iso` / `coerce` namespaces, and rejects the helpers that only consume a schema (`z.toJSONSchema`, `z.prettifyError`)
- `ZOD_STRING_FORMAT_METHODS` — deprecated `z.string().<format>()` methods and the top-level factory replacing each; type `ZodStringFormatMethodName`
- `ZOD_STRING_FORMAT_NAMES` — top-level string-format factory names that all parse to `string`
- `ZOD_TYPE_CHANGING_METHODS` — chained methods that rebuild the schema around another type (`array`, `or`, `pipe`, …); a chain's earlier checks do not carry past one

**Check vocabulary**

Canonical names shared by both API styles, so rule logic compares `zod`'s `.min(2)` with `zod/mini`'s `z.minLength(2)` as one constraint.

- `canonicalizeZodConstraintName(constraint, baseType)` — reduce a constraint's spelling to its canonical name
- `getZodCheckDescriptor(canonicalName)` — what a check means: which base types accept it and what it bounds
- types `ZodCheckDescriptor`, `ZodCheckBound`, `ZodCheckDomain`

### Shared rule builders — `@eslint-zod/utils/rule-builders/<rule-name>`

Each rule shared between `eslint-plugin-zod` and `eslint-plugin-zod-mini` (some also `eslint-plugin-zod-core`) exposes its `create(...)` factory from a dedicated subpath. Plugins keep rule metadata local and reuse the runtime logic.

- `buildConsistentImportCreate(scope)`
- `buildConsistentImportSourceCreate(scope)`
- `buildConsistentObjectSchemaTypeCreate(scope)`
- `buildConsistentSchemaOutputTypeStyleCreate(scope)`
- `buildConsistentSchemaVarNameCreate(scope)`
- `buildNoAnySchemaCreate(scope)`
- `buildNoCoerceBooleanCreate(scope)`
- `buildNoConflictingChecksCreate(scope)` — also exports the `NoConflictingChecksOptions` and `NoConflictingChecksMessageIds` contracts
- `buildNoDuplicateSchemaMethodsCreate(scope, excludedMethods)`
- `buildNoDynamicSchemaValueCreate(scope)`
- `buildNoEmptyCustomSchemaCreate(scope)`
- `buildNoFunctionScopedSchemaCreate(scope)`
- `buildNoNativeEnumCreate(scope)`
- `buildNoPromiseSchemaCreate(scope)`
- `buildNoThrowInRefineCreate(scope)`
- `buildNoTransformInRecordKeyCreate(scope, transformNames)` — `transformNames` are matched against the key schema's factory and its constraints, so one list covers both API styles
- `buildNoUnknownSchemaCreate(scope)`
- `buildNoUnnecessaryReadonlyCreate(scope)`
- `buildPreferEnumOverLiteralUnionCreate(scope)`
- `buildPreferNullishCreate(scope)`
- `buildPreferTupleOverArrayLengthCreate(scope)`
- `buildPreferValidateCreate(scope, api)` — success-only parsing suggestions; `api` is a `ZodValidateApiStyle` (`schema-method` or `standalone`)
- `buildRequireBrandTypeParameterCreate(scope)`
- `buildRequireErrorMessageCreate(scope)`
- `buildSchemaErrorPropertyStyleCreate(scope)`

The `consistent-import` builder additionally re-exports the import-syntax helpers used by its fixer: `IMPORT_SYNTAXES`, `ImportSyntax`, `isGroupFirstImportKindValidForSyntax`, `shouldIdentifierBeRenamed`, `getNamespaceAliasNameFrom`.

### Rule patterns — `@eslint-zod/utils/rule-patterns/<pattern-name>`

Rule shapes that recur across several rules, parameterized by the names they differ in. Unlike rule builders these are not tied to one rule name, and a single plugin may use one several times.

- `buildDeprecatedSchemaPropertyCreate(options)` — flag a deprecated property access on a schema of a given `schemaType` (`z.number().isInt`); also exports `DeprecatedSchemaPropertyOptions`
- `buildDeprecatedSchemaMethodCreate(options)` — flag a deprecated method anywhere in a schema chain (`.isOptional()`); also exports `DeprecatedSchemaMethodOptions`
- `buildCollapseEqualBoundsCreate(options)` — collapse an equal lower/upper bound pair into the exact-form check of the same domain (`z.string().min(3).max(3)` → `z.string().length(3)`); also exports `CollapseEqualBoundsOptions` and `CollapsibleBoundDomain`
- `buildPreferDedicatedFactoryCreate(options)` — prefer a dedicated factory over a general one plus a chained modifier (`z.looseObject()` over `z.object().passthrough()`); also exports `PreferDedicatedFactoryOptions`
- `buildPreferTopLevelFactoryCreate(options)` — prefer a top-level factory over a deprecated method chained on a general one (`z.uuid()` over `z.string().uuid()`); also exports `PreferTopLevelFactoryOptions` and `TopLevelFactoryReplacement`
