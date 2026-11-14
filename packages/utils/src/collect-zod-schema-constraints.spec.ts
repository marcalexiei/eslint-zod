import { describe, expect, it } from 'vitest';

import type { ZodSchemaConstraint } from './collect-zod-schema-constraints.js';
import { trackChain } from './spec-helpers.js';
import { zodMiniImportScope } from './zod-import-scope.js';
import type { ZodImportScope } from './zod-import-scope.js';

function collect(code: string, scope?: ZodImportScope): Array<ZodSchemaConstraint> {
  const { tracker, call } = trackChain(code, scope);
  return tracker.collectZodSchemaConstraints(call);
}

/** Each constraint as `name@chainIndex`, with `[argumentIndex/argumentCount]` for a check argument. */
function summarize(constraints: Array<ZodSchemaConstraint>): Array<string> {
  return constraints.map((constraint) =>
    constraint.origin === 'chained'
      ? `${constraint.name}@${constraint.chainIndex}`
      : `${constraint.name}@${constraint.chainIndex}[${constraint.argumentIndex}/${constraint.argumentCount}]`,
  );
}

describe('collectZodSchemaConstraints', () => {
  it.each([
    ['z.string()', []],
    ['z.string().min(2).max(5)', ['min@1', 'max@2']],
    // The walk resumes after the property access, so `.trim()` is the first call.
    ['z.object({ a: z.string() }).shape.a.trim().min(2)', ['trim@0', 'min@1']],
  ])('collects the chained constraints of %s', (code, expected) => {
    expect(summarize(collect(code))).toStrictEqual(expected);
  });

  it.each([
    ['z.string().check(z.minLength(2), z.maxLength(5))', ['minLength@1[0/2]', 'maxLength@1[1/2]']],
    ['z.string().with(z.minLength(2))', ['minLength@1[0/1]']],
    ['z.array(x).check(z.maxLength(5)).check(z.length(3))', ['maxLength@1[0/1]', 'length@2[0/1]']],
    // Unrecognized arguments are skipped but still counted.
    ['z.string().check(custom(), z.minLength(2), arg)', ['minLength@1[1/3]']],
    ['z.string().check()', []],
  ])('collects the check arguments of %s', (code, expected) => {
    expect(summarize(collect(code, zodMiniImportScope))).toStrictEqual(expected);
  });

  it('points a chained constraint at its call', () => {
    const { tracker, call } = trackChain('z.string().min(2)');
    expect(tracker.collectZodSchemaConstraints(call)[0].node).toBe(call);
  });

  it('points a check argument at its call and at its `.check(...)`', () => {
    const { tracker, call } = trackChain('z.string().check(z.minLength(2))', zodMiniImportScope);
    expect(tracker.collectZodSchemaConstraints(call)[0]).toMatchObject({
      node: call.arguments[0],
      checkNode: call,
    });
  });
});
