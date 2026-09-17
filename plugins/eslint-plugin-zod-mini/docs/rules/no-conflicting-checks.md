# zod-mini/no-conflicting-checks

📝 Disallow check combinations that can never match, are redundant, or do not apply to the schema type.

<!-- end auto-generated rule header -->

## Rule Details

Zod happily builds schemas whose checks contradict each other or don't even apply to the base type. The `.check()` API is the sharp edge: it accepts any check regardless of the schema's type, so TypeScript can't help — `z.number().check(z.minLength(1))` compiles fine and silently accepts everything, while `z.string().check(z.positive())` silently rejects everything. Other combinations silently match nothing (`z.number().check(z.gt(10), z.lt(5))`).

It covers multi-argument `.check(...)`, repeated `.check()` calls, and format factories used as the base schema (`z.uuid().check(z.maxLength(1))`). Only literal arguments are analyzed — constraints whose bound is an identifier or expression are skipped.

Complements [`no-duplicate-schema-methods`](./no-duplicate-schema-methods.md): that rule catches _repeats_ of the same method and excludes `.check()`, this one catches _conflicts and redundancies_ between the checks themselves.

## Options

<!-- begin auto-generated rule options list -->

| Name                      | Description                                                             | Type    |
| :------------------------ | :---------------------------------------------------------------------- | :------ |
| `checkConfusingCases`     | Report technically valid but almost certainly mistaken combinations     | Boolean |
| `checkImpossibleCases`    | Report provably unsatisfiable combinations — the schema can never match | Boolean |
| `checkInapplicableChecks` | Report checks that don't apply to the schema's base type                | Boolean |

<!-- end auto-generated rule options list -->

All options default to `true`:

- **`checkImpossibleCases`** — provably unsatisfiable combinations: empty numeric or length ranges, contradictory sign checks, two mutually exclusive string formats, a format or content check conflicting with a length bound, incompatible prefixes/suffixes, and a `z.literal()` contradicted by a check.
- **`checkConfusingCases`** — technically valid but almost certainly a mistake: bounds implied by stronger ones, `multipleOf` values implied by larger ones, content checks implied by longer ones (`z.includes('a'), z.includes('abc')`), a `z.regex()` pattern repeated verbatim, `z.lowercase()` combined with `z.uppercase()`, checks a literal already satisfies, and any check on `z.any()`/`z.unknown()`/`z.never()`.
- **`checkInapplicableChecks`** — checks that don't apply to the schema's base type (`z.number().check(z.minLength(1))`), which silently no-op or reject every value.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

const ASCII = /^[ -~]*$/;

// impossible — the schema can never match
z.number().check(z.gt(10), z.lt(5));
z.string().check(z.minLength(4), z.maxLength(2));
z.array(z.string()).check(z.minLength(4)).check(z.maxLength(2));
z.string().check(z.url(), z.email()); // exclusive formats
z.string().check(z.iso.date(), z.iso.time());
z.string().check(z.ipv4(), z.maxLength(3)); // an ipv4 needs >= 7 chars
z.uuid().check(z.maxLength(1)); // a uuid is 36 chars
z.literal('foo').check(z.minLength(4)); // 'foo' is 3 chars
z.literal(5).check(z.negative());

// confusing — valid but almost certainly a mistake
z.string().check(z.minLength(1), z.minLength(3)); // minLength(1) redundant
z.string().check(z.startsWith('a'), z.startsWith('abc')); // startsWith('a') redundant
z.string().check(z.includes('a'), z.includes('abc')); // includes('a') redundant
z.string().check(z.regex(ASCII), z.regex(ASCII)); // the second regex adds nothing
z.string().check(z.lowercase(), z.uppercase()); // only matches non-cased strings
z.literal('foo').check(z.minLength(2)); // always true — pointless
z.unknown().check(z.uuid()); // defeats the purpose of unknown

// inapplicable — silently no-ops or rejects every value
z.number().check(z.minLength(1)); // accepts everything
z.string().check(z.positive()); // rejects everything
z.array(z.string()).check(z.positive());
z.boolean().check(z.minLength(1));
z.date().check(z.email());
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

const ASCII = /^[ -~]*$/;
const NON_LATIN = /^\W/;

z.string().check(z.minLength(1), z.maxLength(10));
z.number().check(z.gt(0), z.multipleOf(2));
z.number().check(z.gte(5), z.lte(5)); // exactly 5 — valid
z.string().check(z.includes('foo'), z.includes('bar')); // both substrings must occur
z.string().check(z.regex(ASCII), z.regex(NON_LATIN)); // different patterns
z.string().check(z.regex(ASCII), z.regex(/^[ -~]*$/)); // same pattern, different spellings — not resolved
z.union([z.uuid(), z.email()]); // either format — intentional
z.string().check(z.uuid(), z.uuidv4()); // narrowing a uuid to one version
z.string().check(z.guid(), z.uuid()); // every uuid is a guid
```

Two formats only conflict when neither accepts a subset of the other. The
GUID/UUID family nests — `guid` ⊇ `uuid` ⊇ `uuidv4`/`uuidv6`/`uuidv7` — so
combining them narrows rather than contradicts. Two different UUID versions
(`z.uuidv4(), z.uuidv7()`) still conflict, as does any other format pair.

## Limitations

Deliberately out of scope (too complex for a linter):

- Number-theory reasoning — `z.int()` combined with a range containing no integer, `z.multipleOf(k)` with a range containing no multiple
- `z.regex()` compatibility with other checks; two `z.regex()` calls are compared by their argument source text only, so `z.regex(ASCII), z.regex(/^[ -~]*$/)` is not reported
- Format checks evaluated against `z.literal()` values

## When Not To Use It

There is little reason to disable the rule entirely — the impossible and inapplicable categories always indicate bugs. Disable individual categories via the options instead.

## Further Reading

- [Zod – Checks](https://zod.dev/api)
