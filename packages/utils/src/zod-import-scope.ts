import { trackZodSchemaImports } from './track-zod-schema-imports.js';
import type { ZodSchemaImportTracker, ZodTrackerOptions } from './track-zod-schema-imports.js';

/**
 * Defines the set of import source strings (e.g. `'zod'`, `'zod/mini'`) that a plugin considers in-scope.
 * Used by each plugin's rules to ignore files that import from a different Zod surface.
 *
 * @example
 * ```ts
 * const scope = new ZodImportScope(['zod', 'zod/v4'] as const);
 * scope.isAllowed('zod');      // true
 * scope.isAllowed('zod/mini'); // false
 * ```
 */
export class ZodImportScope<TSources extends ReadonlyArray<string> = ReadonlyArray<string>> {
  /** The list of import source strings recognised by this scope. */
  readonly sources: TSources;

  constructor(sources: TSources) {
    // Copy before freezing:
    // freezing the caller's array in place would be a side effect on their value.
    this.sources = Object.freeze([...sources]) as unknown as TSources;
  }

  /** Returns `true` if `source` is one of the scope's recognised import sources. */
  isAllowed(source: string): source is TSources[number] {
    return this.sources.includes(source);
  }

  /**
   * Creates an import tracker bound to this scope.
   * Call it once per `create(...)` — a tracker accumulates one file's imports.
   *
   * `kind` is required — `'value'` for a rule resolving calls, `'all'` for a type position.
   * Both wrong answers fail silently.
   * Pass `sourceCode` to enable `resolveZodImport` / `resolveZodExport`.
   *
   * @example
   * ```ts
   * const { importDeclarationListener, detectZodSchemaRootNode } =
   * zodImportScope.createTracker({ kind: 'value' });
   * ```
   */
  createTracker(options: ZodTrackerOptions): ZodSchemaImportTracker {
    return trackZodSchemaImports(this, options);
  }
}

/** Pre-built scope for `eslint-plugin-zod`. Recognises `'zod'`, `'zod/v4'`, `'zod/v3'`. */
export const zodImportScope = new ZodImportScope(['zod', 'zod/v4', 'zod/v3'] as const);

/** Pre-built scope for `eslint-plugin-zod-mini`. Recognises `'zod/mini'`, `'zod/v4-mini'`. */
export const zodMiniImportScope = new ZodImportScope(['zod/mini', 'zod/v4-mini'] as const);

/** Pre-built scope for `eslint-plugin-zod-core`. Recognises `'zod/v4/core'`. */
export const zodCoreImportScope = new ZodImportScope(['zod/v4/core'] as const);
