import type { TSESTree } from '@typescript-eslint/types';
import { Linter } from 'eslint';
import type { SourceCode } from 'eslint';
import esquery from 'esquery';
import tseslint from 'typescript-eslint';

type Range = readonly [number, number];

/** A text edit, as a rule's fix returns it. */
export interface SpecFix {
  range: Range;
  text: string;
}

/** A fixer that works on ranges, so it accepts any node type. */
export interface SpecFixer {
  insertTextAfter: (node: { range: Range }, text: string) => SpecFix;
  insertTextAfterRange: (range: Range, text: string) => SpecFix;
  insertTextBefore: (node: { range: Range }, text: string) => SpecFix;
  insertTextBeforeRange: (range: Range, text: string) => SpecFix;
  remove: (node: { range: Range }) => SpecFix;
  removeRange: (range: Range) => SpecFix;
  replaceText: (node: { range: Range }, text: string) => SpecFix;
  replaceTextRange: (range: Range, text: string) => SpecFix;
}

const fixer: SpecFixer = {
  insertTextAfter: (node, text) => fixer.insertTextAfterRange(node.range, text),
  insertTextAfterRange: ([, end], text) => ({ range: [end, end], text }),
  insertTextBefore: (node, text) => fixer.insertTextBeforeRange(node.range, text),
  insertTextBeforeRange: ([start], text) => ({ range: [start, start], text }),
  remove: (node) => fixer.removeRange(node.range),
  removeRange: (range) => ({ range, text: '' }),
  replaceText: (node, text) => ({ range: node.range, text }),
  replaceTextRange: (range, text) => ({ range, text }),
};

/** A parsed file as a rule sees it: parents and scopes set. */
export interface ParsedCode {
  program: TSESTree.Program;
  sourceCode: SourceCode;
  /** The first node matching an esquery selector; throws when none does. */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- callers name the node type
  find: <T extends TSESTree.Node = TSESTree.Node>(selector: string) => T;
  /** Every node matching an esquery selector, in source order. */
  findAll: <T extends TSESTree.Node = TSESTree.Node>(selector: string) => Array<T>;
  /** The code after the fixes `build` returns, or `null` when it returns none. */
  applyFix: (build: (fixer: SpecFixer) => SpecFix | ReadonlyArray<SpecFix> | null) => string | null;
}

/** Parses `code` as ESLint would, so specs use real nodes instead of mocks. */
export function parseCode(code: string): ParsedCode {
  let sourceCode: SourceCode | undefined;
  const messages = new Linter().verify(code, {
    languageOptions: { parser: tseslint.parser },
    plugins: {
      spec: {
        rules: {
          // Captured at the end, once every node has its parent.
          capture: {
            create: (context) => ({
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Program:exit': (): void => {
                sourceCode = context.sourceCode as SourceCode;
              },
            }),
          },
        },
      },
    },
    rules: { 'spec/capture': 'error' },
  });
  if (!sourceCode) {
    throw new Error(`cannot parse: ${messages.map((it) => it.message).join('; ')}`);
  }

  const program = sourceCode.ast as unknown as TSESTree.Program;
  const findAll: ParsedCode['findAll'] = (selector) =>
    esquery.query(program as never, selector) as never;
  const find: ParsedCode['find'] = (selector) => {
    const node = findAll(selector).at(0);
    if (!node) {
      throw new Error(`no node matches ${selector}`);
    }
    return node as never;
  };
  const applyFix: ParsedCode['applyFix'] = (build) => {
    const result = build(fixer);
    if (result === null) {
      return null;
    }
    const fixes = ('range' in result ? [result] : [...result]).toSorted(
      (a, b) => b.range[0] - a.range[0],
    );
    let output = code;
    let limit = Infinity;
    for (const { range, text } of fixes) {
      if (range[1] > limit) {
        throw new Error(`overlapping fixes at ${range.join('-')}`);
      }
      output = output.slice(0, range[0]) + text + output.slice(range[1]);
      limit = range[0];
    }
    return output;
  };
  return { program, sourceCode, find, findAll, applyFix };
}
