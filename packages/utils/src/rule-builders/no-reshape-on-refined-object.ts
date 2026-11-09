import type { ZodExportName, ZodMethodName, ZodMiniMethodName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { findVariable } from '../find-variable.js';
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
  'clone',
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
  receiver: TSESTree.Node;
  args: ReadonlyArray<TSESTree.CallExpressionArgument>;
}

/** A local function the rule can evaluate: every parameter a plain name, and a single returned expression. */
interface InlineFunction {
  node: TSESTree.Node;
  params: ReadonlyArray<TSESTree.Parameter>;
  body: TSESTree.Expression;
}

type Evaluate = (node: TSESTree.Node, env: Env) => Value | null;

function unwrap(node: TSESTree.Node): TSESTree.Node {
  let current = node;
  while (
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

/** The node naming the called function: the property of a member call, else the callee. */
function getCalleeName(call: TSESTree.CallExpression): TSESTree.Node {
  return call.callee.type === AST_NODE_TYPES.MemberExpression ? call.callee.property : call.callee;
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
    const name = getStaticPropertyName(property);
    if (name === null) {
      return null;
    }
    if (property.value.value) {
      selected.add(name);
    }
  }
  return selected;
}

/** The returned expression of a single-return function, or `null`. */
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
 * `pick`, `omit`, `partial` and `merge` always, and `extend` when it overwrites a key.
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

    /** Bindings and functions being evaluated, so a cycle cannot recurse forever. */
    const active = new Set<TSESTree.Node>();
    const reported = new Set<TSESTree.Node>();

    /** The value a name settles: a never-reassigned binding's initializer, a function declaration or a parameter. */
    function resolveBinding(node: TSESTree.Node): TSESTree.Node {
      const target = unwrap(node);
      if (target.type !== AST_NODE_TYPES.Identifier) {
        return target;
      }
      const variable = findVariable(sourceCode.getScope(target), target.name);
      // more than one definition means the binding is re-declared, so it does not settle its value
      const definition = variable?.defs.length === 1 ? variable.defs[0] : null;
      switch (definition?.type) {
        case 'FunctionName':
          return definition.node;
        case 'Parameter':
          return definition.name;
        case 'Variable': {
          const reassigned = variable?.references.some((ref) => ref.isWrite() && !ref.init);
          return definition.node.id.type === AST_NODE_TYPES.Identifier &&
            definition.node.init &&
            !reassigned
            ? unwrap(definition.node.init)
            : target;
        }
        default:
          return target;
      }
    }

    function resolveFunction(node: TSESTree.Node): InlineFunction | null {
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
      return body && plain && !active.has(fn) ? { node: fn, params: fn.params, body } : null;
    }

    function readOperation(
      call: TSESTree.CallExpression,
      factoryName: string | undefined,
    ): Operation | null {
      if (factoryName !== undefined) {
        const [receiver, ...args] = call.arguments;
        return call.arguments.length > 0 ? { call, name: factoryName, receiver, args } : null;
      }
      if (call.callee.type !== AST_NODE_TYPES.MemberExpression || call.callee.optional) {
        return null;
      }
      const name = getStaticPropertyName(call.callee);
      return name === null
        ? null
        : { call, name, receiver: call.callee.object, args: call.arguments };
    }

    function reportThrow(
      { call, name }: Operation,
      thrown: string,
      site: TSESTree.CallExpression | null,
    ): void {
      const node = getCalleeName(site ?? call);
      if (reported.has(node)) {
        return;
      }
      reported.add(node);
      if (site) {
        context.report({ node, messageId: 'reshapeRefinedInCall', data: { method: name } });
        return;
      }
      if (name !== 'extend') {
        context.report({ node, messageId: 'reshapeRefined', data: { method: name } });
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
        data: { key: thrown },
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
        return { ...receiver, refined: true };
      }
      if (PRESERVING_METHODS.has(name)) {
        return receiver;
      }
      const mask = args.length > 0 ? readMask(resolveBinding(args[0])) : null;
      switch (name) {
        case 'extend':
        case 'safeExtend':
          return {
            ...receiver,
            keys: union(receiver.keys, argument?.kind === 'shape' ? argument.keys : new Set()),
          };
        case 'merge':
          // The result takes the other object's checks.
          return argument?.kind === 'schema'
            ? {
                kind: 'schema',
                refined: argument.refined,
                keys: union(receiver.keys, argument.keys),
              }
            : null;
        // These three clear the checks.
        case 'partial':
          return { kind: 'schema', refined: false, keys: receiver.keys };
        case 'pick':
          return { kind: 'schema', refined: false, keys: mask ?? new Set() };
        case 'omit':
          // An unreadable mask may omit any key.
          return {
            kind: 'schema',
            refined: false,
            keys: new Set([...receiver.keys].filter((key) => mask && !mask.has(key))),
          };
        default:
          return null;
      }
    }

    function evaluateCall(
      call: TSESTree.CallExpression,
      env: Env,
      evaluateNode: Evaluate,
    ): Value | null {
      const site = env.site ?? call;
      const callFunction = (
        fn: InlineFunction | null,
        values: Array<Value | null>,
      ): Value | null => {
        if (!fn) {
          return null;
        }
        const params = new Map(fn.params.map((param, index) => [param, values.at(index) ?? null]));
        active.add(fn.node);
        const result = evaluateNode(fn.body, { params, site });
        active.delete(fn.node);
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
        return callFunction(
          factoryName === undefined ? resolveFunction(call.callee) : null,
          // After a spread the positions are unknown.
          call.arguments.some((argument) => argument.type === AST_NODE_TYPES.SpreadElement)
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
        return callFunction(first ? resolveFunction(first) : null, [receiver]);
      }

      const argument = first ? evaluateNode(first, env) : null;
      const thrown = findThrow(operation.name, receiver, argument);
      if (thrown === null) {
        return applyOperation(operation, receiver, argument);
      }
      if (env.site) {
        // A reshape that throws whatever the arguments is reported where it is written.
        const own = evaluateNode(operation.receiver, TOP_LEVEL);
        const ownArgument = first ? evaluateNode(first, TOP_LEVEL) : null;
        const throwsAlone =
          own?.kind === 'schema' && findThrow(operation.name, own, ownArgument) !== null;
        reportThrow(operation, thrown, throwsAlone ? null : env.site);
      } else {
        reportThrow(operation, thrown, null);
      }
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
        if (active.has(target)) {
          return null;
        }
        // A binding is declared outside the function being evaluated, so its value does not depend on it.
        active.add(target);
        const value = evaluate(target, TOP_LEVEL);
        active.delete(target);
        return value;
      }
      switch (target.type) {
        case AST_NODE_TYPES.ObjectExpression: {
          const keys = new Set<string>();
          for (const property of target.properties) {
            if (property.type === AST_NODE_TYPES.Property) {
              const key = getStaticPropertyName(property);
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
