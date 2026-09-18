// import tracking & scopes
export type {
  ZodChainItem,
  ZodImportBinding,
  ZodImportKind,
  ZodSchemaImportTracker,
  ZodSchemaVisitorOptions,
  ZodTrackerOptions,
} from './track-zod-schema-imports.js';
export {
  ZodImportScope,
  zodCoreImportScope,
  zodImportScope,
  zodMiniImportScope,
} from './zod-import-scope.js';

// schema detection & navigation
export type { ZodSchemaMeta } from './detect-zod-schema-root-node.js';
export { findParentSchemaMatchingCondition } from './find-parent-schema-matching-condition.js';
export { getZodChainedMethodNames } from './get-zod-chained-method-names.js';
export { getZodSchemaBaseType } from './get-zod-schema-base-type.js';
export type { ZodSchemaBaseType } from './get-zod-schema-base-type.js';
export type {
  ZodChainedConstraint,
  ZodCheckArgumentConstraint,
  ZodSchemaConstraint,
} from './collect-zod-schema-constraints.js';

// fixer helpers
export { buildZodChainRemoveMethodFix } from './build-zod-chain-remove-method-fix.js';
export { buildZodChainReplacementFix } from './build-zod-chain-replacement-fix.js';
export { buildZodConstraintsRemoveFix } from './build-zod-constraints-remove-fix.js';
export { buildZodWrapperUnwrapFix } from './build-zod-wrapper-unwrap-fix.js';

// zod vocabulary tables
export { ZOD_IMMUTABLE_SCHEMA_TYPES } from './zod-immutable-schema-types.js';
export { ZOD_MUTATING_CHECK_NAMES } from './zod-mutating-check-names.js';
export {
  ZOD_NON_SCHEMA_HELPER_NAMES,
  isZodNonSchemaHelperCall,
} from './zod-non-schema-helper-names.js';
export { ZOD_NON_SCHEMA_PRODUCING_METHODS } from './zod-non-schema-producing-methods.js';
export {
  ZOD_SCHEMA_FACTORY_NAMES,
  isZodSchemaFactoryCall,
  isZodSchemaFactoryName,
} from './zod-schema-factory-names.js';
export { ZOD_STRING_FORMAT_METHODS } from './zod-string-format-methods.js';
export type { ZodStringFormatMethodName } from './zod-string-format-methods.js';
export { ZOD_STRING_FORMAT_NAMES } from './zod-string-format-names.js';

// check vocabulary — canonical names and what each check means
export { canonicalizeZodConstraintName, getZodCheckDescriptor } from './zod-check-vocabulary.js';
export type { ZodCheckBound, ZodCheckDescriptor, ZodCheckDomain } from './zod-check-vocabulary.js';
