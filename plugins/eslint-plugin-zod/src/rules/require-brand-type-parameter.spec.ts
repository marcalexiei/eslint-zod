import { createSuggestionCases } from '@eslint-zod/tooling/vitest/rule-tester-cases';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { requireBrandTypeParameter } from './require-brand-type-parameter.js';

const { suggest } = createSuggestionCases(requireBrandTypeParameter, {
  messageId: 'missingTypeParameter',
  suggestionMessageId: 'removeBrandFunction',
});

const ruleTester = new RuleTester();

ruleTester.run(requireBrandTypeParameter.name, requireBrandTypeParameter, {
  valid: [
    {
      name: 'namespace',
      code: dedent`
        import * as z from 'zod'
        z.string().min(1).brand<"aaa">();
      `,
    },
    {
      name: 'named import',
      code: dedent`
        import { string } from 'zod'
        string().min(1).brand<"aaa">();
      `,
    },
    {
      name: 'named z import',
      code: dedent`
        import { z } from 'zod'
        z.string().min(1).brand<"aaa">();
      `,
    },
    {
      name: 'no error on other brand function',
      code: dedent`
        import * as z from 'zod'
        another.brand();
      `,
    },
    {
      // this would issue a typescript error eventually
      name: 'brand with multiple type parameters',
      code: dedent`
        import * as z from 'zod'
        z.string().brand<"id", "unique">();
      `,
    },
    {
      name: 'complex chain with brand',
      code: dedent`
        import * as z from 'zod'
        z.string().min(1).max(10).email().brand<"email">();
      `,
    },
    {
      name: 'brand with complex type parameter',

      code: dedent`
        import * as z from 'zod'
        z.string().brand<\`$\{string}Id\`>();
      `,
    },
  ],

  invalid: [
    suggest(
      'namespace import',
      dedent`
        import * as z from 'zod';
        z.string().min(1).brand();
      `,
      dedent`
                import * as z from 'zod';
                z.string().min(1);
              `,
    ),
    suggest(
      'named import',
      dedent`
        import { string } from 'zod';
        string().min(1).brand();
      `,
      dedent`
                import { string } from 'zod';
                string().min(1);
              `,
    ),
    suggest(
      'named z import',
      dedent`
        import { z } from 'zod';
        z.string().min(1).brand();
      `,
      dedent`
                import { z } from 'zod';
                z.string().min(1);
              `,
    ),
    suggest(
      'brand without type parameter in complex chain',
      dedent`
        import * as z from 'zod';
        z.string().min(1).max(10).email().brand()
      `,
      dedent`
                import * as z from 'zod';
                z.string().min(1).max(10).email()
              `,
    ),
    suggest(
      'brand without type parameter not as last method (namespace import)',
      dedent`
        import * as z from 'zod';
        z.string().min(1).brand().max(2)
      `,
      dedent`
                import * as z from 'zod';
                z.string().min(1).max(2)
              `,
    ),
    suggest(
      'brand without type parameter not as last method (named import)',
      dedent`
        import { string } from 'zod';
        string().min(1).brand().max(2)
      `,
      dedent`
                import { string } from 'zod';
                string().min(1).max(2)
              `,
    ),
    suggest(
      'brand without type parameter not as last method (named z import)',
      dedent`
        import { z } from 'zod';
        z.string().min(1).brand().max(2)
      `,
      dedent`
                import { z } from 'zod';
                z.string().min(1).max(2)
              `,
    ),
  ],
});
