# zod/require-error-message

📝 Enforce that custom refinements include an error message.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🔒 `strict`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces that all custom refinements (using `.refine()` or `z.custom()`) include an error message.\
This helps provide clearer feedback when validation fails.

Additionally, it:

- Enforces using `error` instead of the deprecated `message` property
- Removes redundant `message` property when both `error` and `message` are present

## Why?

Including error messages in schema refinements is important because:

1. **Better User Experience**: Clear error messages help users understand why their input was rejected
2. **Easier Debugging**: Descriptive error messages make it easier to identify validation issues
3. **Self-Documenting Code**: Error messages often serve as documentation for the validation rules
4. **Consistent Error Handling**: Ensures all custom validations provide meaningful feedback

## Examples

### ❌ Invalid

```ts
// Missing error message
z.string().refine(() => true);

// Object without error property
z.string().refine(() => true, { abort: true });

// Using deprecated 'message' property
z.string().refine(() => true, { message: 'hello' });

// Redundant 'message' property
z.string().refine(() => true, { message: 'hello', error: 'hello' });

// Custom validation without error message
z.custom(() => true);
```

### ✅ Valid

```ts
// Using string error message
z.string().refine(() => true, 'error msg');

// Using object with error property
z.string().refine(() => true, { error: 'error msg' });

// Using function for dynamic error messages
z.string().refine(() => true, { error: () => 'dynamic error' });

// Custom validation with string error
z.custom(() => true, 'error msg');

// Custom validation with error property
z.custom(() => true, { error: 'hello there' });

// Works with chained methods
z.string()
  .refine(() => true, { error: 'error msg' })
  .trim();
```

## Auto-fixes

This rule can automatically fix three types of issues:

1. Replace deprecated `message` property with `error`:

   ```ts
   // Before
   z.string().refine(() => true, { message: 'hello' });
   // After
   z.string().refine(() => true, { error: 'hello' });
   ```

2. Remove redundant `message` property:

   ```ts
   // Before
   z.string().refine(() => true, { message: 'hello', error: 'hello' });
   // After
   z.string().refine(() => true, { error: 'hello' });
   ```

## When Not To Use It

If you:

- Have a global error handling strategy that doesn't rely on individual error messages
- Prefer to handle validation errors differently
- Want to keep schema definitions more concise at the cost of less detailed error messages
- Need to maintain compatibility with older Zod versions that use the `message` property

## Further Reading

- [Zod - Refinements](https://zod.dev/api#refine)
- [Zod - Custom Schemas](https://zod.dev/api?id=custom)
- [Zod - Error Handling](https://zod.dev/basics?id=handling-errors)
