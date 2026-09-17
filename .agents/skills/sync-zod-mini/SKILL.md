---
name: sync-zod-mini
description: Translation table and checklist for keeping shared rules in sync between eslint-plugin-zod and eslint-plugin-zod-mini (and zod-core where applicable). Use when editing the docs, specs, or behavior of any rule that exists in more than one plugin, or when writing zod/mini code examples.
---

# Syncing shared rules across plugins

When a rule that exists in both `eslint-plugin-zod` and `eslint-plugin-zod-mini` changes, the counterpart must change in the same PR. A rule is shared when the same file name exists in both plugins' `src/rules/`. `consistent-import` and `consistent-schema-output-type-style` additionally exist in `eslint-plugin-zod-core`.

## Files to keep in sync (per rule)

| File                       | What "in sync" means                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `docs/rules/<rule>.md`     | Same section structure and prose intent; every code example translated                          |
| `src/rules/<rule>.spec.ts` | Same valid/invalid scenarios by name; code translated                                           |
| `src/rules/<rule>.ts`      | Same options/messages intent; `docs.description` and message text use the plugin's own spelling |

After doc edits, run `pnpm build:docs` in **each** touched plugin directory.

## Translation table (zod → zod/mini)

Import source: `'zod'` → `'zod/mini'` (core: `'zod/v4/core'`). Namespace import `import * as z from …` is used in both.

**Wrappers** — chained method becomes a wrapping call:

| zod                     | zod/mini                 |
| ----------------------- | ------------------------ |
| `z.string().optional()` | `z.optional(z.string())` |
| `z.string().nullable()` | `z.nullable(z.string())` |
| `z.string().readonly()` | `z.readonly(z.string())` |

**Checks** — chained method becomes a standalone `$ZodCheck` passed to `.check(...)`:

| zod                                                       | zod/mini                                                                   |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `z.string().min(1).max(5)`                                | `z.string().check(z.minLength(1), z.maxLength(5))`                         |
| `z.array(x).min(2)`                                       | `z.array(x).check(z.minLength(2))`                                         |
| `z.number().min(1).max(5)`                                | `z.number().check(z.gte(1), z.lte(5))`                                     |
| `z.set(x).min(2)` / `z.map(...).max(3)`                   | `.check(z.minSize(2))` / `.check(z.maxSize(3))`                            |
| `z.string().length(3)`                                    | `z.string().check(z.length(3))`                                            |
| `z.string().refine(fn)`                                   | `z.string().check(z.refine(fn))`                                           |
| `z.string().trim()` / `.toLowerCase()` / `.overwrite(fn)` | `.check(z.trim())` / `.check(z.toLowerCase())` / `.check(z.overwrite(fn))` |
| `z.string().describe('d')`                                | `z.string().check(z.describe('d'))`                                        |
| `z.string().meta({...})`                                  | `z.string().check(z.meta({...}))`                                          |

**String formats** — the deprecated chained spellings do not exist in zod/mini; use the top-level factory:

| zod (deprecated)        | zod (preferred) / zod-mini |
| ----------------------- | -------------------------- |
| `z.string().email()`    | `z.email()`                |
| `z.string().uuid()`     | `z.uuid()`                 |
| `z.string().datetime()` | `z.iso.datetime()`         |

There is **no** `z.min`/`z.max` in zod/mini — the check name depends on the schema type (`minLength` strings & arrays, `gte`/`lte` numbers, `minSize` sets & maps).

**Unchanged (chained in both):** `.check()`, `.brand()`, `.parse()`, `.safeParse()`, `.parseAsync()`, `.safeParseAsync()`; also schema factories (`z.object`, `z.array`, `z.enum`, `z.tuple`, …) and `z.pipe`/`z.transform` composition via factories.

## Guardrails

- **Never mix styles** in any example, spec, doc, or changeset: chained validation methods are `zod`-only; standalone checks inside `.check(...)` are `zod/mini`-only. `z.string().check(z.minLength(1))` under a `'zod'` import is invalid, as is `z.string().min(1)` under `'zod/mini'`.
- One known asymmetry: `prefer-meta` detection in mini uses `isZodNamespace`/`getNamedImportOriginal` directly because `z.describe()` is not a chain method.
- Rule _names, message ids, and option shapes_ stay identical across plugins; only spellings inside human-readable text and code examples differ.
- Chained-name semantics differ by schema type (`.min()` = `gte` on numbers but `minLength` on strings). Do **not** write a per-rule spelling table: call `canonicalizeZodConstraintName(constraint, baseType)` from `@eslint-zod/utils`, which reduces both API styles to one canonical name. Add missing spellings to `packages/utils/src/zod-check-vocabulary.ts` so every rule gains them at once.
- Deprecated chained string formats canonicalize to their top-level factory (`z.string().datetime()` → `iso.datetime`, `.guid()` → `guid`) via `ZOD_STRING_FORMAT_METHODS`. These are `zod`-only spellings — zod/mini uses the top-level factory directly — so a shared rule sees them only through canonicalization.

## Final check

```bash
pnpm test && pnpm lint   # lint includes lint:docs staleness check
```

Grep for cross-contamination before committing, e.g. `.check(z.` inside `plugins/eslint-plugin-zod/` specs/docs, or chained `.min(`/`.optional()` on schemas inside `plugins/eslint-plugin-zod-mini/`.
