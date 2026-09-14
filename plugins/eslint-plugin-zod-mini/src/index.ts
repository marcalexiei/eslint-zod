import type { ESLint, Linter, Rule } from 'eslint';

import { PLUGIN_NAME, PLUGIN_VERSION } from './meta.js';
import { consistentImportSource } from './rules/consistent-import-source.js';
import { consistentImport } from './rules/consistent-import.js';
import { consistentObjectSchemaType } from './rules/consistent-object-schema-type.js';
import { consistentSchemaOutputTypeStyle } from './rules/consistent-schema-output-type-style.js';
import { consistentSchemaVarName } from './rules/consistent-schema-var-name.js';
import { noAnySchema } from './rules/no-any-schema.js';
import { noCoerceBoolean } from './rules/no-coerce-boolean.js';
import { noConflictingChecks } from './rules/no-conflicting-checks.js';
import { noDuplicateSchemaMethods } from './rules/no-duplicate-schema-methods.js';
import { noDynamicSchemaValue } from './rules/no-dynamic-schema-value.js';
import { noEmptyCustomSchema } from './rules/no-empty-custom-schema.js';
import { noFunctionScopedSchema } from './rules/no-function-scoped-schema.js';
import { noNativeEnum } from './rules/no-native-enum.js';
import { noPromiseSchema } from './rules/no-promise-schema.js';
import { noThrowInRefine } from './rules/no-throw-in-refine.js';
import { noTransformInRecordKey } from './rules/no-transform-in-record-key.js';
import { noUnknownSchema } from './rules/no-unknown-schema.js';
import { noUnnecessaryReadonly } from './rules/no-unnecessary-readonly.js';
import { preferEnumOverLiteralUnion } from './rules/prefer-enum-over-literal-union.js';
import { preferMapSetSizeOverMinMax } from './rules/prefer-map-set-size-over-min-max.js';
import { preferMeta } from './rules/prefer-meta.js';
import { preferNullish } from './rules/prefer-nullish.js';
import { preferStringLengthOverMinMax } from './rules/prefer-string-length-over-min-max.js';
import { preferTupleOverArrayLength } from './rules/prefer-tuple-over-array-length.js';
import { preferValidate } from './rules/prefer-validate.js';
import { requireBrandTypeParameter } from './rules/require-brand-type-parameter.js';
import { requireErrorMessage } from './rules/require-error-message.js';
import { schemaErrorPropertyStyle } from './rules/schema-error-property-style.js';

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

const eslintPluginZodMini = {
  meta: {
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
  },
  rules: {
    'consistent-import': consistentImport,
    'consistent-import-source': consistentImportSource,
    'consistent-object-schema-type': consistentObjectSchemaType,
    'consistent-schema-output-type-style': consistentSchemaOutputTypeStyle,
    'consistent-schema-var-name': consistentSchemaVarName,
    'no-any-schema': noAnySchema,
    'no-coerce-boolean': noCoerceBoolean,
    'no-conflicting-checks': noConflictingChecks,
    'no-duplicate-schema-methods': noDuplicateSchemaMethods,
    'no-dynamic-schema-value': noDynamicSchemaValue,
    'no-empty-custom-schema': noEmptyCustomSchema,
    'no-function-scoped-schema': noFunctionScopedSchema,
    'no-native-enum': noNativeEnum,
    'no-promise-schema': noPromiseSchema,
    'no-throw-in-refine': noThrowInRefine,
    'no-transform-in-record-key': noTransformInRecordKey,
    'no-unknown-schema': noUnknownSchema,
    'no-unnecessary-readonly': noUnnecessaryReadonly,
    'prefer-enum-over-literal-union': preferEnumOverLiteralUnion,
    'prefer-map-set-size-over-min-max': preferMapSetSizeOverMinMax,
    'prefer-meta': preferMeta,
    'prefer-nullish': preferNullish,
    'prefer-string-length-over-min-max': preferStringLengthOverMinMax,
    'prefer-tuple-over-array-length': preferTupleOverArrayLength,
    'prefer-validate': preferValidate,
    'require-brand-type-parameter': requireBrandTypeParameter,
    'require-error-message': requireErrorMessage,
    'schema-error-property-style': schemaErrorPropertyStyle,
  } as unknown as Record<string, Rule.RuleModule>,
} satisfies ESLint.Plugin as CompatiblePlugin;

const baseConfig = {
  name: `${PLUGIN_NAME}/recommended`,
  files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
  plugins: {
    'zod-mini': eslintPluginZodMini,
  },
};

const recommendedConfig = {
  ...baseConfig,
  rules: {
    'zod-mini/consistent-import': 'error',
    'zod-mini/consistent-schema-var-name': 'error',
    'zod-mini/no-any-schema': 'error',
    'zod-mini/no-coerce-boolean': 'error',
    'zod-mini/no-duplicate-schema-methods': 'error',
    'zod-mini/no-empty-custom-schema': 'error',
    'zod-mini/no-native-enum': 'error',
    'zod-mini/no-promise-schema': 'error',
    'zod-mini/no-throw-in-refine': 'error',
    'zod-mini/prefer-enum-over-literal-union': 'error',
    'zod-mini/prefer-meta': 'error',
    'zod-mini/prefer-nullish': 'error',
    'zod-mini/require-brand-type-parameter': 'error',
    'zod-mini/require-error-message': 'error',
  },
} satisfies Linter.Config as CompatibleConfig;

export default {
  ...eslintPluginZodMini,
  configs: {
    recommended: recommendedConfig,
  },
} satisfies ESLint.Plugin;
/**
 * why `satisfies`?
 * @see https://github.com/marcalexiei/eslint-zod/issues/49
 */
