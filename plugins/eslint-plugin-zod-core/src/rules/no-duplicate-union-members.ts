import { zodCoreImportScope } from '@eslint-zod/utils';
import { buildNoDuplicateUnionMembersCreate } from '@eslint-zod/utils/rule-builders/no-duplicate-union-members';

import { createZodPluginRule } from '../meta.js';

export const noDuplicateUnionMembers = createZodPluginRule({
  name: 'no-duplicate-union-members',
  meta: {
    fixable: 'code',
    hasSuggestions: true,
    type: 'problem',
    docs: {
      description:
        'Disallow repeated members in `core._union()`, `core._discriminatedUnion()`, `core._enum()` and `core._literal()`',
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
  create: buildNoDuplicateUnionMembersCreate(zodCoreImportScope),
});
