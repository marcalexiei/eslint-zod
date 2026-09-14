import type { ESLint, Linter, Rule } from 'eslint';

import { PLUGIN_NAME, PLUGIN_VERSION } from './meta.js';
import { consistentImport } from './rules/consistent-import.js';
import { consistentSchemaOutputTypeStyle } from './rules/consistent-schema-output-type-style.js';
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
    'prefer-validate': preferValidate,
  } as unknown as Record<string, Rule.RuleModule>,
} satisfies ESLint.Plugin as CompatiblePlugin;

const baseConfig = {
  name: `${PLUGIN_NAME}/recommended`,
  files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
  plugins: {
    'zod-core': eslintPluginZodCore,
  },
};

const recommendedConfig = {
  ...baseConfig,
  rules: {
    'zod-core/consistent-import': 'error',
  },
} satisfies Linter.Config as CompatibleConfig;

export default {
  ...eslintPluginZodCore,
  configs: {
    recommended: recommendedConfig,
  },
} satisfies ESLint.Plugin;
/**
 * why `satisfies`?
 * @see https://github.com/marcalexiei/eslint-zod/issues/49
 */
