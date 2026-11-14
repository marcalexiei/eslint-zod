import { parseCode } from '@eslint-zod/tooling/vitest/parse-code';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import {
  bindsWholeModule,
  getImportSyntax,
  getUsageReplacement,
  getUsageText,
} from './import-syntax-helpers.js';

// Shapes the `consistent-import` fixtures cannot reach.

/** The first specifier of `import <clause> from 'zod'`. */
const specifier = (clause: string): TSESTree.ImportClause =>
  parseCode(`import ${clause} from 'zod';`).find('ImportDeclaration > .specifiers');

describe('getUsageReplacement', () => {
  it.each([
    {
      code: 'string();',
      selector: 'CallExpression > .callee',
      newText: 'z.string',
      text: 'z.string',
    },
    {
      code: 'other[array];',
      selector: 'MemberExpression > .property',
      newText: 'z.array',
      text: 'z.array',
    },
    { code: '({ y });', selector: 'Property > .value', newText: 'z', text: 'y: z' },
  ])('replaces the usage in $code with $text', ({ code, selector, newText, text }) => {
    const node = parseCode(code).find<TSESTree.Identifier>(selector);
    expect(getUsageReplacement(node, newText)).toStrictEqual({ node, text });
  });

  it('keeps the exported name of an export specifier', () => {
    const { find } = parseCode("export { y as 'y-y' };");
    expect(getUsageReplacement(find('ExportSpecifier > .local'), 'z')).toStrictEqual({
      node: find('ExportSpecifier'),
      text: "z as 'y-y'",
    });
  });

  it('gives up on exporting a qualified name', () => {
    const node = parseCode('export { string };').find<TSESTree.Identifier>(
      'ExportSpecifier > .local',
    );
    expect(getUsageReplacement(node, 'z.string')).toBeNull();
  });

  it('gives up when the usage has no text', () => {
    expect(getUsageReplacement(parseCode('x;').find('Identifier'), null)).toBeNull();
  });
});

describe('getImportSyntax', () => {
  it.each([
    ['* as z', 'namespace'],
    ['z', 'default'],
    ['{ z as zod }', 'named'],
    ['{ string }', null],
    ['{ default as z }', null],
    ["{ 'z' as z }", null],
  ])('reads %s as %s', (clause, expected) => {
    expect(getImportSyntax(specifier(clause))).toBe(expected);
  });
});

describe('bindsWholeModule', () => {
  it.each([
    ['* as y', true],
    ['y', true],
    ['{ z as y }', true],
    ['{ default as y }', true],
    ["{ 'z' as z }", true],
    ['{ string }', false],
  ])('%s → %s', (clause, expected) => {
    expect(bindsWholeModule(specifier(clause))).toBe(expected);
  });
});

describe('getUsageText', () => {
  it.each([
    ['uses the alias for a whole-module import', '* as y', 'z'],
    ['qualifies the export name, not the local one', '{ string as str }', 'z.string'],
    ['gives `null` for a string-literal export name', "{ 'a-b' as ab }", null],
  ])('%s: %s', (_, clause, expected) => {
    expect(getUsageText(specifier(clause), 'z')).toBe(expected);
  });
});
