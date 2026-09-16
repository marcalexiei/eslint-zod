# eslint-plugin-zod

[![CI Status][CIBadge]][CIURL]
[![Code style: prettier][CodeStyleBadge]][CodeStyleURL]
[![Lint: eslint][lintBadge]][lintURL]
[![Open issue tracker][issuesBadge]][issuesURL]

[CIBadge]: https://img.shields.io/github/actions/workflow/status/marcalexiei/eslint-zod/ci.yml?style=for-the-badge&logo=github&event=push&label=CI
[CIURL]: https://github.com/marcalexiei/eslint-zod/actions/workflows/CI.yml/badge.svg
[CodeStyleBadge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge&logo=prettier
[CodeStyleURL]: https://prettier.io
[lintBadge]: https://img.shields.io/badge/lint-eslint-3A33D1?logo=eslint&style=for-the-badge
[lintURL]: https://eslint.org
[issuesBadge]: https://img.shields.io/github/issues/marcalexiei/eslint-zod.svg?style=for-the-badge
[issuesURL]: https://github.com/marcalexiei/eslint-zod/issues

Monorepo containing [ESLint](https://eslint.org) plugins that enforce best practices when using [Zod](https://github.com/colinhacks/zod).

Both plugins can also work with [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)!\
Find out more about [Oxlint's `jsPlugins`](https://oxc.rs/docs/guide/usage/linter/js-plugins.html).

## Plugins

| Package                                                  | Version                                           | Description             |
| :------------------------------------------------------- | :------------------------------------------------ | :---------------------- |
| [eslint-plugin-zod](plugins/eslint-plugin-zod)           | [![Open on npmx][npmZodBadge]][npmZodURL]         | Rules for `zod`         |
| [eslint-plugin-zod-mini](plugins/eslint-plugin-zod-mini) | [![Open on npmx][npmZodMiniBadge]][npmZodMiniURL] | Rules for `zod/mini`    |
| [eslint-plugin-zod-core](plugins/eslint-plugin-zod-core) | [![Open on npmx][npmZodCoreBadge]][npmZodCoreURL] | Rules for `zod/v4/core` |

[npmZodBadge]: https://npmx.dev/api/registry/badge/version/eslint-plugin-zod
[npmZodURL]: https://npmx.dev/package/eslint-plugin-zod
[npmZodMiniBadge]: https://npmx.dev/api/registry/badge/version/eslint-plugin-zod-mini
[npmZodMiniURL]: https://npmx.dev/package/eslint-plugin-zod-mini
[npmZodCoreBadge]: https://npmx.dev/api/registry/badge/version/eslint-plugin-zod-core
[npmZodCoreURL]: https://npmx.dev/package/eslint-plugin-zod-core

## Packages

| Package                             | Version                                       | Description                                 |
| :---------------------------------- | :-------------------------------------------- | :------------------------------------------ |
| [@eslint-zod/utils](packages/utils) | [![Open on npmx][npmUtilsBadge]][npmUtilsURL] | Shared AST utilities for eslint-zod plugins |

[npmUtilsBadge]: https://npmx.dev/api/registry/badge/version/@eslint-zod/utils
[npmUtilsURL]: https://npmx.dev/package/@eslint-zod/utils
