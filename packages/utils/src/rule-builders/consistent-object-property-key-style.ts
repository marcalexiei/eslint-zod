import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { findVariable } from '../find-variable.js';
import { getBindingInitializer } from '../get-binding-initializer.js';
import { getStaticPropertyName } from '../get-static-property-name.js';
import type { RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';

import { ZOD_OBJECT_METHODS } from './consistent-object-schema-type.js';
import type { ZodObjectMethod } from './consistent-object-schema-type.js';

export { ZOD_OBJECT_METHODS };
export type { ZodObjectMethod };

export const ZOD_OBJECT_PROPERTY_KEY_STYLES = Object.freeze(['camelCase', 'snake_case'] as const);

export type ZodObjectPropertyKeyStyle = (typeof ZOD_OBJECT_PROPERTY_KEY_STYLES)[number];

export interface ConsistentObjectPropertyKeyStyleOptions {
  style?: ZodObjectPropertyKeyStyle;
  allow?: ReadonlyArray<ZodObjectMethod>;
}

type MessageIds = 'invalidStyle';

const CAMEL_CASE_PATTERN = /^[a-z][a-zA-Z0-9]*$/u;
const SNAKE_CASE_PATTERN = /^[a-z][a-z0-9_]*$/u;
const SNAKE_TO_CAMEL_PATTERN = /_[a-z0-9]/gu;
const CAMEL_TO_SNAKE_PATTERN = /[A-Z]/gu;

function isCamelCase(name: string): boolean {
  return CAMEL_CASE_PATTERN.test(name);
}

function isSnakeCase(name: string): boolean {
  return SNAKE_CASE_PATTERN.test(name);
}

function toCamelCase(s: string): string {
  return s.replace(SNAKE_TO_CAMEL_PATTERN, (match: string) => match.slice(1).toUpperCase());
}

function toSnakeCase(s: string): string {
  return s.replace(CAMEL_TO_SNAKE_PATTERN, (match: string) => `_${match.toLowerCase()}`);
}

export function buildConsistentObjectPropertyKeyStyleCreate(
  scope: ZodImportScope,
): (
  context: Readonly<RuleContext<MessageIds, [ConsistentObjectPropertyKeyStyleOptions]>>,
  options: readonly [ConsistentObjectPropertyKeyStyleOptions],
) => RuleListener {
  return function create(context, [options = {}]) {
    const { style = 'camelCase', allow = ZOD_OBJECT_METHODS } = options;
    const { createSchemaVisitor, collectZodChainMethods } = scope.createTracker({
      kind: 'value',
      sourceCode: context.sourceCode,
    });

    const checkCasing = style === 'camelCase' ? isCamelCase : isSnakeCase;
    const toStyle = style === 'camelCase' ? toCamelCase : toSnakeCase;
    const checkedObjects = new WeakSet<TSESTree.ObjectExpression>();

    function checkObjectExpression(objectExpression: TSESTree.ObjectExpression): void {
      if (checkedObjects.has(objectExpression)) {
        return;
      }
      checkedObjects.add(objectExpression);

      for (const property of objectExpression.properties) {
        if (property.type !== AST_NODE_TYPES.Property) {
          continue;
        }
        const name = getStaticPropertyName(property);
        if (name && !checkCasing(name)) {
          context.report({
            node: property.key,
            messageId: 'invalidStyle',
            data: { name, style },
            fix(fixer): RuleFix {
              const replacement = toStyle(name);
              return fixer.replaceText(
                property.key,
                property.key.type === AST_NODE_TYPES.Literal ? `'${replacement}'` : replacement,
              );
            },
          });
        }
      }
    }

    return createSchemaVisitor({
      schemaType: allow,
      onSchema(node, meta): void {
        const factoryCall =
          meta.methods.length > 1 ? (collectZodChainMethods(node).at(0)?.node ?? node) : node;
        const arg = factoryCall.arguments.at(0);
        if (!arg) {
          return;
        }

        if (arg.type === AST_NODE_TYPES.ObjectExpression) {
          checkObjectExpression(arg);
        } else if (arg.type === AST_NODE_TYPES.Identifier) {
          const variable = findVariable(context.sourceCode.getScope(arg), arg.name);
          const initializer = getBindingInitializer(variable);
          if (initializer?.type === AST_NODE_TYPES.ObjectExpression) {
            checkObjectExpression(initializer);
          }
        }
      },
    });
  };
}
