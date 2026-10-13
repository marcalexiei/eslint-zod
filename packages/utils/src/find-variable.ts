import type { Scope, ScopeVariable } from './rule-types.js';

/** The variable `name` resolves to from `scope` outward, or `null` when nothing declares it. */
export function findVariable(scope: Scope | null, name: string): ScopeVariable | null {
  for (let current = scope; current; current = current.upper) {
    const variable = current.set.get(name);
    if (variable) {
      return variable;
    }
  }
  return null;
}
