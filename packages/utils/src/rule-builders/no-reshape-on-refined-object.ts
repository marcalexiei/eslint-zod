import type { ZodExportName, ZodMethodName, ZodMiniMethodName } from '@eslint-zod/zod-api';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { findVariable } from '../find-variable.js';
import { getStaticPropertyName } from '../get-static-property-name.js';
import type { RuleContext, RuleFix, RuleListener, ScopeVariable } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

type MessageIds = 'reshapeRefined' | 'reshapeRefinedInCall' | 'overwriteRefined' | 'useSafeExtend';

type ZodName = ZodExportName | ZodMethodName | ZodMiniMethodName;

const OBJECT_FACTORIES: ReadonlySet<string> = new Set<ZodExportName>([
  'looseObject',
  'object',
  'strictObject',
]);

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

/** What an expression is known to evaluate to: an object schema, or a shape (the object passed to `z.object`). */
type Value = { kind: 'schema'; refined: boolean; keys: Keys } | { kind: 'shape'; keys: Keys };

/** A call applied to a schema: `schema.pick(mask)`, or the `zod/mini` factory form `z.pick(schema, mask)`. */
interface Operation {
  call: TSESTree.CallExpression;
  name: string;
  receiver: TSESTree.Node;
  args: ReadonlyArray<TSESTree.CallExpressionArgument>;
  /** The method name for a chained call, the whole call for a factory. */
  reportNode: TSESTree.Node;
}

/** A local function the rule can evaluate: every parameter a plain name, and a single returned expression. */
interface InlineFunction {
  node: TSESTree.Node;
  /** The call that runs it: the helper call, or the `.apply()` call. */
  site: TSESTree.CallExpression;
  params: ReadonlyArray<TSESTree.Parameter>;
  body: TSESTree.Expression;
}

type Evaluate = (node: TSESTree.Node) => Value | null;

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

/** The keys a `pick`/`omit` mask selects, read from an object literal of boolean literals. */
function readMask(node: TSESTree.Node | undefined): Keys | null {
  const mask = node && unwrap(node);
  if (mask?.type !== AST_NODE_TYPES.ObjectExpression) {
    return null;
  }
  const selected = new Set<string>();
  for (const property of mask.properties) {
    const name = property.type === AST_NODE_TYPES.Property ? getStaticPropertyName(property) : null;
    if (
      name === null ||
      property.type !== AST_NODE_TYPES.Property ||
      property.value.type !== AST_NODE_TYPES.Literal
    ) {
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

/**
 * Builds the `create` function for the `no-reshape-on-refined-object` rule.
 *
 * Reports what zod throws on once an object schema has a refinement:
 * `pick`, `omit`, `partial` and `merge` always, and `extend` when it overwrites an existing key.
 * Handles the chained form (`schema.pick(mask)`) and the `zod/mini` factory form (`z.pick(schema, mask)`).
 * Follows bindings that are never reassigned, `.shape` reads, spreads, `.apply(fn)` and single-return local functions.
 * A function that throws on the schema passed to it is reported at the call.
 * Bails on any step it cannot follow; `extend` is reported only for a key both shapes are known to have.
 */
export function buildNoReshapeOnRefinedObjectCreate(
  scope: ZodImportScope,
): (context: Readonly<RuleContext<MessageIds>>) => RuleListener {
  return function create(context) {
    const { sourceCode } = context;
    const { importDeclarationListener, resolveZodExport, getNamedImportLocal } =
      scope.createTracker({ kind: 'value', sourceCode });

    /** Bindings and functions being evaluated, so a cycle cannot recurse forever. */
    const active = new Set<TSESTree.Node>();
    /** The values of the parameters of the functions being evaluated. */
    const parameterValues = new Map<TSESTree.Node, Value>();
    /** Set while checking whether a reshape throws on its own, whatever the arguments. */
    let ignoreParameters = false;
    /** The calls whose functions are being evaluated, outermost first. */
    const sites: Array<TSESTree.CallExpression> = [];
    const reportedSites = new Set<TSESTree.CallExpression>();

    function getVariable(node: TSESTree.Identifier): ScopeVariable | null {
      const variable = findVariable(sourceCode.getScope(node), node.name);
      // more than one definition means the binding is re-declared, so it does not settle its value
      return variable?.defs.length === 1 ? variable : null;
    }

    /** The initializer of a variable that is never reassigned. */
    function getInit(variable: ScopeVariable | null): TSESTree.Expression | null {
      const definition = variable?.defs[0];
      if (
        definition?.type !== 'Variable' ||
        definition.node.id.type !== AST_NODE_TYPES.Identifier ||
        active.has(definition.node) ||
        variable?.references.some((reference) => reference.isWrite() && !reference.init)
      ) {
        return null;
      }
      return definition.node.init;
    }

    /** `node`, or the initializer of the binding it names. */
    function resolveBinding(node: TSESTree.Node | undefined): TSESTree.Node | undefined {
      const target = node && unwrap(node);
      return target?.type === AST_NODE_TYPES.Identifier
        ? (getInit(getVariable(target)) ?? target)
        : target;
    }

    function resolveFunction(
      node: TSESTree.Node,
      site: TSESTree.CallExpression,
    ): InlineFunction | null {
      let fn = unwrap(node);
      if (fn.type === AST_NODE_TYPES.Identifier) {
        const variable = getVariable(fn);
        const definition = variable?.defs[0];
        const target = definition?.type === 'FunctionName' ? definition.node : getInit(variable);
        if (!target) {
          return null;
        }
        fn = target;
      }
      if (
        fn.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
        fn.type !== AST_NODE_TYPES.FunctionDeclaration &&
        fn.type !== AST_NODE_TYPES.FunctionExpression
      ) {
        return null;
      }
      const body = readReturnedExpression(fn);
      const plain = fn.params.every((param) => param.type === AST_NODE_TYPES.Identifier);
      return body && plain && !active.has(fn) ? { node: fn, site, params: fn.params, body } : null;
    }

    function readOperation(call: TSESTree.CallExpression): Operation | null {
      const factoryName = resolveZodExport(call.callee)?.name;
      if (factoryName !== undefined) {
        if (call.arguments.length === 0) {
          return null;
        }
        const [receiver, ...args] = call.arguments;
        return { call, name: factoryName, receiver, args, reportNode: call };
      }
      if (call.callee.type !== AST_NODE_TYPES.MemberExpression || call.callee.optional) {
        return null;
      }
      const name = getStaticPropertyName(call.callee);
      return name === null
        ? null
        : {
            call,
            name,
            receiver: call.callee.object,
            args: call.arguments,
            reportNode: call.callee.property,
          };
    }

    /** Evaluates `fn` with its parameters bound to `values`. */
    function evaluateFunction(
      fn: InlineFunction,
      values: ReadonlyArray<Value | null>,
      evaluateNode: Evaluate,
    ): Value | null {
      fn.params.forEach((param, index) => {
        const value = values.at(index);
        if (value) {
          parameterValues.set(param, value);
        }
      });
      active.add(fn.node);
      sites.push(fn.site);
      const result = evaluateNode(fn.body);
      sites.pop();
      active.delete(fn.node);
      for (const param of fn.params) {
        parameterValues.delete(param);
      }
      return result;
    }

    /**
     * Whether `operation` throws on `receiver`: `{ key }` names the key an `extend` overwrites.
     */
    function findThrow(
      { name, args }: Operation,
      receiver: Extract<Value, { kind: 'schema' }>,
      evaluateNode: Evaluate,
    ): { key: string | null } | null {
      if (!receiver.refined) {
        return null;
      }
      if (THROWING_METHODS.has(name)) {
        return { key: null };
      }
      if (name !== 'extend') {
        return null;
      }
      const shape = args.length > 0 ? evaluateNode(args[0]) : null;
      const added = shape?.kind === 'shape' ? [...shape.keys] : [];
      const key = added.find((item) => receiver.keys.has(item));
      return key === undefined ? null : { key };
    }

    function reportSite(site: TSESTree.CallExpression, method: string): void {
      if (reportedSites.has(site)) {
        return;
      }
      reportedSites.add(site);
      context.report({
        node:
          site.callee.type === AST_NODE_TYPES.MemberExpression ? site.callee.property : site.callee,
        messageId: 'reshapeRefinedInCall',
        data: { method },
      });
    }

    function applyOperation(
      operation: Operation,
      receiver: Extract<Value, { kind: 'schema' }>,
      evaluateNode: Evaluate,
    ): Value | null {
      const { name, args } = operation;
      if (REFINING_METHODS.has(name)) {
        return { ...receiver, refined: true };
      }
      if (PRESERVING_METHODS.has(name)) {
        return receiver;
      }
      const argument = args.length > 0 ? evaluateNode(args[0]) : null;
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
          return {
            kind: 'schema',
            refined: false,
            keys: readMask(resolveBinding(args.at(0))) ?? new Set(),
          };
        case 'omit': {
          // An unreadable mask may omit any key.
          const omitted = readMask(resolveBinding(args.at(0)));
          const keys = omitted
            ? new Set([...receiver.keys].filter((key) => !omitted.has(key)))
            : new Set<string>();
          return { kind: 'schema', refined: false, keys };
        }
        case 'apply': {
          const fn = args.length > 0 ? resolveFunction(args[0], operation.call) : null;
          return fn && evaluateFunction(fn, [receiver], evaluateNode);
        }
        default:
          return null;
      }
    }

    function evaluateCall(call: TSESTree.CallExpression, evaluateNode: Evaluate): Value | null {
      const factoryName = resolveZodExport(call.callee)?.name;
      if (factoryName !== undefined && OBJECT_FACTORIES.has(factoryName)) {
        const shape = call.arguments.length > 0 ? evaluateNode(call.arguments[0]) : null;
        return {
          kind: 'schema',
          refined: false,
          keys: shape?.kind === 'shape' ? shape.keys : new Set(),
        };
      }

      const helper = factoryName === undefined ? resolveFunction(call.callee, call) : null;
      if (helper) {
        const values = call.arguments.map((argument) =>
          argument.type === AST_NODE_TYPES.SpreadElement ? null : evaluateNode(argument),
        );
        return evaluateFunction(helper, values, evaluateNode);
      }

      const operation = readOperation(call);
      const receiver = operation && evaluateNode(operation.receiver);
      if (!operation || receiver?.kind !== 'schema') {
        return null;
      }
      const site = sites.at(0);
      if (site && findThrow(operation, receiver, evaluateNode)) {
        // A reshape that throws whatever the arguments is reported where it is written instead.
        const previous = ignoreParameters;
        ignoreParameters = true;
        const own = evaluateNode(operation.receiver);
        const throwsAlone = own?.kind === 'schema' && findThrow(operation, own, evaluateNode);
        ignoreParameters = previous;
        if (!throwsAlone) {
          reportSite(site, operation.name);
        }
        return null;
      }
      return applyOperation(operation, receiver, evaluateNode);
    }

    function evaluate(node: TSESTree.Node): Value | null {
      const target = unwrap(node);
      switch (target.type) {
        case AST_NODE_TYPES.Identifier: {
          const variable = getVariable(target);
          const definition = variable?.defs[0];
          if (definition?.type === 'Parameter') {
            return ignoreParameters ? null : (parameterValues.get(definition.name) ?? null);
          }
          const init = getInit(variable);
          if (!init || !definition) {
            return null;
          }
          active.add(definition.node);
          const value = evaluate(init);
          active.delete(definition.node);
          return value;
        }

        case AST_NODE_TYPES.ObjectExpression: {
          const keys = new Set<string>();
          for (const property of target.properties) {
            if (property.type === AST_NODE_TYPES.Property) {
              const key = getStaticPropertyName(property);
              if (key !== null) {
                keys.add(key);
              }
            } else {
              const spread = evaluate(property.argument);
              for (const key of spread?.kind === 'shape' ? spread.keys : []) {
                keys.add(key);
              }
            }
          }
          return { kind: 'shape', keys };
        }

        case AST_NODE_TYPES.MemberExpression: {
          const schema = getStaticPropertyName(target) === 'shape' ? evaluate(target.object) : null;
          return schema?.kind === 'schema' ? { kind: 'shape', keys: schema.keys } : null;
        }

        case AST_NODE_TYPES.CallExpression:
          return evaluateCall(target, evaluate);

        default:
          return null;
      }
    }

    function reportSafeExtend(operation: Operation, key: string): void {
      const { callee } = operation.call;
      let safeExtendName: string | undefined;
      if (callee.type === AST_NODE_TYPES.MemberExpression) {
        safeExtendName = callee.computed ? undefined : 'safeExtend';
      } else {
        // A named import is renamed to `safeExtend`'s local name, so it must be imported.
        safeExtendName = getNamedImportLocal('safeExtend');
      }

      context.report({
        node: operation.reportNode,
        messageId: 'overwriteRefined',
        data: { key },
        suggest: safeExtendName
          ? [
              {
                messageId: 'useSafeExtend',
                fix(fixer): RuleFix {
                  return fixer.replaceText(
                    callee.type === AST_NODE_TYPES.MemberExpression ? callee.property : callee,
                    safeExtendName,
                  );
                },
              },
            ]
          : [],
      });
    }

    function check(operation: Operation): void {
      const { name, receiver, reportNode } = operation;
      if (!THROWING_METHODS.has(name) && name !== 'extend') {
        return;
      }
      const value = evaluate(receiver);
      const thrown = value?.kind === 'schema' ? findThrow(operation, value, evaluate) : null;
      if (thrown?.key) {
        reportSafeExtend(operation, thrown.key);
      } else if (thrown) {
        context.report({ node: reportNode, messageId: 'reshapeRefined', data: { method: name } });
      }
    }

    return {
      ImportDeclaration: importDeclarationListener,
      // Every call, not only detected schemas: a helper's result (`withId(userSchema).pick(…)`) is one too.
      CallExpression(call): void {
        const operation = readOperation(call);
        if (operation) {
          check(operation);
        }
        // A helper or `.apply()` callback may throw inside, on the schema passed to it.
        if (!operation || operation.name === 'apply') {
          evaluate(call);
        }
      },
    };
  };
}
