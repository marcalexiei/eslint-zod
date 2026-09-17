# Contributing

Thank you for considering a contribution!

This document explains how to set up the project locally, run tests and linters, update documentation, and send changes via pull requests.

## Repository structure

This is a pnpm monorepo with three published ESLint plugins and a shared utilities package:

| Package                  | Directory                         |
| ------------------------ | --------------------------------- |
| `eslint-plugin-zod`      | `plugins/eslint-plugin-zod/`      |
| `eslint-plugin-zod-mini` | `plugins/eslint-plugin-zod-mini/` |
| `eslint-plugin-zod-core` | `plugins/eslint-plugin-zod-core/` |
| `@eslint-zod/utils`      | `packages/utils/`                 |

One private package supports them: `@eslint-zod/tooling` (`packages/tooling/`), with a directory per tool — `vitest` (project config, plus the plugin-consistency spec helpers under `vitest/spec-helpers`), `tsdown`, and `eslint-doc-generator`. Each package's own config file calls one of those exports. The Vitest entry is plain JavaScript on purpose: the test matrix runs Node 20, which cannot load TypeScript.

`@eslint-zod/utils` contains AST helpers (exported from `@eslint-zod/utils`) and shared rule `create` factories (exported per-file from `@eslint-zod/utils/rule-builders/<rule-name>`). Rule metadata lives entirely per-plugin.

Several rules exist in **different** plugins with the same name and intent but adapted to each plugin's API style.
E.g., `zod` uses chained methods; `zod/mini` uses standalone `$ZodCheck` functions.

When modifying a shared rule, keep both plugins in sync (code, specs, and docs).\
If the `create` logic is shared, it lives in `packages/utils/src/rule-builders/<rule-name>.ts` and is imported by each plugin from `@eslint-zod/utils/rule-builders/<rule-name>`.

---

## Quick start ✅

Detailed setup instructions are available here:

<https://marcalexiei.github.io/contribute/setup-pnpm-nvm.html>

To install dependencies and verify your environment:

```shell
pnpm install
pnpm run check-all
```

`pnpm install` also installs the Git hooks (see **Git hooks** below).

---

## TypeScript configuration

Each package and plugin has two `tsconfig` files:

| File                   | Purpose                                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tsconfig.json`        | Used by `tsc -b`. Has `composite: true` and `references` for correct incremental build ordering.                                                                                                                                                       |
| `tsconfig.eslint.json` | Used by `eslint.config.js`. No `composite`, no `references` — this lets `@typescript-eslint/parser` resolve `@eslint-zod/utils` to source via the `@eslint-zod/source` custom condition, so type errors propagate across packages in both CLI and IDE. |

When adding a new package or plugin, create both files following the existing pattern.

---

## Run tests 🧪

- Run the full test suite (all packages):

```shell
pnpm test
```

---

## Linting & formatting 🔧

- Run all linters and checks:

```shell
pnpm run lint
```

- Fix JS lint issues automatically:

```shell
pnpm run lint:js:fix
```

- Fix formatting:

```shell
pnpm run format
```

- Make sure docs are in sync (runs across all plugins):

```shell
pnpm run lint:docs
```

To _update_ generated rule docs from the source code, run from the relevant plugin directory (or use `--filter`):

```shell
# from plugins/eslint-plugin-zod/ or plugins/eslint-plugin-zod-mini/
pnpm run build:docs
```

- Check that the published packages resolve their types correctly — `@arethetypeswrong/cli` over a `pnpm pack` tarball of each published package:

```shell
pnpm run build
pnpm run lint:publish
```

This inspects `dist`, so it needs a build first. It is not part of `pnpm run lint` for that reason.

---

## Git hooks 🪝

[Lefthook](https://lefthook.dev) manages the hooks; `pnpm install` installs them through the root `prepare` script. The configuration is [`lefthook.yml`](./lefthook.yml).

| Hook         | What it runs                                              |
| ------------ | --------------------------------------------------------- |
| `pre-commit` | Prettier and ESLint over the staged files, fixes restaged |
| `pre-push`   | `pnpm run typecheck` and `pnpm test`                      |

The build and the published-artifact checks are deliberately left out — they need a current `dist`, so CI is the only place they are guaranteed to be meaningful.

To skip the hooks for one command, use Git's own flag (`git commit --no-verify`). For personal overrides, create a `lefthook-local.yml`; it is git-ignored.

(This command runs a build first, so you don't need to run `pnpm run build` manually.)

---

## Rule documentation

Each plugin has its own `docs/rules/` folder. If you change a rule's behavior, update its documentation and run `pnpm run build:docs` from that plugin's directory to regenerate the docs.

If the rule exists in both plugins (see the shared rules list in `AGENTS.md`), update both plugins' docs and regenerate both.

---

## Commit rules & commit messages ✍️

We follow the commit rules described here:

<https://marcalexiei.github.io/contribute/commit-rules.html>

Please ensure your commit messages are clear and follow the repository conventions.

---

## Pull requests & workflow 🔁

- Fork the repository and create a branch with a descriptive name.
- Open a pull request against `main` and include a short description of the changes and the reasoning.
- Run `pnpm run check-all`.
- If your change affects docs, include the updated docs or run `pnpm run build:docs` from the relevant plugin directory and include the generated files.

---

## Release 🚀

Releases are handled via Changesets. See the release guide for details:

<https://marcalexiei.github.io/contribute/release-changesets.html>

---

Thank you for helping improve the project — contributions are welcome!
