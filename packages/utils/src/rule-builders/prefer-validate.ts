import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils, AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';

import { getZodSchemaBaseType } from '../get-zod-schema-base-type.js';
import type { ZodImportScope } from '../zod-import-scope.js';
import { ZOD_NON_SCHEMA_PRODUCING_METHODS } from '../zod-non-schema-producing-methods.js';

type MessageIds = 'preferValidate' | 'useValidate';

interface ZodBinding {
  name: string;
  declaration: TSESTree.ImportDeclaration;
  local: TSESTree.Identifier;
}

interface Edit {
  range: TSESTree.Range;
  text: string;
}

function propertyName(node: TSESTree.MemberExpression | TSESTree.Property): string | null {
  const property = node.type === AST_NODE_TYPES.MemberExpression ? node.property : node.key;
  if (!node.computed && property.type === AST_NODE_TYPES.Identifier) {
    return property.name;
  }
  return property.type === AST_NODE_TYPES.Literal && typeof property.value === 'string'
    ? property.value
    : null;
}

const OTHER_FACTORIES = new Set([
  'union',
  'discriminatedUnion',
  'intersection',
  'tuple',
  'enum',
  'nativeEnum',
  'record',
  'partialRecord',
  'custom',
  'instanceof',
  'lazy',
  'optional',
  'nullable',
  'nullish',
  'nonoptional',
  'readonly',
  'default',
  'prefault',
  'catch',
  'pipe',
  'transform',
  'codec',
  'promise',
  'function',
  'null',
  'undefined',
  'void',
  'nan',
  'success',
  'file',
  'json',
  'fromJSONSchema',
  'templateLiteral',
]);

/**
 * Finds success-only parse results using lexical bindings, without type services.
 * Suggestions are atomic across local result reads; escaping results are ignored.
 */
export function buildPreferValidateCreate(
  scope: ZodImportScope,
  api: 'classic' | 'mini',
): (context: Readonly<TSESLint.RuleContext<MessageIds, []>>) => TSESLint.RuleListener {
  return function create(context) {
    const { sourceCode } = context;
    const calls: Array<TSESTree.CallExpression> = [];
    const bindings: Array<ZodBinding> = [];
    const identifiers = new Set<string>();

    function variable(node: TSESTree.Identifier): TSESLint.Scope.Variable | null {
      return ASTUtils.findVariable(sourceCode.getScope(node), node.name);
    }

    function binding(node: TSESTree.Node): ZodBinding | undefined {
      if (node.type !== AST_NODE_TYPES.Identifier) {
        return undefined;
      }
      const definition = variable(node)?.defs[0];
      if (
        definition?.type !== TSESLint.Scope.DefinitionType.ImportBinding ||
        definition.node.type === AST_NODE_TYPES.TSImportEqualsDeclaration
      ) {
        return undefined;
      }
      const { local } = definition.node;
      return bindings.find((item) => item.local === local);
    }

    function importedCall(node: TSESTree.Node): ZodBinding | undefined {
      if (node.type === AST_NODE_TYPES.Identifier) {
        const found = binding(node);
        return found?.name === '*' ? undefined : found;
      }
      if (node.type !== AST_NODE_TYPES.MemberExpression || node.optional) {
        return undefined;
      }
      const found = binding(node.object);
      const name = propertyName(node);
      return found?.name === '*' && name ? { ...found, name } : undefined;
    }

    function schemaSource(
      node: TSESTree.Node,
      seen = new Set<TSESLint.Scope.Variable>(),
    ): TSESTree.ImportDeclaration | undefined {
      if (node.type === AST_NODE_TYPES.Identifier) {
        const found = variable(node);
        if (!found || seen.has(found) || found.defs.length !== 1) {
          return undefined;
        }
        seen.add(found);
        const [definition] = found.defs;
        if (
          definition.type !== TSESLint.Scope.DefinitionType.Variable ||
          definition.parent.kind !== 'const' ||
          definition.node.id.type !== AST_NODE_TYPES.Identifier ||
          !definition.node.init ||
          found.references.some((reference) => reference.isWrite() && !reference.init)
        ) {
          return undefined;
        }
        return schemaSource(definition.node.init, seen);
      }
      if (node.type !== AST_NODE_TYPES.CallExpression || node.optional) {
        return undefined;
      }
      const imported = importedCall(node.callee);
      if (imported && (getZodSchemaBaseType(imported.name) || OTHER_FACTORIES.has(imported.name))) {
        return imported.declaration;
      }
      if (node.callee.type !== AST_NODE_TYPES.MemberExpression || node.callee.optional) {
        return undefined;
      }
      const name = propertyName(node.callee);
      if (
        !name ||
        // apply() returns the callback's result, which need not be a schema.
        name === 'apply' ||
        name === 'isOptional' ||
        name === 'isNullable' ||
        (name === 'meta' && node.arguments.length === 0) ||
        ZOD_NON_SCHEMA_PRODUCING_METHODS.some((method) => method === name)
      ) {
        return undefined;
      }
      // Nested factory namespaces: z.iso.date(), z.coerce.number(), or named imports.
      const namespace = importedCall(node.callee.object) ?? binding(node.callee.object);
      if (namespace && (namespace.name === 'iso' || namespace.name === 'coerce')) {
        return namespace.declaration;
      }
      return schemaSource(node.callee.object, seen);
    }

    function accessorStart(node: TSESTree.MemberExpression): number {
      // Parentheses can surround both the receiver and a computed property.
      return sourceCode.getTokenAfter(node.object, {
        filter: (token) => token.value === (node.computed ? '[' : '.'),
      })!.range[0];
    }

    function isSuccessRead(
      node: TSESTree.Identifier | TSESTree.CallExpression | TSESTree.AwaitExpression,
    ): TSESTree.MemberExpression | undefined {
      const { parent } = node;
      if (
        parent.type !== AST_NODE_TYPES.MemberExpression ||
        parent.object !== node ||
        parent.optional ||
        propertyName(parent) !== 'success'
      ) {
        return undefined;
      }
      let target: TSESTree.Node = parent;
      while (
        target.parent.type === AST_NODE_TYPES.TSNonNullExpression ||
        target.parent.type === AST_NODE_TYPES.TSAsExpression ||
        target.parent.type === AST_NODE_TYPES.TSTypeAssertion ||
        target.parent.type === AST_NODE_TYPES.TSSatisfiesExpression ||
        target.parent.type === AST_NODE_TYPES.ArrayPattern ||
        target.parent.type === AST_NODE_TYPES.ObjectPattern ||
        target.parent.type === AST_NODE_TYPES.RestElement ||
        (target.parent.type === AST_NODE_TYPES.AssignmentPattern &&
          target.parent.left === target) ||
        (target.parent.type === AST_NODE_TYPES.Property &&
          target.parent.value === target &&
          target.parent.parent.type === AST_NODE_TYPES.ObjectPattern)
      ) {
        target = target.parent;
      }
      const usage = target.parent;
      if (
        (usage.type === AST_NODE_TYPES.AssignmentExpression && usage.left === target) ||
        usage.type === AST_NODE_TYPES.UpdateExpression ||
        ((usage.type === AST_NODE_TYPES.ForOfStatement ||
          usage.type === AST_NODE_TYPES.ForInStatement) &&
          usage.left === target) ||
        (usage.type === AST_NODE_TYPES.NewExpression && usage.callee === target) ||
        (usage.type === AST_NODE_TYPES.UnaryExpression && usage.operator === 'delete') ||
        (usage.type === AST_NODE_TYPES.CallExpression && usage.callee === target) ||
        (usage.type === AST_NODE_TYPES.TaggedTemplateExpression && usage.tag === target)
      ) {
        return undefined;
      }
      return parent;
    }

    function validationTarget(
      declaration: TSESTree.ImportDeclaration,
      name: string,
      at: TSESTree.Node,
    ): { text: string; edit?: Edit } {
      const accessible = bindings.filter(
        (item) =>
          item.declaration.source.value === declaration.source.value &&
          ASTUtils.findVariable(sourceCode.getScope(at), item.local.name)?.defs[0]?.node ===
            item.local.parent,
      );
      const named = accessible.find((item) => item.name === name);
      if (named) {
        return { text: named.local.name };
      }
      const namespace = accessible.find((item) => item.name === '*');
      if (namespace) {
        return { text: `${namespace.local.name}.${name}` };
      }
      let local = name;
      let suffix = 2;
      while (identifiers.has(local)) {
        local = `${name}${suffix}`;
        suffix += 1;
      }
      const specifier = local === name ? name : `${name} as ${local}`;
      return {
        text: local,
        edit: {
          range: [declaration.range[0], declaration.range[0]],
          text: `import { ${specifier} } from ${sourceCode.getText(declaration.source)};\n`,
        },
      };
    }

    function check(call: TSESTree.CallExpression): void {
      if (call.optional) {
        return;
      }
      const imported = importedCall(call.callee);
      const member = call.callee.type === AST_NODE_TYPES.MemberExpression ? call.callee : undefined;
      if (member?.optional) {
        return;
      }
      const name = imported?.name ?? (member ? propertyName(member) : null);
      if (
        name !== 'safeParse' &&
        name !== 'safeParseAsync' &&
        !(api === 'classic' && !imported && name === 'spa')
      ) {
        return;
      }
      const standalone = imported !== undefined;
      const schema = standalone ? call.arguments[0] : member?.object;
      const declaration = standalone ? imported.declaration : schema && schemaSource(schema);
      if (!declaration || !schema || call.arguments.length < (standalone ? 2 : 1)) {
        return;
      }
      const async = name !== 'safeParse';
      const result =
        async && call.parent.type === AST_NODE_TYPES.AwaitExpression ? call.parent : call;
      if (async && result === call) {
        return;
      }
      const edits: Array<Edit> = [];
      const direct = isSuccessRead(result);
      if (direct) {
        edits.push({
          range: [accessorStart(direct), direct.range[1]],
          text: '',
        });
      } else {
        const declarator = result.parent;
        if (
          declarator.type !== AST_NODE_TYPES.VariableDeclarator ||
          declarator.init !== result ||
          declarator.parent.parent.type === AST_NODE_TYPES.ExportNamedDeclaration
        ) {
          return;
        }
        const { id } = declarator;
        if (id.typeAnnotation) {
          return;
        }
        if (id.type === AST_NODE_TYPES.ObjectPattern) {
          if (id.properties.length !== 1) {
            return;
          }
          const [property] = id.properties;
          if (
            property.type !== AST_NODE_TYPES.Property ||
            propertyName(property) !== 'success' ||
            property.value.type !== AST_NODE_TYPES.Identifier
          ) {
            return;
          }
          edits.push({ range: id.range, text: sourceCode.getText(property.value) });
        } else if (id.type === AST_NODE_TYPES.Identifier) {
          const found = variable(id);
          if (
            found?.defs.length !== 1 ||
            found.references.some((reference) => reference.isWrite() && reference.identifier !== id)
          ) {
            return;
          }
          const reads = found.references.filter((reference) => reference.isRead());
          if (!reads.length) {
            return;
          }
          for (const reference of reads) {
            if (reference.identifier.type !== AST_NODE_TYPES.Identifier) {
              return;
            }
            const read = isSuccessRead(reference.identifier);
            if (!read) {
              return;
            }
            edits.push({
              range: [accessorStart(read), read.range[1]],
              text: '',
            });
          }
        } else {
          return;
        }
      }
      const replacement = async ? 'validateAsync' : 'validate';
      let unsupported = false;
      if (!standalone && api === 'classic' && member) {
        edits.push({
          range: member.property.range,
          text: member.computed ? `'${replacement}'` : replacement,
        });
      } else if (standalone && member) {
        edits.push({
          range: member.property.range,
          text: member.computed ? `'${replacement}'` : replacement,
        });
      } else {
        const target = validationTarget(declaration, replacement, call);
        if (target.edit) {
          edits.push(target.edit);
        }
        if (standalone) {
          edits.push({ range: call.callee.range, text: target.text });
        } else {
          // Keep the original schema expression, including its enclosing parentheses.
          const opening = sourceCode.getTokenAfter(call.callee);
          if (!member || opening?.value !== '(' || call.typeArguments) {
            unsupported = true;
          } else {
            edits.push({ range: [call.range[0], call.range[0]], text: `${target.text}(` });
            edits.push({
              range: [accessorStart(member), opening.range[1]],
              text: ', ',
            });
          }
        }
      }
      // Do not discard comments from accessors, destructuring, or the method call.
      const unsafe = edits.some((edit) =>
        sourceCode
          .getAllComments()
          .some(
            (comment) => comment.range[0] >= edit.range[0] && comment.range[1] <= edit.range[1],
          ),
      );
      context.report({
        node: call,
        messageId: 'preferValidate',
        data: { method: replacement },
        suggest:
          unsafe || unsupported
            ? []
            : [
                {
                  messageId: 'useValidate',
                  data: { method: replacement },
                  fix: (fixer): Array<TSESLint.RuleFix> =>
                    edits.map((edit) => fixer.replaceTextRange(edit.range, edit.text)),
                },
              ],
      });
    }

    return {
      ImportDeclaration(node): void {
        if (
          !scope.isAllowed(node.source.value) ||
          node.source.value === 'zod/v3' ||
          node.importKind === 'type'
        ) {
          return;
        }
        for (const specifier of node.specifiers) {
          if (
            specifier.type === AST_NODE_TYPES.ImportSpecifier &&
            specifier.importKind === 'type'
          ) {
            continue;
          }
          let original = '*';
          if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
            original =
              specifier.imported.type === AST_NODE_TYPES.Identifier
                ? specifier.imported.name
                : specifier.imported.value;
          }
          bindings.push({
            name: original === 'z' ? '*' : original,
            declaration: node,
            local: specifier.local,
          });
        }
      },
      Identifier(node): void {
        identifiers.add(node.name);
      },
      CallExpression(node): void {
        calls.push(node);
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Program:exit': (): void => {
        calls.forEach(check);
      },
    };
  };
}
