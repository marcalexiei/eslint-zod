import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils, AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';

import { collectZodSchemaConstraints } from './collect-zod-schema-constraints.js';
import type { ZodSchemaConstraint } from './collect-zod-schema-constraints.js';
import { detectZodSchemaRootNode, isZodSchemaOfType } from './detect-zod-schema-root-node.js';
import type { ZodImports, ZodSchemaMeta } from './detect-zod-schema-root-node.js';
import { getStaticPropertyName } from './get-static-property-name.js';
import type { ZodImportScope } from './zod-import-scope.js';

/** One zod import: the export it names, its local identifier, and the declaration carrying it. */
export interface ZodImportBinding {
  /** The zod export name, or `'*'` for a namespace (`import * as z`, `import { z }`). */
  name: string;
  local: TSESTree.Identifier;
  declaration: TSESTree.ImportDeclaration;
}

/**
 * Which import specifiers a tracker records.
 *
 * - `value` — skip `import type { … }` and `{ type … }`, which a call-site rule wants:
 * those bindings are erased at runtime.
 * - `type` — only those.
 * - `all` — both, for a rule reading a type position, which either form reaches.
 */
export type ZodImportKind = 'value' | 'type' | 'all';

/** Options for {@link ZodImportScope.createTracker}. */
export interface ZodTrackerOptions {
  /**
   * Required, because both wrong answers fail silently.
   * A call-site rule wants `'value'`; see {@link ZodImportKind}.
   */
  kind: ZodImportKind;
  /** Enables the scope-aware `resolveZodImport` / `resolveZodExport`. */
  sourceCode?: TSESLint.SourceCode;
}

/** One call in a zod chain: the method's name and the call expression carrying it. */
export interface ZodChainItem {
  name: string;
  node: TSESTree.CallExpression;
}

/** Options for {@link ZodSchemaImportTracker.createSchemaVisitor}. */
export interface ZodSchemaVisitorOptions<TSchemaType extends string> {
  /**
   * Only run `onSchema` for these factories —
   * one name (`'string'`) or a list (`ZOD_OBJECT_METHODS`).
   * Omit to receive every zod schema.
   */
  schemaType?: TSchemaType | ReadonlyArray<TSchemaType>;

  /** Called with each matching schema root and its detection metadata. */
  onSchema: (
    node: TSESTree.CallExpression,
    meta: ZodSchemaMeta & { schemaType: TSchemaType },
  ) => void;
}

export interface ZodSchemaImportTracker {
  /**
   * Add this handler to your `ImportDeclaration` node visitor to allow tracking of `zod` imports
   *
   * @example
   * ```ts
   * const tracker = scope.createTracker({ kind: 'value' });
   *
   * return {
   * ImportDeclaration: tracker.importDeclarationListener,
   * }
   * ```
   */
  importDeclarationListener: (node: TSESTree.ImportDeclaration) => void;

  /**
   * Builds the `{ ImportDeclaration, CallExpression }` visitor almost every rule needs:
   * it wires `importDeclarationListener`,
   * detects the schema root and applies the `schemaType` filter, so `onSchema` only sees matches.
   *
   * Prefer this over hand-wiring the two listeners —
   * forgetting `ImportDeclaration` silently disables detection for the whole file.
   * Spread it to add more visitor keys.
   *
   * @example
   * ```ts
   * return tracker.createSchemaVisitor({
   * schemaType: 'string',
   * onSchema(node, meta) { ... },
   * });
   * ```
   */
  createSchemaVisitor: <TSchemaType extends string = string>(
    options: ZodSchemaVisitorOptions<TSchemaType>,
  ) => TSESLint.RuleListener;

  /**
   * Returns true if the given name was imported as a zod namespace (e.g. `import * as z` or `import { z }`).
   * Must be called after `importDeclarationListener` has processed the file's imports.
   */
  isZodNamespace: (name: string) => boolean;

  /**
   * Given a local name used in code, returns the original zod export name,
   * or undefined if the name was not imported from zod as a named import.
   *
   * @example `import { output as ZodOutput } from 'zod'` → getNamedImportOriginal('ZodOutput') === 'output'
   */
  getNamedImportOriginal: (localName: string) => string | undefined;

  /**
   * Given an original zod export name, returns the local name used in code,
   * or undefined if that export was not imported.
   *
   * @example `import { output as ZodOutput } from 'zod'` → getNamedImportLocal('output') === 'ZodOutput'
   */
  getNamedImportLocal: (originalName: string) => string | undefined;

  /**
   * Check if given node is a zod schema
   */
  detectZodSchemaRootNode: (node: TSESTree.Node) => ZodSchemaMeta | null;

  /**
   * Walks up a chain of method calls and returns each call with its node.
   * Use this over `detectZodSchemaRootNode(...).methods` when the nodes are needed:
   * it only names plain-identifier properties, so every item is safe to rewrite,
   * while `methods` also covers computed members (`z['uuid']()`).
   *
   * The result is all-or-nothing:
   * either every call from the factory to the outermost one is named —
   * so `chain[0]` is the factory and `chain[i]` lines up with `collectZodSchemaConstraints`' `chainIndex` —
   * or the array is empty.
   * It is never a partial chain missing its leading calls.
   *
   * Returns an empty array if the expression isn't a navigable zod chain,
   * which includes zod schemas built through a computed member (`z['string']().min(1)`):
   * those are still *detected*,
   * so a rule that reports on `onSchema` must handle an empty chain rather than index it.
   */
  collectZodChainMethods: (node: TSESTree.CallExpression) => Array<ZodChainItem>;

  /**
   * Flattens a zod call chain into the constraints applied to the schema,
   * seen uniformly across API styles:
   * chained methods (`z.string().min(2)`, `zod`) become `chained` constraints,
   * recognized zod calls among `.check(...)` arguments (`z.string().check(z.minLength(2))`, `zod/mini`) become `check-argument` constraints.
   */
  collectZodSchemaConstraints: (node: TSESTree.CallExpression) => Array<ZodSchemaConstraint>;

  /**
   * True if `node` is a zod call chain built from `schemaType`,
   * including inner calls such as the object of `z.number().min(0).isInt`.
   */
  isZodSchemaOfType: (node: TSESTree.Node, schemaType: string) => boolean;

  /**
   * Every tracked binding, in source order.
   * Use it when a fixer must pick an import to write against, or extend one.
   */
  getZodImportBindings: () => ReadonlyArray<ZodImportBinding>;

  /**
   * The zod import an identifier resolves to, honouring lexical scope.
   * A shadowed `z` resolves to `null`, where {@link isZodNamespace} matches any name in the file.
   * Needs a tracker built with a `sourceCode`.
   */
  resolveZodImport: (node: TSESTree.Node) => ZodImportBinding | null;

  /**
   * The zod export a callee names: `string()` and `z.string()` both give `string`.
   * `null` for a bare namespace, a computed identifier key, or an optional member.
   * Needs a tracker built with a `sourceCode`.
   */
  resolveZodExport: (node: TSESTree.Node) => ZodImportBinding | null;
}

/**
 * Creates a tracker for one file, scoped to `importScope`.
 * Rules normally reach it through {@link ZodImportScope.createTracker}.
 */
export function trackZodSchemaImports(
  scope: ZodImportScope,
  { kind, sourceCode }: ZodTrackerOptions,
): ZodSchemaImportTracker {
  const imports: ZodImports = {
    namespaces: new Set<string>(),
    // localName → original export name
    named: new Map<string, string>(),
  };
  // original export name → localName (last import wins)
  const zodNamedImportsByOriginal = new Map<string, string>();
  const bindings: Array<ZodImportBinding> = [];

  // Safe to cache: the walk is purely syntactic and never reads the import maps,
  // which keep filling up as `ImportDeclaration` nodes are visited.
  const chainCache = new WeakMap<TSESTree.CallExpression, Array<ZodChainItem>>();

  function collectZodChainMethods(node: TSESTree.CallExpression): Array<ZodChainItem> {
    const cached = chainCache.get(node);
    if (cached) {
      return cached;
    }

    const methods: Array<ZodChainItem> = [];
    let current: TSESTree.Expression | null = node;

    while (current.type === AST_NODE_TYPES.CallExpression) {
      const { callee } = current as { callee: TSESTree.Expression };

      // Match: z.number(), z.int(), z.min(), etc.
      if (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        !callee.computed &&
        callee.property.type === AST_NODE_TYPES.Identifier
      ) {
        methods.unshift({
          name: callee.property.name,
          node: current,
        });

        current = callee.object;
        continue;
      }

      // Match named import: number(), int(), etc.
      if (callee.type === AST_NODE_TYPES.Identifier) {
        methods.unshift({
          name: callee.name,
          node: current,
        });

        break;
      }

      // Unnameable callee — a computed member (`z['string']()`) or a complex expression.
      // Detection still resolves those (`detectZodSchemaRootNode` reads literal keys),
      // so returning what we walked so far would hand callers a chain that silently drops leading methods and no longer starts at the factory.
      // Return nothing instead,
      // so `chain[0]` is always the factory and `chain[i]` always lines up with the constraint list.
      const unwalkable: Array<ZodChainItem> = [];
      chainCache.set(node, unwalkable);
      return unwalkable;
    }

    chainCache.set(node, methods);
    return methods;
  }

  // to be inserted into rule.create()
  function records(isTypeOnly: boolean): boolean {
    return kind === 'all' || isTypeOnly === (kind === 'type');
  }

  function importDeclarationListener(node: TSESTree.ImportDeclaration): void {
    if (!scope.isAllowed(node.source.value)) {
      return;
    }
    const typeDeclaration = node.importKind === 'type';
    if (typeDeclaration && !records(true)) {
      return;
    }

    for (const spec of node.specifiers) {
      switch (spec.type) {
        case AST_NODE_TYPES.ImportDefaultSpecifier:
        case AST_NODE_TYPES.ImportNamespaceSpecifier:
          if (!records(typeDeclaration)) {
            break;
          }
          imports.namespaces.add(spec.local.name);
          bindings.push({ name: '*', local: spec.local, declaration: node });
          break;

        case AST_NODE_TYPES.ImportSpecifier: {
          if (!records(typeDeclaration || spec.importKind === 'type')) {
            break;
          }

          // If the user imports `z` via a named import, it acts as a namespace.
          // Therefore, it must be recorded in the appropriate set.
          // We check the imported identifier because the user may alias it.
          const originalName = 'name' in spec.imported ? spec.imported.name : spec.local.name;

          if (originalName === 'z') {
            imports.namespaces.add(spec.local.name);
          } else {
            imports.named.set(spec.local.name, originalName);
            zodNamedImportsByOriginal.set(originalName, spec.local.name);
          }
          bindings.push({
            name: originalName === 'z' ? '*' : originalName,
            local: spec.local,
            declaration: node,
          });

          break;
        }

        // no default
      }
    }
  }

  function resolveZodImport(node: TSESTree.Node): ZodImportBinding | null {
    if (node.type !== AST_NODE_TYPES.Identifier) {
      return null;
    }
    if (!sourceCode) {
      throw new Error('resolveZodImport needs a tracker created with a `sourceCode`.');
    }
    const definition = ASTUtils.findVariable(sourceCode.getScope(node), node.name)?.defs[0];
    if (
      definition?.type !== TSESLint.Scope.DefinitionType.ImportBinding ||
      definition.node.type === AST_NODE_TYPES.TSImportEqualsDeclaration
    ) {
      return null;
    }
    const { local } = definition.node;
    return bindings.find((item) => item.local === local) ?? null;
  }

  function resolveZodExport(node: TSESTree.Node): ZodImportBinding | null {
    if (node.type === AST_NODE_TYPES.Identifier) {
      const found = resolveZodImport(node);
      return found && found.name !== '*' ? found : null;
    }
    if (node.type !== AST_NODE_TYPES.MemberExpression || node.optional) {
      return null;
    }
    const found = resolveZodImport(node.object);
    const name = getStaticPropertyName(node);
    return found?.name === '*' && name ? { ...found, name } : null;
  }

  const result: ZodSchemaImportTracker = {
    importDeclarationListener,

    createSchemaVisitor<TSchemaType extends string>({
      schemaType,
      onSchema,
    }: ZodSchemaVisitorOptions<TSchemaType>): TSESLint.RuleListener {
      const allowed: ReadonlyArray<string> | undefined =
        typeof schemaType === 'string' ? [schemaType] : schemaType;

      return {
        ImportDeclaration: importDeclarationListener,
        CallExpression(node): void {
          const meta = detectZodSchemaRootNode(node, imports);
          if (!meta) {
            return;
          }
          if (allowed && !allowed.includes(meta.schemaType)) {
            return;
          }
          // `includes` cannot narrow, and with no filter `TSchemaType` is `string`.
          onSchema(node, meta as ZodSchemaMeta & { schemaType: TSchemaType });
        },
      };
    },

    isZodNamespace: (name) => imports.namespaces.has(name),

    getNamedImportOriginal: (localName) => imports.named.get(localName),

    getNamedImportLocal: (originalName) => zodNamedImportsByOriginal.get(originalName),

    detectZodSchemaRootNode: (node) => detectZodSchemaRootNode(node, imports),

    collectZodChainMethods,

    collectZodSchemaConstraints: (node) =>
      collectZodSchemaConstraints({
        methods: collectZodChainMethods(node),
        detectZodSchemaRootNode: (argument) => detectZodSchemaRootNode(argument, imports),
      }),

    isZodSchemaOfType: (node, schemaType) => isZodSchemaOfType(node, schemaType, imports),

    getZodImportBindings: () => bindings,

    resolveZodImport,

    resolveZodExport,
  };

  return result;
}
