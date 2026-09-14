# eslint-plugin-zod

[![CI Status][CIBadge]][CIURL]
[![Code style: prettier][CodeStyleBadge]][CodeStyleURL]
[![Lint: eslint][lintBadge]][lintURL]
[![Open on npmx][npmVersionBadge]][npmVersionURL]
[![Open issue tracker][issuesBadge]][issuesURL]

[CIBadge]: https://img.shields.io/github/actions/workflow/status/marcalexiei/eslint-zod/ci.yml?style=for-the-badge&logo=github&event=push&label=CI
[CIURL]: https://github.com/marcalexiei/eslint-zod/actions/workflows/CI.yml/badge.svg
[CodeStyleBadge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge&logo=prettier
[CodeStyleURL]: https://prettier.io
[npmVersionBadge]: https://img.shields.io/npm/v/eslint-plugin-zod.svg?style=for-the-badge&logo=npm
[npmVersionURL]: https://npmx.dev/package/eslint-plugin-zod
[lintBadge]: https://img.shields.io/badge/lint-eslint-3A33D1?logo=eslint&style=for-the-badge
[lintURL]: https://eslint.org
[issuesBadge]: https://img.shields.io/github/issues/marcalexiei/eslint-zod.svg?style=for-the-badge
[issuesURL]: https://github.com/marcalexiei/eslint-zod/issues

[ESLint](https://eslint.org) plugin that adds custom linting rules to enforce best practices when using [Zod](https://github.com/colinhacks/zod).

It can also work with [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)!\
Find out more about [Oxlint's `jsPLugins`](https://oxc.rs/docs/guide/usage/linter/js-plugins.html).

## Rules

<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).\
❌ Deprecated.

| Name                                                                                             | Description                                                                                                                    | 💼  | 🔧  | 💡  | ❌  |
| :----------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :-- | :-- | :-- | :-- |
| [array-style](docs/rules/array-style.md)                                                         | Enforce consistent Zod array style                                                                                             | ✅  | 🔧  |     |     |
| [consistent-import](docs/rules/consistent-import.md)                                             | Enforce a consistent import style for Zod                                                                                      | ✅  | 🔧  |     |     |
| [consistent-import-source](docs/rules/consistent-import-source.md)                               | Enforce consistent source from Zod imports                                                                                     |     |     | 💡  |     |
| [consistent-object-schema-type](docs/rules/consistent-object-schema-type.md)                     | Enforce consistent usage of Zod schema methods                                                                                 |     |     | 💡  |     |
| [consistent-schema-output-type-style](docs/rules/consistent-schema-output-type-style.md)         | Enforce consistent use of z.infer or z.output for schema type inference                                                        |     | 🔧  |     |     |
| [consistent-schema-var-name](docs/rules/consistent-schema-var-name.md)                           | Enforce a consistent naming convention for Zod schema variables                                                                | ✅  |     |     |     |
| [no-any-schema](docs/rules/no-any-schema.md)                                                     | Disallow usage of `z.any()` in Zod schemas                                                                                     | ✅  |     | 💡  |     |
| [no-coerce-boolean](docs/rules/no-coerce-boolean.md)                                             | Disallow `z.coerce.boolean()` because it treats any non-empty string as `true`.                                                | ✅  |     | 💡  |     |
| [no-conflicting-checks](docs/rules/no-conflicting-checks.md)                                     | Disallow check combinations that can never match, are redundant, or do not apply to the schema type                            |     |     |     |     |
| [no-duplicate-schema-methods](docs/rules/no-duplicate-schema-methods.md)                         | Disallow calling the same schema method more than once in a single chain                                                       | ✅  |     |     |     |
| [no-dynamic-schema-value](docs/rules/no-dynamic-schema-value.md)                                 | Disallow non-static values passed as arguments in a Zod schema expression                                                      |     |     |     |     |
| [no-empty-custom-schema](docs/rules/no-empty-custom-schema.md)                                   | Disallow usage of `z.custom()` without arguments                                                                               | ✅  |     |     |     |
| [no-native-enum](docs/rules/no-native-enum.md)                                                   | Disallow deprecated `z.nativeEnum()` in favor of `z.enum()`.                                                                   | ✅  | 🔧  |     |     |
| [no-number-schema-with-finite](docs/rules/no-number-schema-with-finite.md)                       | Disallow deprecated `z.number().finite()`. In Zod 4+ number schemas do not allow infinite values by default, so it is a no-op. | ✅  | 🔧  |     |     |
| [no-number-schema-with-int](docs/rules/no-number-schema-with-int.md)                             | Disallow usage of `z.number().int()` as it is considered legacy                                                                | ✅  | 🔧  |     |     |
| [no-number-schema-with-is-finite](docs/rules/no-number-schema-with-is-finite.md)                 | Disallow using deprecated `isFinite` on a Zod number schema; in v4+ it is always `true`.                                       | ✅  |     |     |     |
| [no-number-schema-with-is-int](docs/rules/no-number-schema-with-is-int.md)                       | Disallow using deprecated `isInt` on a Zod number schema; check the `format` property instead.                                 | ✅  |     |     |     |
| [no-number-schema-with-safe](docs/rules/no-number-schema-with-safe.md)                           | Disallow deprecated `z.number().safe()`. Use `z.int()`; `.safe()` is now identical to `.int()`.                                | ✅  | 🔧  |     |     |
| [no-number-schema-with-step](docs/rules/no-number-schema-with-step.md)                           | Disallow deprecated `z.number().step()`. Use `.multipleOf()` instead.                                                          | ✅  | 🔧  |     |     |
| [no-optional-and-default-together](docs/rules/no-optional-and-default-together.md)               | Disallow using both `.optional()` and `.default()` on the same Zod schema                                                      | ✅  | 🔧  |     |     |
| [no-promise-schema](docs/rules/no-promise-schema.md)                                             | Disallow deprecated `z.promise()` schemas.                                                                                     | ✅  |     |     |     |
| [no-schema-with-is-nullable](docs/rules/no-schema-with-is-nullable.md)                           | Disallow deprecated `.isNullable()` on a Zod schema; use `safeParse(null).success` instead.                                    | ✅  |     |     |     |
| [no-schema-with-is-optional](docs/rules/no-schema-with-is-optional.md)                           | Disallow deprecated `.isOptional()` on a Zod schema; use `safeParse(undefined).success` instead.                               | ✅  |     |     |     |
| [no-string-schema-with-uuid](docs/rules/no-string-schema-with-uuid.md)                           | Disallow usage of `z.string().uuid()` in favor of the dedicated `z.uuid()` schema                                              |     | 🔧  |     | ❌  |
| [no-throw-in-refine](docs/rules/no-throw-in-refine.md)                                           | Disallow throwing errors directly inside Zod refine callbacks                                                                  | ✅  |     |     |     |
| [no-transform-in-record-key](docs/rules/no-transform-in-record-key.md)                           | Disallow transforms in z.record() key schemas, which can cause silent key mutations and data loss through key collisions       |     |     |     |     |
| [no-unknown-schema](docs/rules/no-unknown-schema.md)                                             | Disallow usage of `z.unknown()` in Zod schemas                                                                                 |     |     |     |     |
| [no-unnecessary-readonly](docs/rules/no-unnecessary-readonly.md)                                 | Disallow `.readonly()` on schemas whose output is already immutable                                                            |     | 🔧  |     |     |
| [prefer-enum-over-literal-union](docs/rules/prefer-enum-over-literal-union.md)                   | Prefer `z.enum()` over `z.union()` when all members are string literals.                                                       | ✅  | 🔧  |     |     |
| [prefer-loose-object](docs/rules/prefer-loose-object.md)                                         | Prefer `z.looseObject()` over `z.object().passthrough()` and `z.object().loose()`                                              | ✅  | 🔧  |     |     |
| [prefer-map-set-size-over-min-max](docs/rules/prefer-map-set-size-over-min-max.md)               | Prefer `.size(n)` over `.min(n).max(n)` with the same value on a set or map schema                                             |     | 🔧  |     |     |
| [prefer-meta](docs/rules/prefer-meta.md)                                                         | Enforce usage of `.meta()` over `.describe()`                                                                                  | ✅  | 🔧  |     |     |
| [prefer-meta-last](docs/rules/prefer-meta-last.md)                                               | Enforce `.meta()` as last method                                                                                               | ✅  | 🔧  |     |     |
| [prefer-nullish](docs/rules/prefer-nullish.md)                                                   | Enforce `.nullish()` instead of combining `.optional()` and `.nullable()`                                                      | ✅  | 🔧  |     |     |
| [prefer-strict-object](docs/rules/prefer-strict-object.md)                                       | Prefer `z.strictObject()` over `z.object().strict()`                                                                           | ✅  | 🔧  |     |     |
| [prefer-string-length-over-min-max](docs/rules/prefer-string-length-over-min-max.md)             | Prefer `.length(n)` over `.min(n).max(n)` with the same value on a string schema                                               |     | 🔧  |     |     |
| [prefer-string-schema-with-trim](docs/rules/prefer-string-schema-with-trim.md)                   | Enforce `z.string().trim()` to prevent accidental leading/trailing whitespace                                                  | ✅  | 🔧  |     |     |
| [prefer-top-level-string-formats](docs/rules/prefer-top-level-string-formats.md)                 | Prefer top-level string format schemas over deprecated `z.string().<format>()` methods                                         | ✅  | 🔧  |     |     |
| [prefer-trim-before-string-length-checks](docs/rules/prefer-trim-before-string-length-checks.md) | Enforce `.trim()` is called before string length checks to ensure accurate validation                                          | ✅  | 🔧  |     |     |
| [prefer-tuple-over-array-length](docs/rules/prefer-tuple-over-array-length.md)                   | Prefer `z.tuple()` over a length-constrained `z.array()` so the length is preserved in the inferred type.                      |     | 🔧  |     |     |
| [require-brand-type-parameter](docs/rules/require-brand-type-parameter.md)                       | Require type parameter on `.brand()` functions                                                                                 | ✅  |     | 💡  |     |
| [require-error-message](docs/rules/require-error-message.md)                                     | Enforce that custom refinements include an error message                                                                       | ✅  | 🔧  |     |     |
| [schema-error-property-style](docs/rules/schema-error-property-style.md)                         | Enforce consistent style for error messages in Zod schema validation (using ESQuery patterns)                                  |     |     |     |     |

<!-- end auto-generated rules list -->

## Installation

### ESLint

Install `eslint` and `eslint-plugin-zod` using your preferred package manager:

```shell
npm i --save-dev eslint eslint-plugin-zod
```

```shell
yarn add --dev eslint eslint-plugin-zod
```

```shell
pnpm add --save-dev eslint eslint-plugin-zod
```

#### ESLint Configuration

1. Import the plugin

   ```ts
   import eslintPluginZod from 'eslint-plugin-zod';
   ```

2. Add `recommended` config to your ESLint setup

   ```ts
   eslintPluginZod.configs.recommended,
   ```

Here's a minimal example using the flat config format:

```ts
// eslint.config.js
import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import eslintPluginZod from 'eslint-plugin-zod';

export default defineConfig(eslint.configs.recommended, eslintPluginZod.configs.recommended);
```

### Oxlint

Install `oxlint` and `eslint-plugin-zod` using your preferred package manager:

```shell
npm i --save-dev oxlint eslint-plugin-zod
```

```shell
yarn add --dev oxlint eslint-plugin-zod
```

```shell
pnpm add --save-dev oxlint eslint-plugin-zod
```

#### Oxlint Configuration

1. Import the plugin

   ```ts
   import eslintPluginZod from 'eslint-plugin-zod';
   ```

2. Add `eslint-plugin-zod` to the `jsPlugins` key

   ```ts
   {
     jsPlugins: ['eslint-plugin-zod'],
     // ...
   }
   ```

3. Add `eslintPluginZod.configs.recommended.rules` to your Oxlint config.\
   Alternatively you can specify the rules manually

Here's a minimal example using the flat config format:

```ts
// oxlint.config.ts
import eslintPluginZod from 'eslint-plugin-zod';
import { defineConfig } from 'oxlint';

export default defineConfig({
  jsPlugins: ['eslint-plugin-zod'],
  rules: {
    ...eslintPluginZod.configs.recommended.rules,
  },
});
```

## Zod peer dependency version

`eslint-plugin-zod` is designed for projects that use `zod@^4`.
While the plugin analyzes Zod schemas in your code,
it doesn't import or depend on Zod at runtime.
To document this relationship without forcing installation,
Zod is declared as an optional peer dependency in the plugin's `package.json`.

If your project uses Zod v4, the plugin will automatically lint your schemas.
If you're not using Zod (for example, in a separate ESLint workspace), you don't need to install it.
