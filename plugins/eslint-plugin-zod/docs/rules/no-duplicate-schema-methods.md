# zod/no-duplicate-schema-methods

📝 Disallow calling the same schema method more than once in a single chain.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule Details

This rule disallows calling the same Zod schema method more than once within a single method chain. Duplicate calls are almost always a mistake — they are either redundant (e.g. calling `.trim()` twice) or create conflicting constraints (e.g. setting `.min()` twice with different values).

Methods that are designed to be chained multiple times are excluded from this check: `.regex()`, `.includes()`, `.startsWith()`, `.endsWith()`, and `.overwrite()`, since each call applies an independent constraint or transformation — matching a string against two different patterns is common, unlike calling `.min()` twice with different values.
The object reshaping methods (`.extend()`, `.safeExtend()`, `.merge()`, `.omit()`, `.pick()`, `.partial()`, `.exactPartial()`, `.required()`), `.exclude()`, `.extract()`, `.brand()`, `.meta()`, `.multipleOf()`, `.step()` and `.check()` / `.with()` are excluded for the same reason.

A repeat is reported only while the earlier call is still in effect:

- A method that may change the value ends the value checks before it, so `.min(3).trim().min(3)` is not reported.
  Those methods are `.trim()`, `.toLowerCase()`, `.toUpperCase()`, `.normalize()`, `.slugify()`, `.overwrite()`, `.superRefine()`, and `.check()` with a custom check.
- `.trim()` survives a case change and `.slugify()`, which cannot put whitespace back at the edges.
- A case change, `.slugify()`, and `.normalize()` with the same form (no argument means `'NFC'`) survive `.trim()`.
  A form that is neither a string nor a constant bound to one is not compared.
- `.describe()` does not depend on the value.
  It ends at a method that builds a new schema without it, such as `.optional()` or `.partial()`,
  at `.register()`, at a custom check, and at any `.meta()` but an inline object without `description`.
- Wrappers and object modes survive what follows them, which leaves the earlier call the one to remove:
  `.strict().loose().strict()` behaves as `.loose().strict()`.
  `.catch()` and `.nonoptional()` end at a method that may change the value.
- A repeated wrapper is not reported when this file reads it, as `.unwrap()` does, since each such call peels one.

A type-changing method (`.or()`, `.and()`, `.array()`, `.pipe()`, `.transform()`, `.apply()`, `.keyof()`, `.unwrap()`, `.removeDefault()`, `.removeCatch()`) returns another schema:
the methods after it constrain that schema, not the one before.
`z.string().min(1).array().min(1)` bounds the string's length and then the array's, so it is not a duplicate.

Nothing is compared past a method that does not return a schema, such as `.parse()`.

[`no-conflicting-checks`](./no-conflicting-checks.md) owns the excluded content methods:
it reports the combinations that are unsatisfiable or redundant rather than merely repeated.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod';

const aSchema = z.string().trim().min(1).max(5).trim();
//                                              ^^^^ duplicate .trim()

const bSchema = z.string().min(1).max(10).min(5);
//                                        ^^^^ duplicate .min()

const cSchema = z.string().optional().optional();
//                                    ^^^^^^^^^ duplicate .optional()
```

### ✅ Valid

```ts
import * as z from 'zod';

const aSchema = z.string().trim().min(1);

const bSchema = z.string().min(1).max(10);

// .or() and .and() each start a new segment — chaining them is intentional
const cSchema = z.string().or(z.number()).or(z.boolean());

// .array() can be chained to create nested arrays
const dSchema = z.string().nonempty().array().array();

// .array() starts a new segment — the second .min() bounds the array, not the string
const fSchema = z.string().min(1).array().min(1);

// .regex() (and .includes()/.startsWith()/.endsWith()/.overwrite()) can be
// chained to apply multiple independent constraints
const eSchema = z
  .string()
  .regex(/^[ -~]*$/)
  .regex(/^W/);

// .overwrite() may add whitespace back, so the second .trim() is needed
const gSchema = z
  .string()
  .trim()
  .overwrite((s) => ` ${s} `)
  .trim();

// the second .min() checks the trimmed value
const hSchema = z.string().min(3).trim().min(3);

// each .describe() belongs to a different schema
const iSchema = z.string().describe('inner').optional().describe('outer');
```

## When Not To Use It

If you intentionally call the same method twice (e.g. to override a constraint set elsewhere via composition), you can disable this rule for that line.
