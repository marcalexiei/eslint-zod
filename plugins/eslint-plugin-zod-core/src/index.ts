import type { ESLint, Linter, Rule } from 'eslint';

import { PLUGIN_NAME, PLUGIN_VERSION } from './meta.js';
import { consistentImport } from './rules/consistent-import.js';
import { consistentSchemaOutputTypeStyle } from './rules/consistent-schema-output-type-style.js';
import { noDuplicateUnionMembers } from './rules/no-duplicate-union-members.js';
import { preferValidate } from './rules/prefer-validate.js';

interface CompatibleConfig {
  name?: string;
  rules?: object;
  plugins?: Record<string, CompatiblePlugin>;
}

interface CompatiblePlugin {
  meta: {
    name: string;
    version: string;
  };
}

const eslintPluginZodCore = {
  meta: {
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
  },
  rules: {
    'consistent-import': consistentImport,
    'consistent-schema-output-type-style': consistentSchemaOutputTypeStyle,
    'no-duplicate-union-members': noDuplicateUnionMembers,
    'prefer-validate': preferValidate,
  } as unknown as Record<string, Rule.RuleModule>,
} satisfies ESLint.Plugin as CompatiblePlugin;

// The configs register this same object, so users can register it under the same name.
const plugin = {
  ...eslintPluginZodCore,
  configs: {} as Record<'recommended', CompatibleConfig>,
} satisfies ESLint.Plugin;

plugin.configs.recommended = {
  name: `${PLUGIN_NAME}/recommended`,
  files: ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}'],
  plugins: {
    'zod-core': plugin,
  },
  rules: {
    'zod-core/consistent-import': 'error',
    'zod-core/no-duplicate-union-members': 'error',
  },
} satisfies Linter.Config as CompatibleConfig;

export default plugin;
/**
 * why `satisfies`?
 * @see https://github.com/marcalexiei/eslint-zod/issues/49
 */
