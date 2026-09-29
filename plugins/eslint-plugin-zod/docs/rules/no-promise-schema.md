# zod/no-promise-schema

📝 Disallow deprecated `z.promise()` schemas.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

## Rule Details

Zod 4 deprecates `z.promise()`. In most cases you should await the value before parsing it with a non-promise schema.

This rule flags `z.promise()` usages so schemas follow the current API guidance.

Replacing `z.promise()` safely is not a mechanical rename.\
In most cases the correct migration is to await the input before parsing,
which depends on the surrounding control flow and cannot be inferred reliably from the schema expression alone.

## Examples

### Invalid

```ts
import * as z from 'zod';

const schema = z.promise(z.string());
const optionalSchema = z.promise(z.string()).optional();
```

```ts
import { promise, string } from 'zod';

const schema = promise(string());
```

### Valid

```ts
import * as z from 'zod';

const schema = z.string();

const value = await Promise.resolve('hello');
schema.parse(value);
```

## When Not To Use It

Disable this rule if you intentionally want to allow the deprecated `z.promise()` API.

## Further Reading

- [Zod promises](https://zod.dev/api#promises)
- [Zod 4 changelog](https://zod.dev/v4/changelog#zpromise-deprecated)
