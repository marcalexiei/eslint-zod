import { zodMiniImportScope } from '@eslint-zod/utils';
import {
  ZOD_OBJECT_METHODS,
  buildConsistentObjectSchemaTypeCreate,
} from '@eslint-zod/utils/rule-builders/consistent-object-schema-type';

import { createZodMiniPluginRule } from '../meta.js';

export const consistentObjectSchemaType = createZodMiniPluginRule({
  name: 'consistent-object-schema-type',
  meta: {
    hasSuggestions: true,
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent usage of Zod Mini schema methods',
    },
    messages: {
      consistentMethod:
        "Inconsistent Zod Mini object schema method '{{actual}}'. Allowed: {{allowedList}}.",
      useMethod: "Replace with '{{expected}}'.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            description: 'Decides which object methods are allowed',
            items: {
              type: 'string',
              enum: [...ZOD_OBJECT_METHODS],
            },
            minItems: 1,
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ allow: ['object'] }],
  create: buildConsistentObjectSchemaTypeCreate(zodMiniImportScope),
});
