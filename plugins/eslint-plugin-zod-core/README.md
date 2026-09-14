# eslint-plugin-zod-core

[![CI Status][CIBadge]][CIURL]
[![Code style: prettier][CodeStyleBadge]][CodeStyleURL]
[![Lint: eslint][lintBadge]][lintURL]
[![Open on npmx][npmVersionBadge]][npmVersionURL]
[![Open issue tracker][issuesBadge]][issuesURL]

[CIBadge]: https://img.shields.io/github/actions/workflow/status/marcalexiei/eslint-zod/ci.yml?style=for-the-badge&logo=github&event=push&label=CI
[CIURL]: https://github.com/marcalexiei/eslint-zod/actions/workflows/CI.yml/badge.svg
[CodeStyleBadge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge&logo=prettier
[CodeStyleURL]: https://prettier.io
[npmVersionBadge]: https://img.shields.io/npm/v/eslint-plugin-zod-core.svg?style=for-the-badge&logo=npm
[npmVersionURL]: https://npmx.dev/package/eslint-plugin-zod-core
[lintBadge]: https://img.shields.io/badge/lint-eslint-3A33D1?logo=eslint&style=for-the-badge
[lintURL]: https://eslint.org
[issuesBadge]: https://img.shields.io/github/issues/marcalexiei/eslint-zod.svg?style=for-the-badge
[issuesURL]: https://github.com/marcalexiei/eslint-zod/issues

[ESLint](https://eslint.org) plugin that adds custom linting rules to enforce best practices when using [Zod Core](https://zod.dev/packages/core) (`zod/v4/core`).

It can also work with [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)!\
Find out more about [Oxlint's `jsPLugins`](https://oxc.rs/docs/guide/usage/linter/js-plugins.html).

## Rules

<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

| Name                                                                                     | Description                                                                   | 💼  | 🔧  | 💡  |
| :--------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- | :-- | :-- | :-- |
| [consistent-import](docs/rules/consistent-import.md)                                     | Enforce a consistent import style for Zod core                                | ✅  | 🔧  |     |
| [consistent-schema-output-type-style](docs/rules/consistent-schema-output-type-style.md) | Enforce consistent use of core.infer or core.output for schema type inference |     | 🔧  |     |
| [prefer-validate](docs/rules/prefer-validate.md)                                         | Prefer boolean validation when only the success of parsing is used            |     |     | 💡  |

<!-- end auto-generated rules list -->

## Installation

### ESLint

Install `eslint` and `eslint-plugin-zod-core` using your preferred package manager:

```shell
npm i --save-dev eslint eslint-plugin-zod-core
```

```shell
yarn add --dev eslint eslint-plugin-zod-core
```

```shell
pnpm add --save-dev eslint eslint-plugin-zod-core
```

#### ESLint Configuration

1. Import the plugin

   ```ts
   import eslintPluginZodCore from 'eslint-plugin-zod-core';
   ```

2. Add `recommended` config to your ESLint setup

   ```ts
   eslintPluginZodCore.configs.recommended,
   ```

Here's a minimal example using the flat config format:

```ts
// eslint.config.js
import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import eslintPluginZodCore from 'eslint-plugin-zod-core';

export default defineConfig(eslint.configs.recommended, eslintPluginZodCore.configs.recommended);
```

### Oxlint

Install `oxlint` and `eslint-plugin-zod-core` using your preferred package manager:

```shell
npm i --save-dev oxlint eslint-plugin-zod-core
```

```shell
yarn add --dev oxlint eslint-plugin-zod-core
```

```shell
pnpm add --save-dev oxlint eslint-plugin-zod-core
```

#### Oxlint Configuration

1. Import the plugin

   ```ts
   import eslintPluginZodCore from 'eslint-plugin-zod-core';
   ```

2. Add `eslint-plugin-zod-core` to the `jsPlugins` key

   ```ts
   {
     jsPlugins: ['eslint-plugin-zod-core'],
     // ...
   }
   ```

3. Add `eslintPluginZodCore.configs.recommended.rules` to your Oxlint config.\
   Alternatively you can specify the rules manually

Here's a minimal example using the flat config format:

```ts
// oxlint.config.ts
import eslintPluginZodCore from 'eslint-plugin-zod-core';
import { defineConfig } from 'oxlint';

export default defineConfig({
  jsPlugins: ['eslint-plugin-zod-core'],
  rules: {
    ...eslintPluginZodCore.configs.recommended.rules,
  },
});
```
