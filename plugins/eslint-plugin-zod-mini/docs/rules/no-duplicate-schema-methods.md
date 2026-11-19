# zod-mini/no-duplicate-schema-methods

📝 Disallow calling the same schema method more than once in a single chain.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule Details

This rule disallows calling the same Zod Mini schema method more than once within a single method chain. Duplicate calls are almost always a mistake — they indicate redundant or conflicting configuration.

Methods that are designed to be chained multiple times, such as `.check()` (and its alias `.with()`) and `.register()`, are excluded from this check.

Since most of `zod/mini`'s API is passed to `.check()` rather than chained,
the rule also reports a check argument that repeats an earlier one in the same schema,
whether within one `.check()` call or across several.
Only checks whose second application is redundant are compared:
`trim()`, `toLowerCase()`, `toUpperCase()`, `describe()`, and `normalize()` with the same form (no argument means `'NFC'`).
A form read from a call or a property is not compared, since two reads may differ.

A repeat is reported only while the earlier check is still in effect.
It is not when a check between the two may undo it:
the opposite case (`z.toUpperCase()` after `z.toLowerCase()`), another `normalize()` form,
`overwrite()`, a callback check, a custom check that is not a zod call, or `.apply()`.

Accumulating checks are left alone, because each call adds an independent constraint:
`regex()`, `includes()`, `startsWith()`, `endsWith()`, `overwrite()`, `refine()`, `superRefine()`, `multipleOf()` and `meta()`.
Repeated bounds such as `z.minLength(1)` are reported by [`no-conflicting-checks`](./no-conflicting-checks.md).

The rule reports without a fix: the last `describe()` wins, so removing either one changes the description.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

const aSchema = z.string().brand('Foo').brand('Bar');
//                                     ^^^^^^^^^^^^^ duplicate .brand()

const bSchema = z.string().check(z.trim(), z.toLowerCase(), z.trim());
//                                                          ^^^^^^^^ duplicate trim()

const cSchema = z.string().check(z.normalize()).check(z.normalize('NFC'));
//                                                    ^^^^^^^^^^^^^^^^^^ duplicate normalize()
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

const aSchema = z.string().brand('MyBrand');

// .check() is excluded — chaining multiple .check() calls is intentional in zod/mini
const bSchema = z.string().check(z.minLength(1)).check(z.maxLength(10));

// normalize() with different forms
const cSchema = z.string().check(z.normalize('NFD'), z.normalize('NFC'));

// accumulating checks: both patterns must match
const dSchema = z.string().check(z.regex(/^a/), z.regex(/z$/));

// overwrite() may add whitespace back, so the second trim() is needed
const eSchema = z.string().check(
  z.trim(),
  z.overwrite((s) => ` ${s} `),
  z.trim(),
);
```

## When Not To Use It

If you intentionally call the same method twice (e.g. to override a constraint set elsewhere via composition), you can disable this rule for that line.
