import { zodMiniImportScope } from '@eslint-zod/utils';
import { buildNoDuplicateUnionMembersCreate } from '@eslint-zod/utils/rule-builders/no-duplicate-union-members';

import { createZodMiniPluginRule } from '../meta.js';

export const noDuplicateUnionMembers = createZodMiniPluginRule({
  name: 'no-duplicate-union-members',
  meta: {
    fixable: 'code',
    hasSuggestions: true,
    type: 'problem',
    docs: {
      description:
        'Disallow repeated members in `z.union()`, `z.discriminatedUnion()`, `z.enum()` and `z.literal()`',
    },
    messages: {
      duplicateMember: 'Duplicate member: it repeats the one on line {{line}}.',
      duplicateDiscriminatedUnionMember:
        'Duplicate member: it repeats the one on line {{line}}, and the schema throws when it parses.',
      removeDuplicate: 'Remove the duplicate member.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: buildNoDuplicateUnionMembersCreate(zodMiniImportScope),
});
