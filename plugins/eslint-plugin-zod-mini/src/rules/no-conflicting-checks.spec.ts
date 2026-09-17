import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { noConflictingChecks } from './no-conflicting-checks.js';

const ruleTester = new RuleTester();

ruleTester.run(noConflictingChecks.name, noConflictingChecks, {
  valid: [
    {
      name: 'compatible string bounds',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(1), z.maxLength(10));
      `,
    },
    {
      name: 'compatible number checks',
      code: dedent`
        import * as z from 'zod/mini';
        z.number().check(z.gt(0), z.multipleOf(2));
      `,
    },
    {
      name: 'gte and lte with the same value match exactly that value',
      code: dedent`
        import * as z from 'zod/mini';
        z.number().check(z.gte(5), z.lte(5));
      `,
    },
    {
      name: 'unrelated substrings can both occur',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.includes('foo'), z.includes('bar'));
      `,
    },
    {
      name: 'different regex patterns',
      code: dedent`
        import * as z from 'zod/mini';
        const ASCII = /^[ -~]*$/;
        const NON_LATIN = /^\W/;
        z.string().check(z.regex(ASCII), z.regex(NON_LATIN));
      `,
    },
    {
      name: 'two spellings of the same pattern are not resolved',
      code: dedent`
        import * as z from 'zod/mini';
        const ASCII = /^[ -~]*$/;
        z.string().check(z.regex(ASCII), z.regex(/^[ -~]*$/));
      `,
    },
    {
      name: 'regex patterns passed as a spread are not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        declare const patterns: [RegExp];
        z.string().check(z.regex(...patterns), z.regex(...patterns));
      `,
    },
    {
      name: 'regex without an argument is not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.regex(), z.regex());
      `,
    },
    {
      name: 'unknown check arguments are ignored',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.refine(() => true), z.minLength(2));
      `,
    },
    {
      name: 'either format via a union is intentional',
      code: dedent`
        import * as z from 'zod/mini';
        z.union([z.uuid(), z.email()]);
      `,
    },
    {
      name: 'non-literal bounds are not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        declare const n: number;
        z.string().check(z.minLength(n), z.maxLength(2));
      `,
    },
    {
      name: 'not a zod import',
      code: dedent`
        import { string, minLength, maxLength } from 'not-zod';
        string().check(minLength(4), maxLength(2));
      `,
    },
    {
      name: 'computed-member format factory is not analyzed (no crash)',
      code: dedent`
        import * as z from 'zod/mini';
        z['uuid']();
      `,
    },
    {
      name: 'computed-member literal factory is not analyzed (no crash)',
      code: dedent`
        import * as z from 'zod/mini';
        z['literal']('foo');
      `,
    },
    {
      name: 'uuid narrowed to a specific version is a refinement, not a conflict',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.uuid(), z.uuidv4());
      `,
    },
    {
      name: 'guid narrowed to uuid is a refinement, not a conflict',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.guid(), z.uuid());
      `,
    },
    {
      name: 'top-level uuid factory narrowed to a version is a refinement',
      code: dedent`
        import * as z from 'zod/mini';
        z.uuid().check(z.uuidv4());
      `,
    },
    {
      name: 'impossible cases can be disabled',
      code: dedent`
        import * as z from 'zod/mini';
        z.number().check(z.gt(10), z.lt(5));
      `,
      options: [{ checkImpossibleCases: false }],
    },
    {
      name: 'confusing cases can be disabled',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(1), z.minLength(3));
      `,
      options: [{ checkConfusingCases: false }],
    },
    {
      name: 'inapplicable checks can be disabled',
      code: dedent`
        import * as z from 'zod/mini';
        z.number().check(z.minLength(1));
      `,
      options: [{ checkInapplicableChecks: false }],
    },
    {
      name: 'a pointless literal check is silenced by `checkConfusingCases: false`',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal('foo').check(z.minLength(2));
      `,
      options: [{ checkConfusingCases: false }],
    },
    {
      name: 'literal argument that is not a primitive is not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(null).check(z.minLength(2));
      `,
    },
    {
      name: 'literal built from a reference is not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        declare const value: 'foo';
        z.literal(value).check(z.minLength(2));
      `,
    },
    {
      name: 'literal against a bound with a non-literal argument is not analyzed',
      code: dedent`
        import * as z from 'zod/mini';
        declare const min: number;
        z.literal(5).check(z.gt(min));
      `,
    },
    {
      name: 'literal against a format check is not evaluated',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal('foo@example.com').check(z.email());
      `,
    },
    {
      name: 'literal against a multipleOf of a different numeric type is not evaluated',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(10).check(z.multipleOf(3n));
      `,
    },
    {
      name: 'multipleOf values of different numeric types are not compared',
      code: dedent`
        import * as z from 'zod/mini';
        z.number().check(z.multipleOf(2), z.multipleOf(3n));
      `,
    },
    {
      name: 'a bare `iso` call has no member name to identify the format',
      code: dedent`
        import * as z from 'zod/mini';
        import { iso } from 'zod/mini';
        z.string().check(iso());
      `,
    },
  ],
  invalid: [
    {
      name: 'empty number range in one check',
      code: dedent`
        import * as z from 'zod/mini';
        z.number().check(z.gt(10), z.lt(5));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'length min greater than max in one check',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(4), z.maxLength(2));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'empty bigint range with mixed number/bigint literals (plain JS)',
      code: dedent`
        import * as z from 'zod/mini';
        z.bigint().check(z.gt(5n), z.lte(5));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'length bounds conflicting across separate checks',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.minLength(4)).check(z.maxLength(2));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'mutually exclusive string formats',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.url(), z.email());
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'two different uuid versions — neither narrows the other',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.uuidv4(), z.uuidv7());
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'mutually exclusive ip formats',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.ipv4(), z.ipv6());
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'mutually exclusive iso formats',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.iso.date(), z.iso.time());
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'format conflicting with a length bound',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.ipv4(), z.maxLength(3));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'credit card conflicting with a length bound (min 12 characters)',
      code: dedent`
        import * as z from 'zod/mini';
        z.creditCard().check(z.maxLength(8));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'credit card conflicting with a lower length bound (max 37 characters)',
      code: dedent`
        import * as z from 'zod/mini';
        z.creditCard().check(z.minLength(40));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'format factory conflicting with a length bound',
      code: dedent`
        import * as z from 'zod/mini';
        z.uuid().check(z.maxLength(1));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'literal shorter than a minimum length',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal('foo').check(z.minLength(4));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'literal longer than a maximum length',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal('foo').check(z.maxLength(2));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'literal contradicting a prefix',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal('foo').check(z.startsWith('bar'));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'number literal outside a bound',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(5).check(z.gt(10));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'number literal contradicting a sign check',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(5).check(z.negative());
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'literal already satisfying a check is pointless',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal('foo').check(z.minLength(2));
      `,
      errors: [{ messageId: 'pointlessCheck' }],
    },
    {
      name: 'number literal already satisfying a sign check is pointless',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(42).check(z.positive());
      `,
      errors: [{ messageId: 'pointlessCheck' }],
    },
    {
      name: 'checking unknown defeats its purpose',
      code: dedent`
        import * as z from 'zod/mini';
        z.unknown().check(z.uuid());
      `,
      errors: [{ messageId: 'pointlessCheck' }],
    },
    {
      name: 'checking any defeats its purpose',
      code: dedent`
        import * as z from 'zod/mini';
        z.any().check(z.email());
      `,
      errors: [{ messageId: 'pointlessCheck' }],
    },
    {
      name: 'never already matches nothing',
      code: dedent`
        import * as z from 'zod/mini';
        z.never().check(z.uuid());
      `,
      errors: [{ messageId: 'pointlessCheck' }],
    },
    {
      name: 'weaker minimum length is redundant',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.minLength(1), z.minLength(3));
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'prefix implied by a longer one',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.startsWith('a'), z.startsWith('abc'));
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'suffix implied by a longer one',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.endsWith('com'), z.endsWith('.com'));
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'substring implied by a longer one',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.includes('a'), z.includes('abc'));
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'repeated identical content check',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.includes('a')).check(z.includes('a'));
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'three prefixes report the two weaker ones once each',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.startsWith('a'), z.startsWith('ab'), z.startsWith('abc'));
      `,
      errors: [{ messageId: 'redundantCheck' }, { messageId: 'redundantCheck' }],
    },
    {
      name: 'repeated regex with the same pattern identifier',
      code: dedent`
        import * as z from 'zod/mini';
        const ASCII = /^[ -~]*$/;
        z.string().check(z.regex(ASCII), z.regex(ASCII));
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'repeated regex with the same pattern literal',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.regex(/^[ -~]*$/), z.regex(/^[ -~]*$/));
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'repeated regex differing only in the error message',
      code: dedent`
        import * as z from 'zod/mini';
        const ASCII = /^[ -~]*$/;
        z.string().check(z.regex(ASCII, 'ascii only'), z.regex(ASCII, 'printable only'));
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'lowercase combined with uppercase',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.lowercase(), z.uppercase());
      `,
      errors: [{ messageId: 'confusingCombination' }],
    },
    {
      name: 'length check on a number schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.number().check(z.minLength(1));
      `,
      errors: [{ messageId: 'inapplicableCheck' }],
    },
    {
      name: 'string content check on a number schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.number().check(z.startsWith('a'));
      `,
      errors: [{ messageId: 'inapplicableCheck' }],
    },
    {
      name: 'format check on a number schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.number().check(z.uuid());
      `,
      errors: [{ messageId: 'inapplicableCheck' }],
    },
    {
      name: 'sign check on a string schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.positive());
      `,
      errors: [{ messageId: 'inapplicableCheck' }],
    },
    {
      name: 'sign check on an array schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.array(z.string()).check(z.positive());
      `,
      errors: [{ messageId: 'inapplicableCheck' }],
    },
    {
      name: 'length check on a boolean schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.boolean().check(z.minLength(1));
      `,
      errors: [{ messageId: 'inapplicableCheck' }],
    },
    {
      name: 'format check on a date schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.date().check(z.email());
      `,
      errors: [{ messageId: 'inapplicableCheck' }],
    },
    {
      name: 'length check on a bigint schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.bigint().check(z.minLength(1));
      `,
      errors: [{ messageId: 'inapplicableCheck' }],
    },
    {
      name: 'format check on a number sub-type schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.int32().check(z.email());
      `,
      errors: [{ messageId: 'inapplicableCheck' }],
    },
    {
      name: 'length check on a stringbool schema (boolean output)',
      code: dedent`
        import * as z from 'zod/mini';
        z.stringbool().check(z.minLength(1));
      `,
      errors: [{ messageId: 'inapplicableCheck' }],
    },
    {
      name: 'sign check on an object schema',
      code: dedent`
        import * as z from 'zod/mini';
        z.object({}).check(z.positive());
      `,
      errors: [{ messageId: 'inapplicableCheck' }],
    },
    {
      name: 'several problems in one chain are all reported',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.maxLength(1), z.uuid(), z.email()).check(z.positive());
      `,
      errors: [
        { messageId: 'impossibleCase' },
        { messageId: 'impossibleCase' },
        { messageId: 'inapplicableCheck' },
      ],
    },
    {
      name: 'exact length matching the literal is pointless',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal('foo').check(z.length(3));
      `,
      errors: [{ messageId: 'pointlessCheck' }],
    },
    {
      name: 'exact length contradicting the literal is impossible',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal('foo').check(z.length(5));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'lowercase check on an already lowercase literal is pointless',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal('foo').check(z.lowercase());
      `,
      errors: [{ messageId: 'pointlessCheck' }],
    },
    {
      name: 'uppercase check on a lowercase literal is impossible',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal('foo').check(z.uppercase());
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'multipleOf satisfied by a number literal is pointless',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(10).check(z.multipleOf(5));
      `,
      errors: [{ messageId: 'pointlessCheck' }],
    },
    {
      name: 'multipleOf satisfied by a bigint literal is pointless',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(10n).check(z.multipleOf(5n));
      `,
      errors: [{ messageId: 'pointlessCheck' }],
    },
    {
      name: 'int check on an integer literal is pointless',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(5).check(z.int());
      `,
      errors: [{ messageId: 'pointlessCheck' }],
    },
    {
      name: 'int check on a fractional literal is impossible',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(5.5).check(z.int());
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'bigint literal outside a bound',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(10n).check(z.gt(20n));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'length check on a boolean literal does not apply',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(true).check(z.minLength(2));
      `,
      errors: [{ messageId: 'inapplicableCheck' }],
    },
    {
      name: 'exact length conflicting with a minimum',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.length(3), z.minLength(5));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'exact length conflicting with a maximum',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.length(3), z.maxLength(2));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'repeated equal exact lengths are redundant',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.length(3), z.length(3));
      `,
      errors: [{ messageId: 'redundantCheck' }],
    },
    {
      name: 'uppercase before lowercase is still reported',
      code: dedent`
        import * as z from 'zod/mini';
        z.string().check(z.uppercase(), z.lowercase());
      `,
      errors: [{ messageId: 'confusingCombination' }],
    },
    {
      name: 'minimum length above the maximum a format allows',
      code: dedent`
        import * as z from 'zod/mini';
        z.uuid().check(z.minLength(40));
      `,
      errors: [{ messageId: 'impossibleCase' }],
    },
    {
      name: 'inclusive lower bound equal to the literal is pointless',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(5).check(z.gte(5));
      `,
      errors: [{ messageId: 'pointlessCheck' }],
    },
    {
      name: 'inclusive upper bound equal to the literal is pointless',
      code: dedent`
        import * as z from 'zod/mini';
        z.literal(5).check(z.lte(5));
      `,
      errors: [{ messageId: 'pointlessCheck' }],
    },
  ],
});
