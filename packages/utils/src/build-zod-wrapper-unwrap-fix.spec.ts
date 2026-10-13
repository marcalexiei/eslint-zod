import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import { buildZodWrapperUnwrapFix } from './build-zod-wrapper-unwrap-fix.js';
import type { RuleFixer, SourceCode } from './rule-types.js';

function makeFixer(): {
  fixer: RuleFixer;
  calls: { replaced?: { node: TSESTree.Node; text: string } };
} {
  const calls: { replaced?: { node: TSESTree.Node; text: string } } = {};
  const fixer = {
    replaceText(node: TSESTree.Node, text: string) {
      calls.replaced = { node, text };
      return { range: node.range, text };
    },
  } as unknown as RuleFixer;
  return { fixer, calls };
}

function makeSourceCode(
  text: string,
  comments: Array<{ range: [number, number] }> = [],
): Readonly<SourceCode> {
  return {
    getText: () => text,
    getAllComments: () => comments,
  } as unknown as Readonly<SourceCode>;
}

function makeCall(
  args: Array<TSESTree.CallExpressionArgument>,
  { asArgument = false } = {},
): TSESTree.CallExpression {
  const call = {
    type: AST_NODE_TYPES.CallExpression,
    arguments: args,
    range: [0, 20],
  } as unknown as TSESTree.CallExpression;
  call.parent = (
    asArgument
      ? { type: AST_NODE_TYPES.CallExpression, arguments: [call] }
      : { type: AST_NODE_TYPES.ExpressionStatement }
  ) as TSESTree.Node;
  return call;
}

function makeArgument(type: AST_NODE_TYPES): TSESTree.CallExpressionArgument {
  return { type, range: [11, 19] } as unknown as TSESTree.CallExpressionArgument;
}

describe('buildZodWrapperUnwrapFix', () => {
  it('replaces the wrapper call with its argument text', () => {
    const inner = makeArgument(AST_NODE_TYPES.CallExpression);
    const wrapperCall = makeCall([inner]);
    const { fixer, calls } = makeFixer();

    const fix = buildZodWrapperUnwrapFix({
      fixer,
      sourceCode: makeSourceCode('z.string()'),
      wrapperCall,
    });

    expect(fix).not.toBeNull();
    expect(calls.replaced).toStrictEqual({ node: wrapperCall, text: 'z.string()' });
  });

  it('keeps any expression when the wrapper is itself an argument: z.optional(z.nullable(a ? b : c))', () => {
    const { fixer, calls } = makeFixer();
    const wrapperCall = makeCall([makeArgument(AST_NODE_TYPES.ConditionalExpression)], {
      asArgument: true,
    });

    buildZodWrapperUnwrapFix({ fixer, sourceCode: makeSourceCode('a ? b : c'), wrapperCall });

    expect(calls.replaced).toStrictEqual({ node: wrapperCall, text: 'a ? b : c' });
  });

  it('returns null for a sequence argument, whose parentheses would be lost', () => {
    const { fixer } = makeFixer();

    const fix = buildZodWrapperUnwrapFix({
      fixer,
      sourceCode: makeSourceCode('a, b'),
      wrapperCall: makeCall([makeArgument(AST_NODE_TYPES.SequenceExpression)], {
        asArgument: true,
      }),
    });

    expect(fix).toBeNull();
  });

  it('returns null when the argument could need parentheses: z.readonly(a ? b : c)', () => {
    const { fixer } = makeFixer();

    const fix = buildZodWrapperUnwrapFix({
      fixer,
      sourceCode: makeSourceCode('a ? b : c'),
      wrapperCall: makeCall([makeArgument(AST_NODE_TYPES.ConditionalExpression)]),
    });

    expect(fix).toBeNull();
  });

  it('returns null when a comment sits between the wrapper and its argument', () => {
    const { fixer } = makeFixer();

    const fix = buildZodWrapperUnwrapFix({
      fixer,
      sourceCode: makeSourceCode('z.string()', [{ range: [2, 9] }]),
      wrapperCall: makeCall([makeArgument(AST_NODE_TYPES.CallExpression)]),
    });

    expect(fix).toBeNull();
  });

  it('returns null when the call has no arguments', () => {
    const { fixer } = makeFixer();

    const fix = buildZodWrapperUnwrapFix({
      fixer,
      sourceCode: makeSourceCode(''),
      wrapperCall: makeCall([]),
    });

    expect(fix).toBeNull();
  });

  it('returns null when the call has more than one argument', () => {
    const { fixer } = makeFixer();

    const fix = buildZodWrapperUnwrapFix({
      fixer,
      sourceCode: makeSourceCode(''),
      wrapperCall: makeCall([
        makeArgument(AST_NODE_TYPES.CallExpression),
        makeArgument(AST_NODE_TYPES.Literal),
      ]),
    });

    expect(fix).toBeNull();
  });

  it('returns null for a spread argument', () => {
    const { fixer } = makeFixer();

    const fix = buildZodWrapperUnwrapFix({
      fixer,
      sourceCode: makeSourceCode(''),
      wrapperCall: makeCall([makeArgument(AST_NODE_TYPES.SpreadElement)]),
    });

    expect(fix).toBeNull();
  });
});
