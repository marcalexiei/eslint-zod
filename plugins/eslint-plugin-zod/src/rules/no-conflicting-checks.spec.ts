import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noConflictingChecks } from './no-conflicting-checks.js';

const ruleTester = new RuleTester();

ruleTester.run(noConflictingChecks.name, noConflictingChecks, {
  valid: [
    {
      name: 'compatible string bounds',
      code: dedent`
        import * as z from 'zod';
        z.string().min(2).max(10);
      `,
    },
    {
      name: 'compatible array bounds',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).min(1).max(5);
      `,
    },
    {
      name: 'compatible number range',
      code: dedent`
        import * as z from 'zod';
        z.number().gt(0).lt(100);
      `,
    },
    {
      name: 'gte and lte with the same value match exactly that value',
      code: dedent`
        import * as z from 'zod';
        z.number().gte(5).lte(5);
      `,
    },
    {
      name: 'positive even integers',
      code: dedent`
        import * as z from 'zod';
        z.number().int().gt(0).multipleOf(2);
      `,
    },
    {
      name: 'coprime multipleOf values are intentional',
      code: dedent`
        import * as z from 'zod';
        z.number().multipleOf(3).multipleOf(5);
      `,
    },
    {
      name: 'unrelated substrings can both occur',
      code: dedent`
        import * as z from 'zod';
        z.string().includes('foo').includes('bar');
      `,
    },
    {
      name: 'different regex patterns',
      code: dedent`
        import * as z from 'zod';
        const ASCII = /^[ -~]*$/;
        const NON_LATIN = /^\W/;
        z.string().regex(ASCII).regex(NON_LATIN);
      `,
    },
    {
      name: 'two spellings of the same pattern are not resolved',
      code: dedent`
        import * as z from 'zod';
        const ASCII = /^[ -~]*$/;
        z.string().regex(ASCII).regex(/^[ -~]*$/);
      `,
    },
    {
      name: 'regex patterns passed as a spread are not analyzed',
      code: dedent`
        import * as z from 'zod';
        declare const patterns: [RegExp];
        z.string()
          .regex(...patterns)
          .regex(...patterns);
      `,
    },
    {
      name: 'regex without an argument is not analyzed',
      code: dedent`
        import * as z from 'zod';
        z.string().regex().regex();
      `,
    },
    {
      name: 'length bound compatible with content check',
      code: dedent`
        import * as z from 'zod';
        z.string().min(5).includes('@');
      `,
    },
    {
      name: 'non-literal bounds are not analyzed',
      code: dedent`
        import * as z from 'zod';
        declare const n: number;
        z.string().min(n).max(2);
      `,
    },
    {
      name: 'chains with type-changing methods are not analyzed',
      code: dedent`
        import * as z from 'zod';
        z.string().min(5).max(2).transform((s) => s.length);
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { string } from 'not-zod';
        string().min(4).max(2);
      `,
    },
    {
      name: 'computed-member format factory is not analyzed (no crash)',
      code: dedent`
        import * as z from 'zod';
        z['uuid']();
      `,
    },
    {
      name: 'computed-member literal factory is not analyzed (no crash)',
      code: dedent`
        import * as z from 'zod';
        z['literal']('foo');
      `,
    },
    {
      name: 'uuid narrowed to a specific version is a refinement, not a conflict',
      code: dedent`
        import * as z from 'zod';
        z.string().uuid().uuidv4();
      `,
    },
    {
      name: 'guid narrowed to uuid is a refinement, not a conflict',
      code: dedent`
        import * as z from 'zod';
        z.string().guid().uuid();
      `,
    },
    {
      name: 'top-level uuid factory narrowed to a version is a refinement',
      code: dedent`
        import * as z from 'zod';
        z.uuid().uuidv4();
      `,
    },
    {
      name: 'impossible cases can be disabled',
      code: dedent`
        import * as z from 'zod';
        z.number().gt(10).lt(5);
      `,
      options: [{ checkImpossibleCases: false }],
    },
    {
      name: 'confusing cases can be disabled',
      code: dedent`
        import * as z from 'zod';
        z.number().gt(0).positive();
      `,
      options: [{ checkConfusingCases: false }],
    },
    {
      name: 'chain methods that are not checks are skipped',
      code: dedent`
        import * as z from 'zod';
        z.string().describe('a description');
      `,
    },
  ],
  invalid: [
    {
      name: 'empty number range (gt/lt)',
      code: dedent`
        import * as z from 'zod';
        z.number().gt(10).lt(5);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'empty number range (gte/lte)',
      code: dedent`
        import * as z from 'zod';
        z.number().gte(5).lte(4);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'equal bounds with an exclusive side',
      code: dedent`
        import * as z from 'zod';
        z.number().gt(5).lte(5);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'contradictory sign checks',
      code: dedent`
        import * as z from 'zod';
        z.number().positive().negative();
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'empty bigint range with mixed number/bigint literals (plain JS)',
      code: dedent`
        import * as z from 'zod';
        z.bigint().gt(5n).lte(5);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'sign check contradicting a bound',
      code: dedent`
        import * as z from 'zod';
        z.number().positive().lte(0);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'string length min greater than max',
      code: dedent`
        import * as z from 'zod';
        z.string().min(4).max(2);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'exact length conflicting with min',
      code: dedent`
        import * as z from 'zod';
        z.string().length(3).min(4);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'array length min greater than max',
      code: dedent`
        import * as z from 'zod';
        z.array(z.string()).min(4).max(2);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'two different exact lengths',
      code: dedent`
        import * as z from 'zod';
        z.string().length(2).length(3);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'mutually exclusive string formats',
      code: dedent`
        import * as z from 'zod';
        z.string().uuid().email();
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'mutually exclusive deprecated chained formats',
      code: dedent`
        import * as z from 'zod';
        z.string().ipv4().ipv6();
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'two different uuid versions — neither narrows the other',
      code: dedent`
        import * as z from 'zod';
        z.string().uuidv4().uuidv7();
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'chained format equals its top-level replacement',
      code: dedent`
        import * as z from 'zod';
        z.string().datetime().date();
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'format conflicting with a length bound',
      code: dedent`
        import * as z from 'zod';
        z.string().uuid().max(1);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'deprecated chained format conflicting with a length bound',
      code: dedent`
        import * as z from 'zod';
        z.string().guid().max(1);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'credit card conflicting with a length bound (min 12 characters)',
      code: dedent`
        import * as z from 'zod';
        z.creditCard().max(8);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'credit card conflicting with a lower length bound (max 37 characters)',
      code: dedent`
        import * as z from 'zod';
        z.creditCard().min(40);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'format conflicting with an exact length',
      code: dedent`
        import * as z from 'zod';
        z.string().uuid().length(5);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'content check conflicting with a length bound',
      code: dedent`
        import * as z from 'zod';
        z.string().includes('xyz').max(2);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'prefix conflicting with an exact length',
      code: dedent`
        import * as z from 'zod';
        z.string().startsWith('abcd').length(2);
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'incompatible prefixes',
      code: dedent`
        import * as z from 'zod';
        z.string().startsWith('foo').startsWith('bar');
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'incompatible suffixes',
      code: dedent`
        import * as z from 'zod';
        z.string().endsWith('foo').endsWith('bar');
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'prefix implied by a longer one',
      code: dedent`
        import * as z from 'zod';
        z.string().startsWith('a').startsWith('abc');
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'suffix implied by a longer one',
      code: dedent`
        import * as z from 'zod';
        z.string().endsWith('com').endsWith('.com');
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'substring implied by a longer one',
      code: dedent`
        import * as z from 'zod';
        z.string().includes('a').includes('abc');
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'repeated identical content check',
      code: dedent`
        import * as z from 'zod';
        z.string().includes('a').includes('a');
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'three prefixes report the two weaker ones once each',
      code: dedent`
        import * as z from 'zod';
        z.string().startsWith('a').startsWith('ab').startsWith('abc');
      `,
      errors: [{ messageId: 'redundantCheck' }, { messageId: 'redundantCheck' }],
    },
    {
      name: 'repeated regex with the same pattern identifier',
      code: dedent`
        import * as z from 'zod';
        const ASCII = /^[ -~]*$/;
        z.string().regex(ASCII).regex(ASCII);
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'repeated regex with the same pattern literal',
      code: dedent`
        import * as z from 'zod';
        z.string()
          .regex(/^[ -~]*$/)
          .regex(/^[ -~]*$/);
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'repeated regex differing only in the error message',
      code: dedent`
        import * as z from 'zod';
        const ASCII = /^[ -~]*$/;
        z.string().regex(ASCII, 'ascii only').regex(ASCII, 'printable only');
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'lowercase combined with uppercase',
      code: dedent`
        import * as z from 'zod';
        z.string().lowercase().uppercase();
      `,
      errors: [{ messageId: 'confusingCombination' }],
    },
    {
      name: 'positive is redundant next to gt(0)',
      code: dedent`
        import * as z from 'zod';
        z.number().gt(0).positive();
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'nonnegative is redundant next to positive',
      code: dedent`
        import * as z from 'zod';
        z.number().positive().nonnegative();
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'weaker lower bound is redundant',
      code: dedent`
        import * as z from 'zod';
        z.number().gt(0).gt(5);
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'weaker upper bound is redundant',
      code: dedent`
        import * as z from 'zod';
        z.string().max(10).max(5);
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'multipleOf(1) is redundant on an int schema',
      code: dedent`
        import * as z from 'zod';
        z.number().int().multipleOf(1);
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'multipleOf implied by a larger multiple',
      code: dedent`
        import * as z from 'zod';
        z.number().multipleOf(2).multipleOf(4);
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'several problems in one chain are all reported',
      code: dedent`
        import * as z from 'zod';
        z.string().uuid().email().max(1);
      `,
      errors: [{ messageId: 'impossibleCase' }, { messageId: 'impossibleCase' }],
    },
    {
      name: 'case pair and empty length range in one chain',
      code: dedent`
        import * as z from 'zod';
        z.string().lowercase().uppercase().min(5).max(2);
      `,
      errors: [{ messageId: 'impossibleCase' }, { messageId: 'confusingCombination' }],
    },
    {
      name: 'repeated equal multipleOf values',
      code: dedent`
        import * as z from 'zod';
        z.number().multipleOf(2).multipleOf(2);
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'multipleOf implying a later smaller multiple',
      code: dedent`
        import * as z from 'zod';
        z.number().multipleOf(6).multipleOf(3);
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'bigint multipleOf implied by a larger multiple',
      code: dedent`
        import * as z from 'zod';
        z.bigint().multipleOf(3n).multipleOf(6n);
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'bigint multipleOf implying a later smaller multiple',
      code: dedent`
        import * as z from 'zod';
        z.bigint().multipleOf(6n).multipleOf(3n);
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'explicit lower bound against an upper bound implied by a sign check',
      code: dedent`
        import * as z from 'zod';
        z.number().gt(5).negative();
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'exclusive upper bound wins over an equal inclusive one',
      code: dedent`
        import * as z from 'zod';
        z.number().lte(5).lt(5);
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
  ],
});
