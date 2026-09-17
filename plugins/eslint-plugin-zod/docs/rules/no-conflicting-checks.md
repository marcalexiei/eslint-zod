# zod/no-conflicting-checks

📝 Disallow check combinations that can never match, are redundant, or do not apply to the schema type.

<!-- end auto-generated rule header -->

## Rule Details

Zod happily builds schemas whose checks contradict each other. Depending on the combination the schema silently matches nothing (`z.number().gt(10).lt(5)`), a check is silently dead (`z.number().gt(0).positive()`), or construction throws at runtime (`z.string().min(4).max(2)`). None of these are caught at compile time.

Only literal arguments are analyzed — constraints whose bound is an identifier or expression are skipped, as are chains containing type-changing methods (`transform`, `pipe`, `array`, `or`, `and`).

Complements [`no-duplicate-schema-methods`](./no-duplicate-schema-methods.md): that rule catches _repeats_ of the same method, this one catches _conflicts and redundancies_ between different checks.

## Options

<!-- begin auto-generated rule options list -->

| Name                      | Description                                                             | Type    |
| :------------------------ | :---------------------------------------------------------------------- | :------ |
| `checkConfusingCases`     | Report technically valid but almost certainly mistaken combinations     | Boolean |
| `checkImpossibleCases`    | Report provably unsatisfiable combinations — the schema can never match | Boolean |
| `checkInapplicableChecks` | Report checks that don't apply to the schema's base type                | Boolean |

<!-- end auto-generated rule options list -->

All options default to `true`:

- **`checkImpossibleCases`** — provably unsatisfiable combinations: empty numeric or length ranges, contradictory sign checks, two mutually exclusive string formats, a format or content check conflicting with a length bound, incompatible prefixes/suffixes.
- **`checkConfusingCases`** — technically valid but almost certainly a mistake: bounds implied by stronger ones (`gt(0).gt(5)`), sign checks implied by bounds (`gt(0).positive()`), `multipleOf` values implied by larger ones, `int().multipleOf(1)`, `lowercase()` combined with `uppercase()`.
- **`checkInapplicableChecks`** — checks that don't apply to the schema's base type. In `zod` the chained spellings are type-safe, so this category mostly concerns `eslint-plugin-zod-mini`; it still covers cases only reachable dynamically.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod';

// impossible — the schema can never match
z.number().gt(10).lt(5);
z.number().positive().negative();
z.string().min(4).max(2); // throws at construction
z.string().length(2).length(3);
z.string().uuid().email(); // exclusive formats
z.string().uuid().max(1); // a uuid is 36 chars
z.string().includes('xyz').max(2);
z.string().startsWith('foo').startsWith('bar');

// confusing — valid but almost certainly a mistake
z.number().gt(0).positive(); // positive is just gt(0)
z.number().gt(0).gt(5); // gt(0) redundant
z.number().int().multipleOf(1); // multipleOf(1) redundant
z.number().multipleOf(2).multipleOf(4); // multipleOf(2) redundant
z.string().max(10).max(5); // max(10) redundant
z.string().lowercase().uppercase(); // only matches non-cased strings
```

### ✅ Valid

```ts
import * as z from 'zod';

z.string().min(2).max(10);
z.number().gt(0).lt(100);
z.number().gte(5).lte(5); // exactly 5 — valid
z.number().int().gt(0).multipleOf(2); // positive even integers
z.number().multipleOf(3).multipleOf(5); // multiples of 15 — intentional
z.string().startsWith('a').startsWith('abc'); // 'a' is a prefix of 'abc'
z.string().min(5).includes('@'); // compatible
z.string().uuid().uuidv4(); // narrowing a uuid to one version
z.string().guid().uuid(); // every uuid is a guid
```

Two formats only conflict when neither accepts a subset of the other. The
GUID/UUID family nests — `guid` ⊇ `uuid` ⊇ `uuidv4`/`uuidv6`/`uuidv7` — so
combining them narrows rather than contradicts. Two different UUID versions
(`uuidv4().uuidv7()`) still conflict, as does any other format pair.

## Limitations

Deliberately out of scope (too complex for a linter):

- Number-theory reasoning — `int()` combined with a range containing no integer (`gt(0).lt(1)`), `multipleOf(k)` with a range containing no multiple
- `regex()` compatibility with other checks
- Format checks evaluated against `z.literal()` values

## Overlap with `no-duplicate-schema-methods`

[`no-duplicate-schema-methods`](./no-duplicate-schema-methods.md) excludes `.regex()`, `.includes()`, `.startsWith()` and `.endsWith()`, because repeating them is legitimate.
This rule reports the ones that conflict, and only when every argument is a string literal.

## When Not To Use It

There is little reason to disable the rule entirely — the impossible category always indicates a bug. Disable individual categories via the options instead.

## Further Reading

- [Zod – Schema methods](https://zod.dev/api)
