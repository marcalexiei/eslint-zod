import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noTransformInRecordKey } from './no-transform-in-record-key.js';

const ruleTester = new RuleTester();

ruleTester.run(noTransformInRecordKey.name, noTransformInRecordKey, {
  valid: [
    {
      name: 'transform in a method chained on the record, not in its key',
      code: dedent`
        import * as z from 'zod';
        z.record(z.string(), z.number()).pipe(z.transform((value) => Object.keys(value)));
        z.record(z.string(), z.number()).or(z.string().trim());
      `,
    },
    {
      name: 'plain string key without transforms',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string(), z.unknown());
      `,
    },
    {
      name: 'string key with validator (no transform)',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string().min(1), z.unknown());
      `,
    },
    {
      name: 'string key with multiple validators',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string().min(1).max(100), z.unknown());
      `,
    },
    {
      name: 'enum key without transforms',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.enum(['a', 'b', 'c']), z.number());
      `,
    },
    {
      name: 'number key',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.number(), z.string());
      `,
    },
    {
      name: 'transform on value schema (not key) is fine',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string(), z.string().trim());
      `,
    },
    {
      name: 'transform on value schema with multiple methods',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string(), z.string().trim().toLowerCase());
      `,
    },
    {
      name: 'normalize on value schema (not key) is fine',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string(), z.string().normalize());
      `,
    },
    {
      name: 'overwrite on value schema (not key) is fine',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string(), z.string().overwrite((value) => value.trim()));
      `,
    },
    {
      name: 'key schema is a reference, not a call',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(keySchema, z.unknown());
      `,
    },
    {
      name: 'record with no arguments',
      code: dedent`
        import * as z from 'zod';
        const config = z.record();
      `,
    },
    {
      name: 'not zod.record',
      code: 'const config = someOtherLib.record(z.string().trim(), z.unknown());',
    },
    {
      name: 'named import without transforms',
      code: dedent`
        import { record, string } from 'zod';
        const config = record(string(), string());
      `,
    },
    {
      name: 'named imports with validators',
      code: dedent`
        import { record, string } from 'zod';
        const config = record(string().min(1), string());
      `,
    },
    {
      name: 'named imports with enum key',
      code: dedent`
        import { record } from 'zod';
        import { z } from 'zod';
        const config = record(z.enum(['a', 'b']), z.unknown());
      `,
    },
    {
      name: 'named imports with number key',
      code: dedent`
        import { record, number } from 'zod';
        const config = record(number(), string());
      `,
    },
    {
      name: 'named imports with transform on value schema',
      code: dedent`
        import { record, string } from 'zod';
        const config = record(string(), string().trim());
      `,
    },
    {
      name: 'named z import (acts as namespace)',
      code: dedent`
        import { z } from 'zod';
        const config = z.record(z.string(), z.unknown());
      `,
    },
    {
      name: 'named z import with validators',
      code: dedent`
        import { z } from 'zod';
        const config = z.record(z.string().min(1), z.unknown());
      `,
    },
    {
      name: 'key schema referenced through a variable is not analyzed',
      code: dedent`
        import * as z from 'zod';
        const Key = z.string().trim();
        const config = z.record(Key, z.unknown());
      `,
    },
    {
      name: 'z.record() without arguments',
      code: dedent`
        import * as z from 'zod';
        const config = z.record();
      `,
    },
    {
      name: 'transform in a method called on the key schema of a record',
      code: dedent`
        import * as z from 'zod';
        z.record(z.string(), z.number()).keyType.or(z.string().transform((value) => value));
      `,
    },
  ],
  invalid: [
    {
      name: 'trim on key schema',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string().trim(), z.unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'toLowerCase on key schema',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string().toLowerCase(), z.unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'toUpperCase on key schema',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string().toUpperCase(), z.number());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'transform method on key schema',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string().transform((v) => v.trim()), z.unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'normalize on key schema',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string().normalize(), z.unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'overwrite on key schema',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string().overwrite((value) => value.trim()), z.unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'chained transforms on key schema',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string().trim().toLowerCase(), z.unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'transform after validator on key schema',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string().min(1).trim(), z.unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'named import with trim',
      code: dedent`
        import { record, string } from 'zod';
        const config = record(string().trim(), string());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'named import with toLowerCase',
      code: dedent`
        import { record, string } from 'zod';
        const config = record(string().toLowerCase(), string());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'named import with toUpperCase',
      code: dedent`
        import { record, string } from 'zod';
        const config = record(string().toUpperCase(), string());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'named import with chained transforms',
      code: dedent`
        import { record, string } from 'zod';
        const config = record(string().trim().toLowerCase(), string());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'named import with normalize',
      code: dedent`
        import { record, string } from 'zod';
        const config = record(string().normalize(), string());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'named z import with trim',
      code: dedent`
        import { z } from 'zod';
        const config = z.record(z.string().trim(), z.unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'named z import with toLowerCase',
      code: dedent`
        import { z } from 'zod';
        const config = z.record(z.string().toLowerCase(), z.unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'named z import with chained transforms',
      code: dedent`
        import { z } from 'zod';
        const config = z.record(z.string().trim().toUpperCase(), z.unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'named z import with overwrite',
      code: dedent`
        import { z } from 'zod';
        const config = z.record(z.string().overwrite((value) => value.trim()), z.unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'real-world example with data loss',
      code: dedent`
        import * as z from 'zod';
        const schema = z.record(z.string().trim(), z.unknown());
        const input = { " id ": "abc-123", "id": "def-456" };
        const result = schema.parse(input);
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'top-level transform factory as key schema',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.transform((v) => v.trim()), z.unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'named import of the transform factory as key schema',
      code: dedent`
        import { record, transform, unknown } from 'zod';
        const config = record(transform((v) => v.trim()), unknown());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'slugify on the key schema',
      code: dedent`
        import * as z from 'zod';
        const config = z.record(z.string().slugify(), z.number());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'transform on the key of a record with a chained method',
      code: dedent`
        import * as z from 'zod';
        z.record(z.string().trim(), z.number()).optional();
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'transform on the key of partialRecord and looseRecord',
      code: dedent`
        import * as z from 'zod';
        z.partialRecord(z.string().trim(), z.number());
        z.looseRecord(z.string().trim(), z.number());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }, { messageId: 'noTransformInRecordKey' }],
    },
    {
      name: 'transform called first on a key reached through a property access',
      code: dedent`
        import * as z from 'zod';
        z.record(z.object({ key: z.string() }).shape.key.trim(), z.number());
      `,
      errors: [{ messageId: 'noTransformInRecordKey' }],
    },
  ],
});
