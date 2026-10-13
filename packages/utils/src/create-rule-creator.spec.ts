import { describe, expect, it } from 'vitest';

import { createRuleCreator } from './create-rule-creator.js';
import type { RuleContext } from './rule-types.js';

interface Options {
  style?: string;
  nested?: { a?: number; b?: number };
}

const createRule = createRuleCreator((name) => `https://example.test/${name}.md`);

function createOptionsRule(defaultOptions: [Options, string]): {
  received: Array<readonly [Options, string]>;
  run: (userOptions: ReadonlyArray<unknown>) => void;
} {
  const received: Array<readonly [Options, string]> = [];
  const rule = createRule<[Options, string], 'message'>({
    name: 'sample',
    meta: {
      type: 'problem',
      docs: { description: 'A rule.' },
      messages: { message: '' },
      schema: [],
    },
    defaultOptions,
    create(_context, options) {
      received.push(options);
      return {};
    },
  });

  return {
    received,
    run(userOptions): void {
      rule.create({ options: userOptions } as unknown as RuleContext<'message', [Options, string]>);
    },
  };
}

describe('createRuleCreator', () => {
  it('keeps the rule as written and adds its docs url', () => {
    const rule = createRule({
      name: 'sample',
      meta: {
        type: 'suggestion',
        docs: { description: 'A rule.' },
        messages: { message: 'Nope.' },
        schema: [],
        fixable: 'code',
      },
      defaultOptions: [],
      create: () => ({}),
    });

    expect(rule.name).toBe('sample');
    expect(rule.defaultOptions).toStrictEqual([]);
    expect(rule.meta).toStrictEqual({
      type: 'suggestion',
      docs: { description: 'A rule.', url: 'https://example.test/sample.md' },
      messages: { message: 'Nope.' },
      schema: [],
      fixable: 'code',
    });
  });

  it('passes the defaults when the user gives no options', () => {
    const { received, run } = createOptionsRule([{ style: 'a' }, 'x']);
    run([]);

    expect(received).toStrictEqual([[{ style: 'a' }, 'x']]);
  });

  it('merges an object option over its default, key by key', () => {
    const { received, run } = createOptionsRule([{ style: 'a', nested: { a: 1, b: 2 } }, 'x']);
    run([{ nested: { b: 3 } }]);

    expect(received).toStrictEqual([[{ style: 'a', nested: { a: 1, b: 3 } }, 'x']]);
  });

  it('keeps a key the defaults do not declare', () => {
    const { received, run } = createOptionsRule([{}, 'x']);
    run([{ style: 'b' }]);

    expect(received).toStrictEqual([[{ style: 'b' }, 'x']]);
  });

  it('replaces an option that is not an object', () => {
    const { received, run } = createOptionsRule([{ style: 'a' }, 'x']);
    run([undefined, 'y']);

    expect(received).toStrictEqual([[{ style: 'a' }, 'y']]);
  });

  it('drops options past the declared ones', () => {
    const { received, run } = createOptionsRule([{}, 'x']);
    run([{}, 'y', 'extra']);

    expect(received).toStrictEqual([[{}, 'y']]);
  });

  it('never mutates the defaults', () => {
    const defaultOptions: [Options, string] = [{ nested: { a: 1 } }, 'x'];
    const { received, run } = createOptionsRule(defaultOptions);
    run([{ nested: { a: 2 } }]);

    expect(defaultOptions).toStrictEqual([{ nested: { a: 1 } }, 'x']);
    expect(received[0]?.[0]).not.toBe(defaultOptions[0]);
  });
});
