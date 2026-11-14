import { describe, expect, it } from 'vitest';

import { buildZodConstraintsRemoveFix } from './build-zod-constraints-remove-fix.js';
import { trackChain } from './spec-helpers.js';
import { zodMiniImportScope } from './zod-import-scope.js';
import type { ZodImportScope } from './zod-import-scope.js';

/** The fixed code, or `null` when there is no fix. */
function remove(code: string, names: Array<string>, scope?: ZodImportScope): string | null {
  const { tracker, sourceCode, call, methods, applyFix } = trackChain(code, scope);
  const constraints = tracker
    .collectZodSchemaConstraints(call)
    .filter((constraint) => names.includes(constraint.name));
  return applyFix((fixer) =>
    buildZodConstraintsRemoveFix({ fixer, sourceCode, methods, constraints }),
  );
}

describe('buildZodConstraintsRemoveFix', () => {
  it('removes chained constraints as chain methods', () => {
    expect(remove('z.array(x).min(2)', ['min'])).toBe('z.array(x)');
    expect(remove('z.string().min(1).max(5).trim()', ['min', 'max'])).toBe('z.string().trim()');
  });

  it('removes a whole `.check(...)` call when every argument is targeted', () => {
    expect(
      remove(
        'z.array(x).check(z.minLength(1), z.maxLength(2))',
        ['minLength', 'maxLength'],
        zodMiniImportScope,
      ),
    ).toBe('z.array(x)');
  });

  it('returns null when removing a `.check(...)` would orphan a sibling argument', () => {
    expect(
      remove('z.array(x).check(z.minLength(1), z.maxLength(2))', ['minLength'], zodMiniImportScope),
    ).toBeNull();
  });

  it('returns null when any one removal is unsafe', () => {
    expect(remove('(z.string().min(1)).max(5)', ['min', 'max'])).toBeNull();
  });
});
