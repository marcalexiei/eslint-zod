import { ZOD_STRING_FORMAT_METHODS } from '@eslint-zod/utils';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';

import { preferTopLevelStringFormats } from './prefer-top-level-string-formats.js';

const ruleTester = new RuleTester();

const valid = ZOD_STRING_FORMAT_METHODS.flatMap(({ replacementMethodName, sourceMethodName }) => {
  const [namedImportSpecifier] = replacementMethodName.split('.');
  const namedImportExpression = `${replacementMethodName}()`;
  const replacementExpression = `z.${replacementMethodName}()`;

  return [
    {
      name: `${sourceMethodName}: namespace import`,
      code: dedent`
          import * as z from 'zod';
          ${replacementExpression};
        `,
    },
    {
      name: `${sourceMethodName}: named import`,
      code: dedent`
          import { ${namedImportSpecifier} } from 'zod';
          ${namedImportExpression};
        `,
    },
    {
      name: `${sourceMethodName}: named z import`,
      code: dedent`
          import { z } from 'zod';
          ${replacementExpression};
        `,
    },
    {
      name: `${sourceMethodName}: replacement with chain method`,
      code: dedent`
          import * as z from 'zod';
          ${replacementExpression}.optional();
        `,
    },
    {
      name: `${sourceMethodName}: ignored through options`,
      code: dedent`
          import * as z from 'zod';
          z.string().${sourceMethodName}();
        `,
      options: [{ ignore: [sourceMethodName] }] as const,
    },
  ];
});

const invalid = ZOD_STRING_FORMAT_METHODS.flatMap(({ replacementMethodName, sourceMethodName }) => {
  const replacementExpression = `z.${replacementMethodName}()`;

  return [
    {
      name: `${sourceMethodName}: namespace import`,
      code: dedent`
          import * as z from 'zod';
          z.string().${sourceMethodName}();
        `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }] as const,
      output: dedent`
          import * as z from 'zod';
          ${replacementExpression};
        `,
    },
    {
      name: `${sourceMethodName}: namespace import with params`,
      code: dedent`
          import * as z from 'zod';
          z.string().${sourceMethodName}('custom error');
        `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }] as const,
      output: dedent`
          import * as z from 'zod';
          ${replacementExpression.replace('()', `('custom error')`)};
        `,
    },
    {
      name: `${sourceMethodName}: named import`,
      code: dedent`
          import { string } from 'zod';
          string().${sourceMethodName}();
        `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }] as const,
      output: null,
    },
    {
      name: `${sourceMethodName}: named z import`,
      code: dedent`
          import { z } from 'zod';
          z.string().${sourceMethodName}();
        `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }] as const,
      output: dedent`
          import { z } from 'zod';
          ${replacementExpression};
        `,
    },
    {
      name: `${sourceMethodName}: method after optional`,
      code: dedent`
          import * as z from 'zod';
          z.string().optional().${sourceMethodName}();
        `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }] as const,
      output: dedent`
          import * as z from 'zod';
          ${replacementExpression}.optional();
        `,
    },
    {
      name: `${sourceMethodName}: not ignored when another method is ignored`,
      code: dedent`
          import * as z from 'zod';
          z.string().${sourceMethodName}();
        `,
      options: [{ ignore: ['email'] }] as const,
      errors: [{ messageId: 'preferTopLevelStringFormat' }] as const,
      output: dedent`
          import * as z from 'zod';
          ${replacementExpression};
        `,
    },
  ];
}).filter(({ options, name }) => {
  if (!options) {
    return true;
  }

  return !name.startsWith('email:');
});

ruleTester.run(preferTopLevelStringFormats.name, preferTopLevelStringFormats, {
  valid: [
    ...valid,
    {
      name: 'string without supported format method',
      code: dedent`
        import * as z from 'zod';
        z.string().optional();
      `,
    },
    {
      name: 'unrelated to zod',
      code: 'something.string().email()',
    },
  ],
  invalid: [
    ...invalid,
    {
      name: 'unwrap() before the format — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.string().optional().unwrap().email();
      `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }],
      output: null,
    },
    {
      name: 'apply() before the format — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.string().apply((schema) => schema).email();
      `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }],
      output: null,
    },
    {
      name: 'computed factory — reported but not fixed, the chain walker cannot name it',
      code: dedent`
        import * as z from 'zod';
        z['string']().email();
      `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }] as const,
      output: null,
    },
    {
      name: 'parenthesized receiver — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        (z.string()).email();
      `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }],
      output: null,
    },
    {
      name: 'mutating method before the format — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.string().trim().email();
      `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }] as const,
      output: null,
    },
    {
      name: 'factory called with params — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.string({ error: 'Required' }).email();
      `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }] as const,
      output: null,
    },
    {
      name: 'comment in the rewritten text — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.string()
          // must be an email
          .email();
      `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }],
      output: null,
    },
    {
      name: 'string factory aliased on import — reported like any named import, without a fix',
      code: dedent`
        import { string as str } from 'zod';
        str().email();
      `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }] as const,
      output: null,
    },
    {
      name: 'two deprecated formats in one chain — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.string().guid().uuid();
      `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }],
      output: null,
    },
    {
      name: 'format after a check callback that may rewrite the value — reported without a fix',
      code: dedent`
        import * as z from 'zod';
        z.string().check((ctx) => { ctx.value = ctx.value.trim(); }).email();
      `,
      errors: [{ messageId: 'preferTopLevelStringFormat' }],
      output: null,
    },
  ],
});
