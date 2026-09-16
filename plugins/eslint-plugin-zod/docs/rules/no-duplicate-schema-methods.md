# zod/no-duplicate-schema-methods

📝 Disallow calling the same schema method more than once in a single chain.

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule disallows calling the same Zod schema method more than once within a single method chain. Duplicate calls are almost always a mistake — they are either redundant (e.g. calling `.trim()` twice) or create conflicting constraints (e.g. setting `.min()` twice with different values).

Methods that are designed to be chained multiple times, such as `.or()`, `.and()`, and `.array()`, are excluded from this check. This also includes `.regex()`, `.includes()`, `.startsWith()`, `.endsWith()`, and `.overwrite()`, since each call applies an independent constraint or transformation — matching a string against two different patterns is common, unlike calling `.min()` twice with different values.

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

// .or() and .and() are excluded — chaining them is intentional
const cSchema = z.string().or(z.number()).or(z.boolean());

// .array() can be chained to create nested arrays
const dSchema = z.string().nonempty().array().array();

// .regex() (and .includes()/.startsWith()/.endsWith()/.overwrite()) can be
// chained to apply multiple independent constraints
const eSchema = z
  .string()
  .regex(/^[ -~]*$/)
  .regex(/^W/);
```

## When Not To Use It

If you intentionally call the same method twice (e.g. to override a constraint set elsewhere via composition), you can disable this rule for that line.
