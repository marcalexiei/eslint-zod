# AGENTS.md

Instructions for any coding agent working in this repo.
`CLAUDE.md` and `.claude` are symlinks to this file and to `.agents/`, so tools that look for their own paths read the same content.

## Repository overview

pnpm monorepo containing three ESLint plugins and a shared utilities package for [Zod](https://zod.dev) v4.

| Package                  | Directory                         | Published |
| ------------------------ | --------------------------------- | --------- |
| `eslint-plugin-zod`      | `plugins/eslint-plugin-zod/`      | yes       |
| `eslint-plugin-zod-mini` | `plugins/eslint-plugin-zod-mini/` | yes       |
| `eslint-plugin-zod-core` | `plugins/eslint-plugin-zod-core/` | yes       |
| `@eslint-zod/utils`      | `packages/utils/`                 | yes       |
| `@eslint-zod/tooling`    | `packages/tooling/`               | no        |

`eslint-plugin-zod-core` targets `zod/v4/core` (the low-level package used by library authors). It is intentionally small — most schema-authoring rules do not apply to it.

`@eslint-zod/tooling` is a private workspace package holding everything tool-related that would otherwise be duplicated per package: one directory per tool, and one export per entry.

| Export                                         | File                                | Contents                                                                 |
| ---------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| `@eslint-zod/tooling/vitest`                   | `src/vitest/index.js`               | `definePluginTestProject(name)`                                          |
| `@eslint-zod/tooling/vitest/spec-helpers`      | `src/vitest/spec-helpers.ts`        | data helpers for the plugins' `index.spec.ts` consistency specs          |
| `@eslint-zod/tooling/vitest/rule-tester-cases` | `src/vitest/rule-tester-cases.ts`   | `createSuggestionCases(rule, { messageId, suggestionMessageId, data? })` |
| `@eslint-zod/tooling/tsdown`                   | `src/tsdown/index.ts`               | `definePluginTsdownConfig(overrides?)`                                   |
| `@eslint-zod/tooling/eslint-doc-generator`     | `src/eslint-doc-generator/index.ts` | `eslintDocGeneratorConfig`                                               |

Every one of those tools is invoked per package, so each package keeps its own config file — reduced to a call or a re-export. Two constraints shape the package, both learned from CI:

- **A tool entry has no relative imports.** Each tool loads the per-package config file, sees a bare import, externalizes it and hands the file to Node — which resolves neither a `.js` specifier pointing at a `.ts` file nor a directory sibling. Keep an entry's whole implementation in its own file; a file that is only referenced, never imported (`rule-tester-setup.ts`, loaded by Vitest as a setup file), may sit beside it.
- **The Vitest entry is plain JavaScript.** The test matrix includes Node 20, which cannot strip types, so `vitest.config.ts` loading a `.ts` entry fails with `ERR_UNKNOWN_FILE_EXTENSION`. `src/vitest/index.d.ts` gives it types and `index.js` annotates its implementation against that declaration (`@type {typeof import('./index.js').…}`), so drift between the two is a type error. `allowJs`/`checkJs` are set in this package only. The other tools never run on Node 20 — tsdown's own `engines` require `^22.18 || >=24.11`, and pnpm needs ≥22.13 — so their entries stay TypeScript. Anything that is not tool config (the spec helpers) belongs in its own `.ts` file with its own export.

`createSuggestionCases` builds the `InvalidTestCase` objects for a rule whose invalid cases all report one messageId and offer at most one suggestion, so a case is written as its code pair rather than a dozen lines of scaffolding.
Both ids and the options tuple are inferred from the rule passed in, so a messageId it does not declare is a type error.
Reach for it when a spec has more than a handful of suggestion cases; `prefer-validate` has forty-odd per plugin and was almost entirely boilerplate before.

Every entry uses **named exports only** — the per-package config file is where the tool's expected `export default` is written. The spec helpers return data only: all `describe`/`it` blocks and `expect` assertions stay in each plugin's own spec. The package is consumed source-only and is never built or published; changes to it need no changeset.

`@eslint-zod/utils` is a dependency of each plugin — consumers do not need to install it directly.

## Common commands

```bash
# from repo root
pnpm build          # build all packages
pnpm test           # run all test suites
pnpm test:coverage  # run all test suites with coverage + thresholds
pnpm typecheck      # tsc -b (project references, no emit)
pnpm lint           # lint:js + lint:docs + lint:knip
pnpm lint:publish   # attw per published package (needs a build first)
pnpm format         # prettier --write

# per-plugin (run from plugin directory or with --filter)
pnpm build:docs     # rebuild plugin + regenerate rule docs
pnpm lint:docs      # check rule docs are up to date
```

## Architecture

### Import source scoping

Each plugin is scoped to its own import sources via the `ZodImportScope` class in `packages/utils/src/zod-import-scope.ts`, which also exports three pre-built instances:

- `zodImportScope` (`eslint-plugin-zod`) — `'zod'`, `'zod/v4'`, `'zod/v3'`
- `zodMiniImportScope` (`eslint-plugin-zod-mini`) — `'zod/mini'`, `'zod/v4-mini'`
- `zodCoreImportScope` (`eslint-plugin-zod-core`) — `'zod/v4/core'`

There is no 'all' scope — rules in `eslint-plugin-zod` never fire on `zod/mini` imports and vice versa. Each rule guards itself with `scope.isAllowed(sourceValue)` at the top of its visitor.

### Shared utilities (`@eslint-zod/utils`)

`@eslint-zod/utils` exposes three groups of export paths:

- `@eslint-zod/utils` (`packages/utils/src/`) — AST parsing, import tracking, traversal, and fixer helpers
- `@eslint-zod/utils/rule-builders/<rule-name>` (`packages/utils/src/rule-builders/`) — one export per shared rule builder; the file name matches the rule name (e.g. `consistent-import.ts` → `@eslint-zod/utils/rule-builders/consistent-import`)
- `@eslint-zod/utils/rule-patterns/<pattern-name>` (`packages/utils/src/rule-patterns/`) — recurring rule shapes parameterized by the names they differ in (see **Rule patterns** below)

Both subpath groups are exposed by a single wildcard exports-map entry each (`./rule-builders/*`, `./rule-patterns/*`), so adding a file is enough — there is no per-file entry to keep in sync. Every file in those directories is therefore public: helpers that are not builders or patterns live at `src/` root instead (e.g. `import-syntax-helpers.ts`, re-exported through `consistent-import`).

`IMPORT_SYNTAXES` and `ImportSyntax` are exported from `@eslint-zod/utils/rule-builders/consistent-import` (not from the root).

AST helpers exported from `@eslint-zod/utils`:

- `scope.createTracker(options)` — tracks namespace and named imports; returns an object with `createSchemaVisitor`, `isZodNamespace`, `getNamedImportOriginal` (local name → zod export name), `getNamedImportLocal` (zod export name → local name, for fixers that must write a call site: `import { nullable } from 'zod'` → `getNamedImportLocal('nullish')`, `undefined` when that export was never imported), `collectZodChainMethods`, `collectZodSchemaConstraints`, and listener hooks
- `resolveZodImport(node)` / `resolveZodExport(node)` (tracker methods) — the zod import a node resolves to, as `{ name, local, declaration }`.
  Unlike `isZodNamespace`, which matches a local name anywhere in the file, these honour lexical scope, so a shadowed `z` resolves to `null`.
  Reach for them — with `getZodImportBindings()` — whenever a fixer must write a call site against a specific import declaration or add a specifier to one; that is what `prefer-validate` needs and what a name-only lookup cannot give.
  They require a tracker built with `sourceCode` and throw otherwise.
- `createTracker({ kind })` — **required**: which specifiers the tracker records.
  `'value'` skips `import type { … }` and `{ type … }`; those bindings are erased at runtime, so a rule resolving a call site must not see them — that is every rule but one.
  `'type'` keeps only those, and `'all'` keeps both, which is what a rule reading a **type position** needs, since either import form can put a name there (`consistent-schema-output-type-style` is the one such rule).
  It has no default because both wrong answers fail silently: a `'value'` tracker in a type-position rule sees nothing, and an `'all'` tracker in a call-site rule reports on calls that do not exist at runtime
- `createSchemaVisitor({ schemaType?, onSchema })` (tracker method) — **the standard shape for a schema rule.** It builds the `{ ImportDeclaration, CallExpression }` visitor the rule returns, wiring `importDeclarationListener`, running `detectZodSchemaRootNode`, and applying the `schemaType` filter (one name, or a list — a `readonly` tuple narrows `meta.schemaType` to its members). Hand-wiring those two listeners is a silent-failure footgun: omit `ImportDeclaration` and detection returns `null` for the whole file with no type or lint error. Spread the result to add visitor keys; only a rule whose primary listener is not `CallExpression` (`consistent-schema-var-name`, `consistent-schema-output-type-style`, the `deprecated-schema-property` pattern) still uses `importDeclarationListener` directly
- `detectZodSchemaRootNode()` (tracker method) — finds the outermost Zod call expression in a chain and describes it. It does **not** return the node: the result always describes the node you passed in. Its `methods` are names only and include computed members (`z['uuid']()`); use `collectZodChainMethods` when a fixer needs the nodes, since that walk only names plain-identifier properties
- `collectZodChainMethods()` (tracker method) — the chain as `{ name, node }` items. **All-or-nothing:** either every call from the factory to the outermost one is named — so `chain[0]` is the factory and `chain[i]` matches `collectZodSchemaConstraints`' `chainIndex` — or the array is empty. It is never a partial chain missing its leading calls. Detection is deliberately more permissive: `z['string']().min(1)` _is_ a zod schema, so `onSchema` still fires while the chain is empty. A rule that indexes the chain must therefore handle the empty case; the established convention is to **report without a fix** rather than skip the schema (see `no-native-enum`, `array-style`, `prefer-string-schema-with-trim`)
- `getZodChainedMethodNames(meta)` — the method names chained _onto_ a schema, factory removed. `ZodSchemaMeta.methods` is asymmetric — the factory is a member for a namespace schema (`z.number().safe()` → `['number', 'safe']`) but the callee identifier for a named import (`number().safe()` → `['safe']`) — so a bare `methods.includes('safe')` also matches `import { number as safe }`. Use this for "does this schema chain method X?", and reserve `collectZodChainMethods` for when a fixer needs the node
- `isZodSchemaOfType()` (tracker method) — like `detectZodSchemaRootNode` but for a single factory, and the call need not be outermost (`z.number().isInt` accesses a property on an inner call)
- `getZodSchemaBaseType()` — maps a schema factory name (`detectZodSchemaRootNode`'s `schemaType`) to its base type category (`string` — including the top-level string formats —, `number`, `bigint`, `array`, `object`, `literal`, `any`/`unknown`/`never`, …); returns `null` for factories rules should not reason about
- `collectZodSchemaConstraints()` (tracker method) — flattens a schema chain into a normalized list of constraints (`ZodSchemaConstraint`), covering both API styles: chained methods (`.min(2)`, `zod`) become `origin: 'chained'` items and recognized zod calls among `.check(...)` arguments (`z.minLength(2)`, `zod/mini`) become `origin: 'check-argument'` items. **This is the standard way to navigate a schema's checks in rules shared between plugins** — detection differs per API style, but rule logic written against the constraint list works unchanged in `zod` and `zod-mini`. Names are left as written (chained `.min()` means `gte` on numbers but `minLength` on strings) — pass them through `canonicalizeZodConstraintName` below rather than mapping them per rule.
- `buildZodChainRemoveMethodFix` / `buildZodChainReplacementFix` — fixer helpers
- `buildZodConstraintsRemoveFix` — removes a set of `ZodSchemaConstraint`s from a chain, whatever their origin: chained constraints are removed as methods; check-argument constraints remove the whole containing `.check(...)`, but only when every argument of that call is targeted (never orphans an unrelated check). Returns `null` when removal is unsafe, so callers report without fixing.
- `buildZodWrapperUnwrapFix` — replaces a single-argument wrapper call with its argument (e.g. `z.readonly(z.string())` → `z.string()`), preserving any chain on the wrapper; returns `null` when the call doesn't have exactly one non-spread argument.
- `zodImportScope` / `zodMiniImportScope` / `zodCoreImportScope` — pre-built `ZodImportScope` instances; use `scope.isAllowed(source)` to check whether a source belongs to the plugin's scope
- `ZOD_NON_SCHEMA_PRODUCING_METHODS` — array of method names that do not return a schema (parse, codec, error formatters)
- `isZodSchemaFactoryName(name)` / `isZodSchemaFactoryCall(meta)` — whether a factory, or a detected chain, builds a schema.
  Detection accepts any `z.foo()`, so a rule acting on "this is a schema" must gate on the call form —
  otherwise it reports `z.toJSONSchema(schema)` and `z.prettifyError(err)` too
- `ZOD_MUTATING_CHECK_NAMES` — array of Zod check names that mutate the validated value (`trim`, `toLowerCase`, `toUpperCase`, `normalize`, `overwrite`); used in `zod` as chained methods and in `zod-mini` as standalone `.check(...)` arguments
- `ZOD_IMMUTABLE_SCHEMA_TYPES` — array of schema factory names whose parsed output is already immutable (primitives/scalars, number sub-types, top-level string formats); container factories are intentionally absent. It **spreads** `ZOD_STRING_FORMAT_NAMES` rather than restating it — a hand-copied duplicate of that list had already silently dropped `mac`
- `ZOD_STRING_FORMAT_NAMES` — array of top-level string-format factory names (`email`, `uuid`, `ipv4`, …) that all parse to `string`; single source of truth shared by `getZodSchemaBaseType`, `ZOD_IMMUTABLE_SCHEMA_TYPES` and format-aware rules (the `iso.*` member formats are intentionally absent)

`canonicalizeZodConstraintName(constraint, baseType)` / `getZodCheckDescriptor(name)` (`zod-check-vocabulary.ts`) — **the single source of truth for what a check is called and what it means.** Chained spellings are type-dependent (`.min()` is `minLength` on a string, `gte` on a number, `minSize` on a set) and deprecated chained formats reduce to their top-level replacement (`.datetime()` → `iso.datetime`). Rules must canonicalize through this rather than keeping a private spelling table — that duplication is what the module exists to prevent.

Three conventions the utils package holds to:

- **Lookup misses return `null`**, not `undefined` — `getZodSchemaBaseType`, `getZodCheckDescriptor`, `canonicalizeZodConstraintName`. Chosen for explicitness over matching `Map.get`; `?? null` the map lookup.
- **The `ZOD_*` tables are `Object.freeze`d** at runtime, not just typed `readonly`, and a spec asserts it. Do not deep-freeze entries with a module-level loop — a bare statement conflicts with `sideEffects: false` and a bundler may drop it.
- **The root barrel is a public toolkit, not the plugins' internal surface.** Several root exports have no consumer outside `packages/utils/src/`; they stay exported because they are coherent primitives an external rule author would need, and they are documented in `packages/utils/README.md`. The bar for adding a root export is therefore that it makes sense to someone writing their own Zod rule — not merely that a second file in this repo needs it. Helpers that fail that bar stay module-local (see `ZodImports`, `getPropertyName`).

`ZOD_STRING_FORMAT_METHODS` — deprecated `z.string().<format>()` methods paired with the top-level factory replacing each. Read two ways: as a migration (`prefer-top-level-string-formats`) and as canonicalization (`no-conflicting-checks`). Related but distinct from `ZOD_STRING_FORMAT_NAMES`, which lists top-level factory names including formats that never had a chained spelling.

Rule metadata (name, `meta`, `defaultOptions`) lives entirely per-plugin. When a rule's `create` logic is identical across plugins and differs only by import scope, extract a `build*Create(scope)` factory into `packages/utils/src/rule-builders/<rule-name>.ts` and import it in each plugin from `@eslint-zod/utils/rule-builders/<rule-name>` — the wildcard exports entry needs no per-file update.

When part of a shared rule's behavior is genuinely plugin-specific (i.e. it cannot be expressed through the shared constraint list), the rule builder defines the contract: it exports the options interface / function signature from the builder module, and each plugin implements that interface with its own behavior — plugins never fork or duplicate the shared logic itself. Prefer eliminating the custom part first (e.g. `prefer-tuple-over-array-length` used a `findLengthConstraint` strategy until `collectZodSchemaConstraints` made it unnecessary); reach for an exported contract only when a real per-plugin difference remains.

### Rule patterns

A rule builder is keyed to one rule name and exists to share logic _between plugins_. When two or more rules have the same shape and differ only in the names they mention — a deprecated method, a factory to prefer — that shape belongs in `packages/utils/src/rule-patterns/` instead, even when all its callers live in one plugin. Sharing across plugins is not a requirement there; five patterns currently back twelve `eslint-plugin-zod` rules and two `eslint-plugin-zod-mini` ones.

Do not extract a pattern when the rules differ in their _fix strategy_ rather than in names — `no-number-schema-with-step` (rename the property) and `no-number-schema-with-safe` (replace a run of methods) look alike but would need two implementations behind one switch, which dedupes nothing.

### TypeScript resolution

Each package has a `@eslint-zod/source` custom export condition pointing to its `.ts` source. `tsconfig.base.json` sets `customConditions: ["@eslint-zod/source"]`, so any tool that creates a TypeScript program from a tsconfig that extends the base (IDE language server, `@typescript-eslint/parser`) resolves `@eslint-zod/utils` to its `.ts` source without a prior build.

**Two tsconfigs per package/plugin:**

- `tsconfig.json` — used by `tsc -b`. Has `composite: true`, `outDir`, and `references` to other workspace packages for correct incremental build ordering.
- `tsconfig.eslint.json` — used by `eslint.config.js` (`parserOptions.project`). Has no `composite`, no `references`, and no `outDir`. Without project references, `@typescript-eslint/parser` resolves cross-package imports via `customConditions` → source, so type errors in `@eslint-zod/utils` propagate live to plugin callers in both the CLI and the IDE ESLint extension.

## zod vs zod/mini API differences

This is the most important thing to know when working on `eslint-plugin-zod-mini` rules.

**`zod` (full)** — validation methods are chained:

```ts
z.string().min(1).max(10).optional().describe('desc').meta({ description: 'desc' });
```

**`zod/mini`** — validation methods are standalone `$ZodCheck` functions passed to `.check()`:

```ts
z.string().check(z.minLength(1), z.maxLength(10));
z.optional(z.string());
z.string().check(z.refine(() => true));
z.string().check(z.describe('desc')); // z.describe is a standalone call
z.string().check(z.meta({ description: 'desc' }));
```

Methods that ARE chained in `zod/mini`: `check()`, `brand()`, `parse()`, `safeParse()`, `parseAsync()`, `safeParseAsync()`.

**Never mix the two styles.** Chained validation methods belong to `zod`; standalone `$ZodCheck` calls inside `.check(...)` belong to `zod/mini` (`zod`'s own `.check()` accepts only refinement callbacks, and `zod/mini`'s checks are type-specific: `z.minLength`/`z.maxLength` for strings & arrays, `z.gte`/`z.lte` for numbers, `z.minSize`/`z.maxSize` for sets & maps — there is no `z.min`/`z.max`). Invalid code such as `z.string().check(z.minLength(1))` (`zod`), `z.array(x).min(2).check(z.maxLength(2))` (mixed), or `z.string().check(z.min(2))` (`zod/mini`) must never appear in specs, docs, changesets, or examples. Shared utilities may handle both constraint origins so one rule builder serves both plugins, but each plugin's specs and docs exercise only its own style.

### Consequence for rule authoring

Rules that look for chained methods (via `tracker.collectZodChainMethods`) work correctly in both plugins because `detectZodSchemaRootNode` identifies the outermost call — including calls in argument position (e.g. `z.refine(fn)` inside `.check(z.refine(fn))` is the root of its own expression).

The exception is `prefer-meta` in `eslint-plugin-zod-mini`: since `z.describe()` is not a chain method, detection uses direct namespace/import tracking (`isZodNamespace`, `getNamedImportOriginal`) instead of `tracker.collectZodChainMethods`.

## Shared rules between plugins

A rule is shared when the same file name exists in both plugins' `src/rules/` (the list is derived from the filesystem, not maintained here). When updating any shared rule, its counterpart's docs, specs, and metadata must change in the same PR — follow the **`sync-zod-mini` skill** (`.agents/skills/sync-zod-mini/SKILL.md`), which has the zod → zod/mini translation table, the per-file sync checklist, and the cross-contamination greps.

`eslint-plugin-zod-core` additionally shares `consistent-import` and `consistent-schema-output-type-style` (built from the same rule builders with `zodCoreImportScope`). When updating either of those rules, keep the core counterpart's docs and specs in sync too, adapting examples to `zod/v4/core` imports.

## Quality expectations

Every change must be properly tested and documented:

- Add or update specs to cover the new or modified behavior. A CI job runs `pnpm test:coverage`; the thresholds in `vitest.config.ts` are no-regression floors pinned just below the measured baseline. If a change drops coverage below them, add the missing specs — never lower a threshold to make the build pass.
- Update rule docs (`docs/rules/*.md`) when rule behavior changes; run `pnpm build:docs` from the plugin directory afterward
- Update package READMEs when public API changes. In particular, `packages/utils/README.md` lists **every** public export — its root exports and its `rule-builders/*` subpaths — and must be kept in sync whenever `@eslint-zod/utils` gains, renames, or removes an export (a new rule builder, a new helper/constant, a new exported contract type). It is not auto-generated; nothing fails the build if it drifts, so update it by hand in the same change.
- Update this file when architecture, utilities, or conventions change
- Add a changeset for every user-facing change (see **Changesets** below)

## Code style

Comments are short — one line where one line does. A rule builder or pattern gets a JSDoc block of a few lines saying what it does and when it bails; everything else is a single line explaining a non-obvious decision. Do not restate what the code says, do not narrate each branch, and do not carry a design discussion in the source — that belongs in the rule doc or the changeset.

When a comment does need a second line, break it at a full stop where you can, otherwise at a comma, colon, semicolon or dash, so each line is a whole clause. Never wrap mid-phrase to fill the column. The same applies to prose in Markdown (rule docs, proposals, changesets, this file): Prettier leaves those line breaks alone, so they are a style choice, and the choice is to break at punctuation or not at all.
When a clause will not fit, shorten the sentence rather than accepting either a mid-phrase break or a 150-character line.

## Ecosystem conventions

For questions about ESLint plugin conventions rather than about this codebase — what a config name means, what belongs in `all`, how a rule should be named — follow what typescript-eslint does instead of deriving a repo-specific policy. Users arrive with that mental model already installed, and diverging from it costs them for no gain.

Verify from the installed package rather than from memory:

```bash
# what `all` actually contains, and what it omits
P=$(dirname "$(find node_modules/.pnpm -maxdepth 5 -path '*@typescript-eslint/eslint-plugin/package.json' | head -1)")
node -e "
const p = require('$PWD/$P/dist/index.js');
const all = require('$PWD/$P/dist/configs/eslintrc/all.js').rules;
const rules = Object.keys(p.rules);
const inAll = Object.keys(all).filter((r) => r.startsWith('@typescript-eslint/'));
console.log('rules', rules.length, '| in all', inAll.length, '| deprecated', rules.filter((r) => p.rules[r].meta.deprecated).length);
"
# → rules 134 | in all 125 | deprecated 9
```

Filter to `@typescript-eslint/`-prefixed keys as above: `all.rules` also carries 24 core rules set to `'off'` (the base rules of the extension rules), so a bare `Object.keys(all).length` reads 149 and looks like more rules than the plugin has.

Two conclusions already drawn this way, so they need no re-deriving:

- **`all` means every non-deprecated rule, with no conflict-based carve-outs.** typescript-eslint's `all` is machine-generated and holds 125 of its 134 rules; the 9 exclusions are exactly its deprecated ones. Two rules that overlap both belong in `all` — document the overlap in each rule's docs and keep the overlapping one out of every curated config instead.
- **Rules are named `prefer-<preferred>-over-<replaced>`**, with the subject named in every member of a family (`prefer-tuple-over-array-length`, `prefer-string-length-over-min-max`) so the rule list reads without opening docs. Qualify the subject even where it is technically unambiguous — a family that qualifies some members and not others has to be explained.

## Changesets

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning. Every feature, fix, or breaking change that affects a published package requires a changeset file.

**Create a changeset** by adding a file to `.changeset/<adjective-noun-verb>.md` (three hyphenated random words, e.g. `noble-shoes-swim.md`):

```md
---
'<package-name>': minor
---

<summary of the change>
```

**Bump type:**

- `major` — breaking change (removes or renames a public API, changes rule behavior incompatibly)
- `minor` — new feature (new rule, new export, new option)
- `patch` — bug fix or non-breaking improvement

**One changeset per change, listing every package it touches.** A changeset takes several packages in its front matter, so one user-facing change is one file — a shared rule lands as a single changeset naming `eslint-plugin-zod`, `eslint-plugin-zod-mini` and `@eslint-zod/utils`, not three. Split into separate files only when the same PR carries genuinely unrelated changes, or when one package needs a different bump type from another.

**Summary style:** a conventional-commits title (`feat:`, `fix:`, `refactor:`) plus **at most one short sentence** of context — these become changelog entries, not documentation, so the rule doc carries the detail. One summary is shared by every package in the file, so write it in terms that hold for all of them: name the behavior, not the internal that implements it.

## Adding a new rule

Follow the **`add-rule` skill** (`.agents/skills/add-rule/SKILL.md`) — it covers the full inventory: rule builder or rule pattern, per-plugin rule file, specs, index wiring, docs, changesets, and verification.

## Docs generation

`eslint-doc-generator` is configured per-plugin (`.eslint-doc-generatorrc.ts` in each plugin directory). It does not traverse past `package.json` boundaries, so a root-level config alone is not sufficient — each plugin's file only re-exports the shared config from `@eslint-zod/tooling/eslint-doc-generator`. The root README is a hand-maintained monorepo overview — it has no auto-generated sections.

### Rule doc layout

Every `docs/rules/<rule-name>.md` follows the same section order after the auto-generated header (see `array-style.md` as reference):

1. `## Rule Details` — what the rule does and any analysis limits
2. `## Why?` — optional motivation
3. `## Options` — only for rules with options; omit the section entirely when the rule has none. The auto-generated options list comes first, followed by per-option explanations, defaults, and configuration examples. **Never place `## Options` before `## Rule Details` or at the bottom of the file.**
4. `## Examples` — `### ❌ Invalid` then `### ✅ Valid`
5. Optional rule-specific sections — `## Autofix Behavior`, `## Limitations`, `## Conflict with …`
6. `## When Not To Use It` — optional
7. `## Further Reading`

## Published-artifact checks

`pnpm lint:publish` runs `attw --pack .` in each of the four published packages, checking that the `exports` map resolves types correctly under node10, node16 (CJS and ESM) and bundler. It inspects the `pnpm pack` tarball, so it needs `dist` — that is why the script is separate from `pnpm lint` and why CI runs it after the build step.

`publint` was evaluated alongside it and left out for now.

## Git hooks

[Lefthook](https://lefthook.dev) (`lefthook.yml`), installed by the root `prepare` script on `pnpm install`. `pre-commit` runs Prettier and ESLint over the staged files and restages the fixes; `pre-push` runs `typecheck` and `test`. The build, the docs check and the published-artifact checks stay in CI — they need a current `dist`.

`lefthook` needs its postinstall to place the platform binary, so it is listed in `allowBuilds` in `pnpm-workspace.yaml`; without that, `pnpm exec` fails outright and takes the hooks with it.

## Knip

Two intentional suppressions in `knip.config.ts`:

- `ignoreBinaries: [/^eslint@/]` — the CI matrix runs `eslint@${{ matrix.eslint }}` to test multiple ESLint versions; the template syntax confuses knip.
- `ignoreDependencies: ['eslint']` per plugin — `eslint` is an optional peer referenced only for `satisfies` type checks in `src/index.ts`, not a real devDependency.
