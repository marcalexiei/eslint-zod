import type { ESLint, Linter, Rule } from 'eslint';

import { PLUGIN_NAME, PLUGIN_VERSION } from './meta.js';
import { arrayStyle } from './rules/array-style.js';
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
import { noNumberSchemaWithFinite } from './rules/no-number-schema-with-finite.js';
import { noNumberSchemaWithInt } from './rules/no-number-schema-with-int.js';
import { noNumberSchemaWithIsFinite } from './rules/no-number-schema-with-is-finite.js';
import { noNumberSchemaWithIsInt } from './rules/no-number-schema-with-is-int.js';
import { noNumberSchemaWithSafe } from './rules/no-number-schema-with-safe.js';
import { noNumberSchemaWithStep } from './rules/no-number-schema-with-step.js';
import { noOptionalAndDefaultTogether } from './rules/no-optional-and-default-together.js';
import { noPromiseSchema } from './rules/no-promise-schema.js';
import { noSchemaWithIsNullable } from './rules/no-schema-with-is-nullable.js';
import { noSchemaWithIsOptional } from './rules/no-schema-with-is-optional.js';
import { noStringSchemaWithUuid } from './rules/no-string-schema-with-uuid.js';
import { noThrowInRefine } from './rules/no-throw-in-refine.js';
import { noTransformInRecordKey } from './rules/no-transform-in-record-key.js';
import { noUnknownSchema } from './rules/no-unknown-schema.js';
import { noUnnecessaryReadonly } from './rules/no-unnecessary-readonly.js';
import { preferEnumOverLiteralUnion } from './rules/prefer-enum-over-literal-union.js';
import { preferLooseObject } from './rules/prefer-loose-object.js';
import { preferMapSetSizeOverMinMax } from './rules/prefer-map-set-size-over-min-max.js';
import { preferMetaLast } from './rules/prefer-meta-last.js';
import { preferMeta } from './rules/prefer-meta.js';
import { preferNullish } from './rules/prefer-nullish.js';
import { preferStrictObject } from './rules/prefer-strict-object.js';
import { preferStringLengthOverMinMax } from './rules/prefer-string-length-over-min-max.js';
import { preferStringSchemaWithTrim } from './rules/prefer-string-schema-with-trim.js';
import { preferTopLevelStringFormats } from './rules/prefer-top-level-string-formats.js';
import { preferTrimBeforeStringLengthChecks } from './rules/prefer-trim-before-string-length-checks.js';
import { preferTupleOverArrayLength } from './rules/prefer-tuple-over-array-length.js';
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

const eslintPluginZod = {
  meta: {
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
  },
  rules: {
    'array-style': arrayStyle,
    'consistent-import-source': consistentImportSource,
    'consistent-import': consistentImport,
    'consistent-object-schema-type': consistentObjectSchemaType,
    'consistent-schema-var-name': consistentSchemaVarName,
    'consistent-schema-output-type-style': consistentSchemaOutputTypeStyle,
    'no-any-schema': noAnySchema,
    'no-coerce-boolean': noCoerceBoolean,
    'no-conflicting-checks': noConflictingChecks,
    'no-duplicate-schema-methods': noDuplicateSchemaMethods,
    'no-dynamic-schema-value': noDynamicSchemaValue,
    'no-empty-custom-schema': noEmptyCustomSchema,
    'no-function-scoped-schema': noFunctionScopedSchema,
    'no-native-enum': noNativeEnum,
    'no-number-schema-with-finite': noNumberSchemaWithFinite,
    'no-number-schema-with-int': noNumberSchemaWithInt,
    'no-number-schema-with-is-finite': noNumberSchemaWithIsFinite,
    'no-number-schema-with-is-int': noNumberSchemaWithIsInt,
    'no-number-schema-with-safe': noNumberSchemaWithSafe,
    'no-number-schema-with-step': noNumberSchemaWithStep,
    'no-string-schema-with-uuid': noStringSchemaWithUuid,
    'no-optional-and-default-together': noOptionalAndDefaultTogether,
    'no-promise-schema': noPromiseSchema,
    'no-schema-with-is-nullable': noSchemaWithIsNullable,
    'no-schema-with-is-optional': noSchemaWithIsOptional,
    'no-throw-in-refine': noThrowInRefine,
    'no-transform-in-record-key': noTransformInRecordKey,
    'no-unknown-schema': noUnknownSchema,
    'no-unnecessary-readonly': noUnnecessaryReadonly,
    'prefer-enum-over-literal-union': preferEnumOverLiteralUnion,
    'prefer-loose-object': preferLooseObject,
    'prefer-map-set-size-over-min-max': preferMapSetSizeOverMinMax,
    'prefer-meta': preferMeta,
    'prefer-meta-last': preferMetaLast,
    'prefer-nullish': preferNullish,
    'prefer-strict-object': preferStrictObject,
    'prefer-string-length-over-min-max': preferStringLengthOverMinMax,
    'prefer-top-level-string-formats': preferTopLevelStringFormats,
    'prefer-string-schema-with-trim': preferStringSchemaWithTrim,
    'prefer-trim-before-string-length-checks': preferTrimBeforeStringLengthChecks,
    'prefer-tuple-over-array-length': preferTupleOverArrayLength,
    'require-brand-type-parameter': requireBrandTypeParameter,
    'require-error-message': requireErrorMessage,
    'schema-error-property-style': schemaErrorPropertyStyle,
  } as unknown as Record<string, Rule.RuleModule>,
} satisfies ESLint.Plugin as CompatiblePlugin;

const baseConfig = {
  name: `${PLUGIN_NAME}/recommended`,
  files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
  plugins: {
    zod: eslintPluginZod,
  },
};

const recommendedConfig = {
  ...baseConfig,
  rules: {
    'zod/array-style': 'error',
    'zod/consistent-import': 'error',
    'zod/consistent-schema-var-name': 'error',
    'zod/no-any-schema': 'error',
    'zod/no-coerce-boolean': 'error',
    'zod/no-duplicate-schema-methods': 'error',
    'zod/no-empty-custom-schema': 'error',
    'zod/no-native-enum': 'error',
    'zod/no-number-schema-with-finite': 'error',
    'zod/no-number-schema-with-int': 'error',
    'zod/no-number-schema-with-is-finite': 'error',
    'zod/no-number-schema-with-is-int': 'error',
    'zod/no-number-schema-with-safe': 'error',
    'zod/no-number-schema-with-step': 'error',
    'zod/no-optional-and-default-together': 'error',
    'zod/no-promise-schema': 'error',
    'zod/no-schema-with-is-nullable': 'error',
    'zod/no-schema-with-is-optional': 'error',
    'zod/no-throw-in-refine': 'error',
    'zod/prefer-enum-over-literal-union': 'error',
    'zod/prefer-loose-object': 'error',
    'zod/prefer-meta': 'error',
    'zod/prefer-meta-last': 'error',
    'zod/prefer-nullish': 'error',
    'zod/prefer-strict-object': 'error',
    'zod/prefer-top-level-string-formats': 'error',
    'zod/prefer-string-schema-with-trim': 'error',
    'zod/prefer-trim-before-string-length-checks': 'error',
    'zod/require-brand-type-parameter': 'error',
    'zod/require-error-message': 'error',
  },
} satisfies Linter.Config as CompatibleConfig;

export default {
  ...eslintPluginZod,
  configs: {
    recommended: recommendedConfig,
  },
} satisfies ESLint.Plugin;
/**
 * why `satisfies`?
 * @see https://github.com/marcalexiei/eslint-zod/issues/49
 */
