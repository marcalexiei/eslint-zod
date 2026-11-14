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

Only what the plugins import; every other helper is internal to this package.

- `createPluginMeta(packageJSONURL)` — a plugin's `name`, `version`, `getRuleURL` and `createRule`, read from its `package.json`; rule docs are expected at `docs/rules/<rule-name>.md` under `repository.directory`; type `RuleCreator`
- `zodImportScope`, `zodMiniImportScope`, `zodCoreImportScope` — each plugin's import scope; `scope.createTracker({ kind, sourceCode? })` gives a rule its per-file tracker (type `ZodSchemaImportTracker`), whose members are documented in its source
- type `ZodSchemaMeta` — what schema detection returns
- `getZodSchemaBaseType(schemaType)` — map a schema factory name to its base type category, `null` for factories rules should not reason about
- `getZodSchemaFactoryName(meta)` — the factory a detected chain builds its schema with: `meta.schemaType`, except that `coerce.<name>()` gives `<name>`
- `buildZodChainRemoveMethodFix(opts)` — remove one method from a chain
- `hasCommentInRange(sourceCode, range)` — whether a comment sits inside a range a fixer is about to remove or rewrite
- `hasParenthesizedReceiver(member)` — whether a member expression's object is wrapped in parentheses (`(z.string()).min(1)`)
- `ZOD_MUTATING_CHECK_NAMES` — Zod check names that mutate the validated value
- `ZOD_NON_SCHEMA_PRODUCING_METHODS` — Zod method names that do not return a schema
- `ZOD_STRING_FORMAT_METHODS` — deprecated `z.string().<format>()` methods and the top-level factory replacing each; type `ZodStringFormatMethodName`
- `ZOD_TYPE_CHANGING_METHODS` — chained methods that rebuild the schema around another type (`array`, `or`, `pipe`, …)

### Rule types — `@eslint-zod/utils/rule-types`

The slice of the linter's rule API the helpers read. The types are structural, so ESLint's and typescript-eslint's own objects are assignable to them and no linter has to be installed: the package's only typescript-eslint dependency is `@typescript-eslint/types`, for the AST.

- `RuleContext`, `RuleListener`, `RuleModule`, `RuleMeta` — the rule itself
- `JSONSchema4` — the type of `meta.schema`, vendored from typescript-eslint so its `RuleTester` accepts the rule modules
- `RuleFix`, `RuleFixer`, `ReportDescriptor`, `ReportFixFunction`, `ReportSuggestionArray`, `SuggestionReportDescriptor` — reports and fixes
- `SourceCode`, `TokenSearchOptions`, `Scope`, `ScopeVariable`, `ScopeDefinition`, `ScopeReference` — source and scope access

### Shared rule builders — `@eslint-zod/utils/rule-builders/<rule-name>`

Each rule shared between `eslint-plugin-zod` and `eslint-plugin-zod-mini` (some also `eslint-plugin-zod-core`) exposes its `create(...)` factory from a dedicated subpath. Plugins keep rule metadata local and reuse the runtime logic.

- `buildConsistentImportCreate(scope)` — also exports `ConsistentImportOptions`; its optional type argument narrows `syntax` to the choices a plugin offers
- `buildConsistentImportSourceCreate(scope)` — also exports `ConsistentImportSourceOptions`
- `buildConsistentObjectSchemaTypeCreate(scope)` — also exports `ConsistentObjectSchemaTypeOptions` and `ZOD_OBJECT_METHODS`
- `buildConsistentSchemaOutputTypeStyleCreate(scope)` — also exports `ConsistentSchemaOutputTypeStyleOptions` and `ZOD_SCHEMA_TYPE_STYLES`
- `buildConsistentSchemaVarNameCreate(scope)` — also exports `ConsistentSchemaVarNameOptions`
- `buildNoAnySchemaCreate(scope)`
- `buildNoCoerceBooleanCreate(scope)`
- `buildNoConflictingChecksCreate(scope)` — also exports the `NoConflictingChecksOptions` and `NoConflictingChecksMessageIds` contracts
- `buildNoDuplicateSchemaMethodsCreate(scope, excludedMethods)` — an `as const` list naming a type-changing method is a type error, since the rule never reaches it; also exports `NoDuplicateSchemaMethodsExclusions`
- `buildNoDynamicSchemaValueCreate(scope)`
- `buildNoEmptyCustomSchemaCreate(scope)`
- `buildNoFunctionScopedSchemaCreate(scope)`
- `buildNoNativeEnumCreate(scope)`
- `buildNoPromiseSchemaCreate(scope)`
- `buildNoReshapeOnRefinedObjectCreate(scope)`
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
- `buildSchemaErrorPropertyStyleCreate(scope)` — also exports `SchemaErrorPropertyStyleOptions`

The `consistent-import` builder additionally re-exports `IMPORT_SYNTAXES` and `ImportSyntax`: every syntax the builder can enforce.
Each plugin declares the subset it offers in its own rule schema.

### Rule patterns — `@eslint-zod/utils/rule-patterns/<pattern-name>`

Rule shapes that recur across several rules, parameterized by the names they differ in. Unlike rule builders these are not tied to one rule name, and a single plugin may use one several times.

- `buildDeprecatedSchemaPropertyCreate(options)` — flag a deprecated property access on a schema of a given `schemaType`, one factory or a list (`z.number().isInt`); also exports `DeprecatedSchemaPropertyOptions`
- `buildDeprecatedSchemaMethodCreate(options)` — flag a deprecated method anywhere in a schema chain (`.isOptional()`); also exports `DeprecatedSchemaMethodOptions`
- `buildCollapseEqualBoundsCreate(options)` — collapse an equal lower/upper bound pair into the exact-form check of the same domain (`z.string().min(3).max(3)` → `z.string().length(3)`); also exports `CollapseEqualBoundsOptions` and `CollapsibleBoundDomain`
- `buildPreferDedicatedFactoryCreate(options)` — prefer a dedicated factory over a general one plus a chained modifier (`z.looseObject()` over `z.object().passthrough()`); also exports `PreferDedicatedFactoryOptions`
- `buildPreferTopLevelFactoryCreate(options)` — prefer a top-level factory over a deprecated method chained on a general one (`z.uuid()` over `z.string().uuid()`), or remove the method on a `redundant` factory that already implies it (`z.int32().int()`); also exports `PreferTopLevelFactoryOptions` and `TopLevelFactoryReplacement`
