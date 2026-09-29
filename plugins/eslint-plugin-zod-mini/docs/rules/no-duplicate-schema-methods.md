# zod-mini/no-duplicate-schema-methods

📝 Disallow calling the same schema method more than once in a single chain.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule Details

This rule disallows calling the same Zod Mini schema method more than once within a single method chain. Duplicate calls are almost always a mistake — they indicate redundant or conflicting configuration.

Methods that are designed to be chained multiple times, such as `.check()`, `.or()`, and `.and()`, are excluded from this check.

## Examples

### ❌ Invalid

```ts
import * as z from 'zod/mini';

const aSchema = z.string().brand('Foo').brand('Bar');
//                                      ^^^^^^^^^^^ duplicate .brand()
```

### ✅ Valid

```ts
import * as z from 'zod/mini';

const aSchema = z.string().brand('MyBrand');

// .check() is excluded — chaining multiple .check() calls is intentional in zod/mini
const bSchema = z.string().check(z.minLength(1)).check(z.maxLength(10));

// .or() and .and() are excluded — chaining them is intentional
const cSchema = z.string().or(z.number()).or(z.boolean());
```

## When Not To Use It

If you intentionally call the same method twice (e.g. to override a constraint set elsewhere via composition), you can disable this rule for that line.
