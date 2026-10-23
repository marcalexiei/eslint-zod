import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

/** What {@link detectZodSchemaRootNode} learned about a zod call chain. */
export interface ZodSchemaMeta {
  /**
   * How the schema is declared:
   * - `namespace` -> `z.string()`
   * - `named` -> `string()`
   */
  schemaDecl: 'namespace' | 'named';

  /** the "factory" for the outer expression */
  schemaType: string;

  /**
   * Full chain in call order, e.g. `["number", "int", "min"]`. Names only, and
   * includes computed members (`z['uuid']()`) — use `collectZodChainMethods`
   * when the nodes are needed.
   */
  methods: Array<string>;
}

/**
 * The zod imports a file has in scope, as accumulated by a tracker. Passed
 * around as one value so detection helpers keep a small signature.
 */
export interface ZodImports {
  /** Local names bound to the `z` namespace. */
  namespaces: Set<string>;
  /** Local name → original zod export name. */
  named: Map<string, string>;
}

/**
 * Helper: extract static property names (Identifier | Literal | simple template literal)
 */
function getPropertyName(prop: TSESTree.Expression | TSESTree.PrivateIdentifier): string | null {
  if (prop.type === AST_NODE_TYPES.Identifier) {
    return prop.name;
  }
  if (prop.type === AST_NODE_TYPES.Literal) {
    return prop.value == null ? null : String(prop.value);
  }
  if (prop.type === AST_NODE_TYPES.TemplateLiteral) {
    if (prop.expressions.length === 0 && prop.quasis.length === 1) {
      return prop.quasis[0].value.cooked;
    }
    return null;
  }
  return null;
}

/** Quick check: only process outermost call in a chain */
function isOutermostCallExpression(node: TSESTree.CallExpression): boolean {
  const { parent } = node;

  // If parent is CallExpression and parent.callee === node => this node is inner
  if (parent.type === AST_NODE_TYPES.CallExpression && parent.callee === node) {
    return false;
  }

  // Climb the property accesses on top of the call:
  // it is inner only when they end up being called (`z.string().min`, `z.object({}).shape.a.min`).
  // In `z.string().safeParse(x).success` nothing is, so the call is the last one of its chain.
  let child: TSESTree.Node = node;
  let ancestor: TSESTree.Node = parent;
  while (ancestor.type === AST_NODE_TYPES.MemberExpression && ancestor.object === child) {
    child = ancestor;
    ancestor = ancestor.parent;
  }

  return !(ancestor.type === AST_NODE_TYPES.CallExpression && ancestor.callee === child);
}

/** Resolves a chain's root identifier to the schema it is bound to, or `null`. */
type ZodSchemaRootResolver = (root: TSESTree.Identifier) => ZodSchemaMeta | null;

/**
 * Parse a CallExpression to detect whether it's a zod schema expression (namespace or named).
 * This helper DOES NOT require the call to be outermost.
 * With `resolveRoot`, a chain rooted at a local schema (`base.optional()`) is detected too,
 * and TS assertions in the chain are looked through.
 *
 * Returns:
 *  { schemaDecl, schemaType, methods, node } if successful
 *  null otherwise
 */
export function parseZodCallExpression(
  call: TSESTree.CallExpression,
  imports: ZodImports,
  resolveRoot?: ZodSchemaRootResolver,
): ZodSchemaMeta | null {
  let cur: TSESTree.Node = call.callee;

  // Collect names in right-to-left order, then reverse at the end
  const methodsRightToLeft: Array<string> = [];
  // Assigned by the only `break` in the loop below; every other exit returns.
  let leftmost: TSESTree.Identifier;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    if (cur.type === AST_NODE_TYPES.CallExpression) {
      // unwrap: foo().bar -> go into callee
      cur = cur.callee;
      continue;
    }

    if (cur.type === AST_NODE_TYPES.MemberExpression) {
      const name = getPropertyName(cur.property);
      if (!name) {
        return null;
      } // dynamic/computed property — can't reason
      methodsRightToLeft.push(name);
      cur = cur.object;
      continue;
    }

    if (cur.type === AST_NODE_TYPES.Identifier) {
      leftmost = cur;
      break;
    }

    // Resolver path only: `collectZodChainMethods` cannot walk an assertion, so plain detection must not see through one.
    if (
      resolveRoot &&
      (cur.type === AST_NODE_TYPES.TSAsExpression ||
        cur.type === AST_NODE_TYPES.TSSatisfiesExpression ||
        cur.type === AST_NODE_TYPES.TSNonNullExpression)
    ) {
      cur = cur.expression;
      continue;
    }

    // unsupported left shape (e.g. complex expression) — bail
    return null;
  }

  const methods = methodsRightToLeft.slice().reverse(); // left -> right order
  const leftmostIdentifier = leftmost.name;

  // Namespace style: z.number().int()
  if (imports.namespaces.has(leftmostIdentifier)) {
    // the factory for namespace style is typically the first method
    const factory = methods[0] ?? null;
    if (!factory) {
      return null;
    }
    return {
      schemaDecl: 'namespace',
      schemaType: factory,
      methods,
    };
  }

  // Named import style: number().int() or array(...)
  // A single lookup: the map value is the original zod export name, so an
  // aliased import (`import { nativeEnum as e }`) resolves to `nativeEnum`.
  const factory = imports.named.get(leftmostIdentifier);
  if (factory !== undefined) {
    return {
      schemaDecl: 'named',
      schemaType: factory,
      methods,
    };
  }

  // A chained call on a local schema; a bare call (`base()`) is not one.
  const base = methods.length > 0 ? resolveRoot?.(leftmost) : null;
  return base ? { ...base, methods: [...base.methods, ...methods] } : null;
}

/**
 * True when `node` is a zod call chain built from `schemaType` (e.g.
 * `z.number().min(1)` or `number().min(1)` for `'number'`). Unlike
 * {@link detectZodSchemaRootNode} the call need not be outermost, which is
 * what member access like `z.number().isInt` requires.
 */
export function isZodSchemaOfType(
  node: TSESTree.Node,
  schemaType: string,
  imports: ZodImports,
): boolean {
  if (node.type !== AST_NODE_TYPES.CallExpression) {
    return false;
  }
  const parsed = parseZodCallExpression(node, imports);
  return parsed !== null && parsed.schemaType === schemaType;
}

/**
 * Finds the outermost Zod call expression in a chain and returns metadata about it
 * (declaration style, factory name, methods, AST node). Includes calls in argument
 * position (e.g. inside `.check(...)`), so a standalone check call is treated as the
 * root of its own expression.
 *
 * Returns `null` if the node is not a Zod schema call or not the outermost call in its chain.
 *
 * @param node - The AST node to analyze (typically a `CallExpression` from an ESLint visitor)
 * @param imports - The file's zod imports, from a tracker
 * @param resolveRoot - Also detect a chain rooted at a local schema
 */
export function detectZodSchemaRootNode(
  node: TSESTree.Node,
  imports: ZodImports,
  resolveRoot?: ZodSchemaRootResolver,
): ZodSchemaMeta | null {
  if (node.type !== AST_NODE_TYPES.CallExpression) {
    return null;
  }
  const call = node;

  // Only process the *outermost* call expression for this chain
  if (!isOutermostCallExpression(call)) {
    return null;
  }

  // Parse the outer call expression into zod schema info
  const outer = parseZodCallExpression(call, imports, resolveRoot);
  if (!outer) {
    return null;
  }

  return outer;
}
