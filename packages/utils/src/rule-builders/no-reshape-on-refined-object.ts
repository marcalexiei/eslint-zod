import type { ZodExportName, ZodMethodName, ZodMiniMethodName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { findVariable } from '../find-variable.js';
import { getBindingInitializer } from '../get-binding-initializer.js';
import { getStaticPropertyName } from '../get-static-property-name.js';
import { getZodSchemaBaseType } from '../get-zod-schema-base-type.js';
import type { RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'reshapeRefined' | 'reshapeRefinedInCall' | 'overwriteRefined' | 'useSafeExtend';

type ZodName = ZodExportName | ZodMethodName | ZodMiniMethodName;

// Each adds to the schema's checks, which is what zod's guard tests.
const REFINING_METHODS: ReadonlySet<string> = new Set<ZodName>([
  'check',
  'overwrite',
  'refine',
  'superRefine',
  'with',
]);

// Each returns a copy of the object with its checks and keys unchanged.
const PRESERVING_METHODS: ReadonlySet<string> = new Set<ZodName>([
  'brand',
  'catchall',
  'describe',
  'loose',
  'meta',
  'passthrough',
  'register',
  'required',
  'strict',
  'strip',
]);

// Zod throws on these whenever the object has checks.
const THROWING_METHODS: ReadonlySet<string> = new Set<ZodName>([
  'exactPartial',
  'merge',
  'omit',
  'partial',
  'pick',
]);

/** The keys an object is known to have; it may have more. */
type Keys = ReadonlySet<string>;

interface Schema {
  kind: 'schema';
  refined: boolean;
  keys: Keys;
}

/** What an expression is known to evaluate to: an object schema, or a shape (the object passed to `z.object`). */
type Value = Schema | { kind: 'shape'; keys: Keys };

/** The parameter values of the function being evaluated, and the outermost call that runs it. */
interface Env {
  params: ReadonlyMap<TSESTree.Node, Value | null>;
  site: TSESTree.CallExpression | null;
}

const TOP_LEVEL: Env = { params: new Map(), site: null };

/** A call applied to a schema: `schema.pick(mask)`, or the `zod/mini` factory form `z.pick(schema, mask)`. */
interface Operation {
  call: TSESTree.CallExpression;
  name: string;
  /** The call as written, for messages: `.pick` or `z.pick`. */
  method: string;
  receiver: TSESTree.Node;
  args: ReadonlyArray<TSESTree.CallExpressionArgument>;
}

/** A local function the rule can evaluate: every parameter a plain name, and a single returned expression. */
interface InlineFunction {
  node: TSESTree.Node;
  /** Written in place, as an `.apply()` callback is, rather than named. */
  literal: boolean;
  params: ReadonlyArray<TSESTree.Parameter>;
  body: TSESTree.Expression;
}

type Evaluate = (node: TSESTree.Node, env: Env) => Value | null;

function unwrap(node: TSESTree.Node): TSESTree.Node {
  let current = node;
  while (
    current.type === AST_NODE_TYPES.ChainExpression ||
    current.type === AST_NODE_TYPES.TSAsExpression ||
    current.type === AST_NODE_TYPES.TSSatisfiesExpression ||
    current.type === AST_NODE_TYPES.TSNonNullExpression
  ) {
    current = current.expression;
  }
  return current;
}

function union(left: Keys, right: Keys): Keys {
  return new Set([...left, ...right]);
}

function isSpread(node: TSESTree.CallExpressionArgument): boolean {
  return node.type === AST_NODE_TYPES.SpreadElement;
}

function getCalleeName(call: TSESTree.CallExpression): TSESTree.Node {
  return call.callee.type === AST_NODE_TYPES.MemberExpression ? call.callee.property : call.callee;
}

/** A property's key; `null` for a plain `__proto__: value`, which sets the prototype instead. */
function readLiteralKey(property: TSESTree.Property): string | null {
  const name = getStaticPropertyName(property);
  const setsPrototype =
    name === '__proto__' &&
    property.kind === 'init' &&
    !property.computed &&
    !property.shorthand &&
    !property.method;
  return setsPrototype ? null : name;
}

/** The keys a `pick`/`omit` mask selects, read from an object literal of boolean literals. */
function readMask(node: TSESTree.Node): Keys | null {
  if (node.type !== AST_NODE_TYPES.ObjectExpression) {
    return null;
  }
  const selected = new Set<string>();
  for (const property of node.properties) {
    if (
      property.type !== AST_NODE_TYPES.Property ||
      property.value.type !== AST_NODE_TYPES.Literal
    ) {
      return null;
    }
    const name = readLiteralKey(property);
    if (name === null) {
      return null;
    }
    if (property.value.value) {
      selected.add(name);
    }
  }
  return selected;
}

function readReturnedExpression(
  fn: TSESTree.ArrowFunctionExpression | TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
): TSESTree.Expression | null {
  if (fn.async || fn.generator) {
    return null;
  }
  if (fn.body.type !== AST_NODE_TYPES.BlockStatement) {
    return fn.body;
  }
  const [statement] = fn.body.body;
  return fn.body.body.length === 1 &&
    statement.type === AST_NODE_TYPES.ReturnStatement &&
    statement.argument
    ? statement.argument
    : null;
}

/** What throws when `name` runs on `receiver`: the key an `extend` overwrites, else the method name. */
function findThrow(name: string, receiver: Schema, argument: Value | null): string | null {
  if (!receiver.refined) {
    return null;
  }
  if (THROWING_METHODS.has(name)) {
    return name;
  }
  if (name !== 'extend' || argument?.kind !== 'shape') {
    return null;
  }
  return [...argument.keys].find((key) => receiver.keys.has(key)) ?? null;
}

/**
 * Builds the `create` function for the `no-reshape-on-refined-object` rule.
 *
 * Reports what zod throws on once an object schema has a refinement:
 * `pick`, `omit`, `partial`, `exactPartial` and `merge` always, and `extend` when it overwrites a key.
 * A local function that throws on the schema passed to it is reported at the call.
 * Bails on any step it cannot follow.
 */
export function buildNoReshapeOnRefinedObjectCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const { sourceCode } = context;
    const {
      importDeclarationListener,
      resolveZodExport,
      getNamedImportLocal,
      getZodImportBindings,
    } = scope.createTracker({ kind: 'value', sourceCode });

    /** Functions being evaluated, so recursion stops. */
    const active = new Set<TSESTree.Node>();
    const reported = new Set<TSESTree.Node>();
    // Each binding and call is evaluated once, or sharing them makes the work exponential.
    const bindings = new Map<TSESTree.Node, Value | null>();
    const calls = new Map<string, Value | null>();

    /** The value a name settles: a never-reassigned binding's initializer, a function declaration or a parameter. */
    function resolveBinding(node: TSESTree.Node): TSESTree.Node {
      const target = unwrap(node);
      if (target.type !== AST_NODE_TYPES.Identifier) {
        return target;
      }
      const variable = findVariable(sourceCode.getScope(target), target.name);
      const init = getBindingInitializer(variable);
      if (init) {
        return unwrap(init);
      }
      const definition = variable?.defs.length === 1 ? variable.defs[0] : null;
      if (definition?.type === 'FunctionName') {
        return definition.node;
      }
      // A parameter's value is looked up in the environment, unless the function reassigns it.
      const reassigned = variable?.references.some((reference) => reference.isWrite());
      return definition?.type === 'Parameter' && !reassigned ? definition.name : target;
    }

    function resolveFunction(node: TSESTree.Node | undefined): InlineFunction | null {
      if (!node) {
        return null;
      }
      const fn = resolveBinding(node);
      if (
        fn.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
        fn.type !== AST_NODE_TYPES.FunctionDeclaration &&
        fn.type !== AST_NODE_TYPES.FunctionExpression
      ) {
        return null;
      }
      const body = readReturnedExpression(fn);
      const plain = fn.params.every((param) => param.type === AST_NODE_TYPES.Identifier);
      const literal = fn === unwrap(node);
      return body && plain && !active.has(fn)
        ? { node: fn, literal, params: fn.params, body }
        : null;
    }

    function readOperation(
      call: TSESTree.CallExpression,
      factoryName: string | undefined,
    ): Operation | null {
      if (factoryName !== undefined) {
        const [receiver, ...args] = call.arguments;
        const method = sourceCode.getText(call.callee);
        return call.arguments.length > 0
          ? { call, name: factoryName, method, receiver, args }
          : null;
      }
      if (call.callee.type !== AST_NODE_TYPES.MemberExpression) {
        return null;
      }
      const name = getStaticPropertyName(call.callee);
      return name === null
        ? null
        : { call, name, method: `.${name}`, receiver: call.callee.object, args: call.arguments };
    }

    function reportThrow(
      { call, name, method }: Operation,
      thrown: string,
      site: TSESTree.CallExpression | null,
    ): void {
      const node = getCalleeName(site ?? call);
      // Skipped at a call site when the reshape was already reported where it is written.
      if (reported.has(node) || reported.has(getCalleeName(call))) {
        return;
      }
      reported.add(node);
      if (site || name !== 'extend') {
        const messageId = site ? 'reshapeRefinedInCall' : 'reshapeRefined';
        context.report({ node, messageId, data: { method } });
        return;
      }
      const { callee } = call;
      let safeExtend: string | undefined = getNamedImportLocal('safeExtend');
      if (callee.type === AST_NODE_TYPES.MemberExpression) {
        safeExtend = callee.computed ? "'safeExtend'" : 'safeExtend';
      }
      context.report({
        node,
        messageId: 'overwriteRefined',
        data: { key: thrown, method },
        suggest: safeExtend
          ? [
              {
                messageId: 'useSafeExtend',
                fix: (fixer): RuleFix => fixer.replaceText(node, safeExtend),
              },
            ]
          : [],
      });
    }

    function applyOperation(
      { name, args }: Operation,
      receiver: Schema,
      argument: Value | null,
    ): Value | null {
      if (REFINING_METHODS.has(name)) {
        // `check` and `with` add as many checks as they are given.
        if ((name === 'check' || name === 'with') && args.every(isSpread)) {
          return args.length === 0 ? receiver : null;
        }
        return { ...receiver, refined: true };
      }
      // `findThrow` has passed, so the receiver has no checks for the rest to clear.
      const mask = args.length > 0 ? readMask(resolveBinding(args[0])) : null;
      switch (name) {
        case 'extend':
        case 'safeExtend':
          return {
            ...receiver,
            keys: union(receiver.keys, argument?.kind === 'shape' ? argument.keys : new Set()),
          };
        case 'merge':
          return argument?.kind === 'schema'
            ? { ...argument, keys: union(receiver.keys, argument.keys) }
            : null;
        case 'clone':
          // A definition passed to `clone` replaces the checks.
          return args.length === 0 ? receiver : null;
        case 'exactPartial':
        case 'partial':
          return receiver;
        case 'pick':
          return { ...receiver, keys: mask ?? new Set() };
        case 'omit':
          // An unreadable mask may omit any key.
          return {
            ...receiver,
            keys: new Set([...receiver.keys].filter((key) => mask && !mask.has(key))),
          };
        default:
          return PRESERVING_METHODS.has(name) ? receiver : null;
      }
    }

    function evaluateCall(
      call: TSESTree.CallExpression,
      env: Env,
      evaluateNode: Evaluate,
    ): Value | null {
      const callFunction = (
        fn: InlineFunction | null,
        values: Array<Value | null>,
      ): Value | null => {
        if (!fn) {
          return null;
        }
        const params = new Map(fn.params.map((param, index) => [param, values.at(index) ?? null]));
        // A named function's throw is reported at the outermost call that reaches it.
        const site = fn.literal ? env.site : (env.site ?? call);
        const key = JSON.stringify([fn.node.range, site?.range, values], (_, value: unknown) =>
          value instanceof Set ? [...value] : value,
        );
        const cached = calls.get(key);
        if (cached !== undefined) {
          return cached;
        }
        active.add(fn.node);
        const result = evaluateNode(fn.body, { params, site });
        active.delete(fn.node);
        calls.set(key, result);
        return result;
      };

      const factoryName = resolveZodExport(call.callee)?.name;
      if (factoryName !== undefined && getZodSchemaBaseType(factoryName) === 'object') {
        const shape = call.arguments.length > 0 ? evaluateNode(call.arguments[0], env) : null;
        return {
          kind: 'schema',
          refined: false,
          keys: shape?.kind === 'shape' ? shape.keys : new Set(),
        };
      }

      const operation = readOperation(call, factoryName);
      if (!operation) {
        const fn = resolveFunction(call.callee);
        // At the top level each argument is visited on its own.
        if (!fn && !env.site) {
          return null;
        }
        return callFunction(
          fn,
          // After a spread the positions are unknown.
          call.arguments.some(isSpread)
            ? []
            : call.arguments.map((argument) => evaluateNode(argument, env)),
        );
      }
      const receiver = evaluateNode(operation.receiver, env);
      if (receiver?.kind !== 'schema') {
        return null;
      }
      const first = operation.args.at(0);
      if (operation.name === 'apply') {
        return callFunction(resolveFunction(first), [receiver]);
      }

      const argument = first ? evaluateNode(first, env) : null;
      const thrown = findThrow(operation.name, receiver, argument);
      if (thrown === null) {
        return applyOperation(operation, receiver, argument);
      }
      if (env.site) {
        // A reshape that throws whatever the arguments is reported where it is written by this pass.
        evaluateNode(call, TOP_LEVEL);
      }
      reportThrow(operation, thrown, env.site);
      return null;
    }

    function evaluate(node: TSESTree.Node, env: Env): Value | null {
      const written = unwrap(node);
      const target = resolveBinding(written);
      const param = env.params.get(target);
      if (param !== undefined) {
        return param;
      }
      if (target !== written) {
        const cached = bindings.get(target);
        if (cached !== undefined) {
          return cached;
        }
        // Set first, so a cycle reads `null`.
        bindings.set(target, null);
        // A binding is declared outside the function being evaluated, so its value does not depend on it.
        const value = evaluate(target, TOP_LEVEL);
        bindings.set(target, value);
        return value;
      }
      switch (target.type) {
        case AST_NODE_TYPES.ObjectExpression: {
          const keys = new Set<string>();
          for (const property of target.properties) {
            if (property.type === AST_NODE_TYPES.Property) {
              const key = readLiteralKey(property);
              if (key !== null) {
                keys.add(key);
              }
            } else {
              const spread = evaluate(property.argument, env);
              for (const key of spread?.kind === 'shape' ? spread.keys : []) {
                keys.add(key);
              }
            }
          }
          return { kind: 'shape', keys };
        }
        case AST_NODE_TYPES.MemberExpression: {
          const schema =
            getStaticPropertyName(target) === 'shape' ? evaluate(target.object, env) : null;
          return schema?.kind === 'schema' ? { kind: 'shape', keys: schema.keys } : null;
        }
        case AST_NODE_TYPES.CallExpression:
          return evaluateCall(target, env, evaluate);
        default:
          return null;
      }
    }

    return {
      ImportDeclaration: importDeclarationListener,
      // Every call, not only detected schemas: a local helper's result can be one too.
      CallExpression(call): void {
        if (getZodImportBindings().length > 0) {
          evaluate(call, TOP_LEVEL);
        }
      },
    };
  };
}
