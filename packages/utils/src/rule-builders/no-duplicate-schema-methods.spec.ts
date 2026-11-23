import { parseCode } from '@eslint-zod/tooling/vitest/parse-code';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import type { RuleContext } from '../rule-types.js';
import { zodImportScope, zodMiniImportScope } from '../zod-import-scope.js';

import { buildNoDuplicateSchemaMethodsCreate } from './no-duplicate-schema-methods.js';

function reportedMethods(
  create: ReturnType<typeof buildNoDuplicateSchemaMethodsCreate>,
  code: string,
): Array<unknown> {
  const { sourceCode, find, findAll } = parseCode(code);
  const methods: Array<unknown> = [];
  const context = {
    sourceCode,
    report: (descriptor: { data?: Record<string, unknown> }) => {
      methods.push(descriptor.data?.method);
    },
  } as unknown as RuleContext<'noDuplicateSchemaMethod'>;
  const listener = create(context);
  listener.ImportDeclaration?.(find<TSESTree.ImportDeclaration>('ImportDeclaration'));
  for (const call of findAll<TSESTree.CallExpression>('CallExpression')) {
    listener.CallExpression?.(call);
  }
  return methods;
}

describe('buildNoDuplicateSchemaMethodsCreate', () => {
  it('honors an exclusion for a rewrite check', () => {
    const code = "import * as z from 'zod';\nz.string().normalize().normalize();";
    const reporting = buildNoDuplicateSchemaMethodsCreate(zodImportScope, []);
    const excluding = buildNoDuplicateSchemaMethodsCreate(zodImportScope, ['normalize']);
    expect(reportedMethods(reporting, code)).toEqual(['normalize']);
    expect(reportedMethods(excluding, code)).toEqual([]);
  });

  it('compares only the check arguments it is given', () => {
    const code = "import * as z from 'zod/mini';\nz.string().check(z.trim(), z.trim());";
    const ignoring = buildNoDuplicateSchemaMethodsCreate(zodMiniImportScope, []);
    const comparing = buildNoDuplicateSchemaMethodsCreate(zodMiniImportScope, [], ['trim']);
    expect(reportedMethods(ignoring, code)).toEqual([]);
    expect(reportedMethods(comparing, code)).toEqual(['trim']);
  });

  it('accepts exclusions the rule can reach', () => {
    const create = buildNoDuplicateSchemaMethodsCreate(zodImportScope, ['meta', 'refine']);
    expect(create).toBeTypeOf('function');
  });

  it('rejects a type-changing method, which starts a new segment before exclusions are read', () => {
    // @ts-expect-error -- `and` starts a new chain segment, so excluding it is dead code
    const create = buildNoDuplicateSchemaMethodsCreate(zodImportScope, ['meta', 'and']);
    expect(create).toBeTypeOf('function');
  });

  it('rejects check and with, whose calls are never compared', () => {
    // @ts-expect-error -- only the arguments of `check` are compared, so excluding it is dead code
    const check = buildNoDuplicateSchemaMethodsCreate(zodImportScope, ['meta', 'check']);
    // @ts-expect-error -- only the arguments of `with` are compared, so excluding it is dead code
    const withAlias = buildNoDuplicateSchemaMethodsCreate(zodImportScope, ['meta', 'with']);
    expect(check).toBeTypeOf('function');
    expect(withAlias).toBeTypeOf('function');
  });

  it('leaves a list typed as plain strings unchecked', () => {
    const excluded: ReadonlyArray<string> = ['and'];
    const create = buildNoDuplicateSchemaMethodsCreate(zodImportScope, excluded);
    expect(create).toBeTypeOf('function');
  });
});
