import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { OptionsWithDefaults } from '../create-rule-creator.js';
import { getIdentifierValue, skipTypeAssertions } from '../get-binding-initializer.js';
import { getStaticPropertyName } from '../get-static-property-name.js';
import type { RuleContext, RuleFix, RuleListener } from '../rule-types.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import type { ZodObjectMethod } from '../zod-object-methods.js';

export const ZOD_OBJECT_PROPERTY_KEY_STYLES = Object.freeze(['camelCase', 'snake_case'] as const);

export interface ConsistentObjectPropertyKeyStyleOptions {
  style?: (typeof ZOD_OBJECT_PROPERTY_KEY_STYLES)[number];
  allow?: ReadonlyArray<ZodObjectMethod>;
}

type MessageIds = 'invalidStyle' | 'renameKey';

// Two words or more, so a one-word key fits both styles.
const CAMEL_CASE = /^[a-z][a-z0-9]*(?:[A-Z][a-z0-9]+)+$/u;
const SNAKE_CASE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/u;

function toCamelCase(name: string): string {
  return name.replace(/_[a-z0-9]/gu, (match) => match.charAt(1).toUpperCase());
}

function toSnakeCase(name: string): string {
  return name.replace(/[A-Z]/gu, (char) => `_${char.toLowerCase()}`);
}

/**
 * Reports a schema shape key written in the other style than `style`, inline or bound to a local variable.
 * Keys in neither style (`_id`, `Content-Type`, `userID`) are left alone.
 * The rename is a suggestion: it changes which input key the schema reads.
 */
export function buildConsistentObjectPropertyKeyStyleCreate(
  scope: ZodImportScope,
): (
  context: Readonly<RuleContext<MessageIds, [ConsistentObjectPropertyKeyStyleOptions]>>,
  options: Readonly<OptionsWithDefaults<[ConsistentObjectPropertyKeyStyleOptions]>>,
) => RuleListener {
  return function create(context, [{ style, allow }]) {
    const { createSchemaVisitor, getZodChainFactory } = scope.createTracker({
      kind: 'value',
      sourceCode: context.sourceCode,
    });
    // Each style reports the keys written in the other one.
    const [pattern, rename] =
      style === 'camelCase' ? [SNAKE_CASE, toCamelCase] : [CAMEL_CASE, toSnakeCase];
    // A shape shared by several schemas is reported once.
    const checkedShapes = new WeakSet<TSESTree.ObjectExpression>();

    function renamedKeyText(property: TSESTree.Property, replacement: string): string {
      if (property.shorthand) {
        return `${replacement}: ${context.sourceCode.getText(property.value)}`;
      }
      if (property.key.type === AST_NODE_TYPES.Literal) {
        const quote = context.sourceCode.getText(property.key).charAt(0);
        return `${quote}${replacement}${quote}`;
      }
      return replacement;
    }

    function checkShape(shape: TSESTree.ObjectExpression): void {
      if (checkedShapes.has(shape)) {
        return;
      }
      checkedShapes.add(shape);

      const keys = shape.properties.flatMap((property) =>
        property.type === AST_NODE_TYPES.Property
          ? [{ property, name: getStaticPropertyName(property) }]
          : [],
      );
      const names = new Set(keys.map((key) => key.name));
      for (const { property, name } of keys) {
        if (name === null || !pattern.test(name)) {
          continue;
        }

        const replacement = rename(name);
        context.report({
          node: property.key,
          messageId: 'invalidStyle',
          data: { name, style },
          suggest: names.has(replacement)
            ? []
            : [
                {
                  messageId: 'renameKey',
                  data: { replacement },
                  fix: (fixer): RuleFix =>
                    fixer.replaceText(property.key, renamedKeyText(property, replacement)),
                },
              ],
        });
      }
    }

    return createSchemaVisitor({
      schemaType: allow,
      onSchema(node): void {
        // The outermost call may be a method (`.optional()`); the shape is the factory's argument.
        const argument = getZodChainFactory(node)?.node.arguments.at(0);
        const value =
          argument && argument.type !== AST_NODE_TYPES.SpreadElement
            ? skipTypeAssertions(argument)
            : null;
        const shape =
          value?.type === AST_NODE_TYPES.Identifier
            ? getIdentifierValue(context.sourceCode, value)
            : value;
        if (shape?.type === AST_NODE_TYPES.ObjectExpression) {
          checkShape(shape);
        }
      },
    });
  };
}
