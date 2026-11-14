import { zodMiniImportScope } from '@eslint-zod/utils';
import {
  ZOD_OBJECT_METHODS,
  ZOD_OBJECT_PROPERTY_KEY_STYLES,
  buildConsistentObjectPropertyKeyStyleCreate,
} from '@eslint-zod/utils/rule-builders/consistent-object-property-key-style';

import { createZodMiniPluginRule } from '../meta.js';

export const consistentObjectPropertyKeyStyle = createZodMiniPluginRule({
  name: 'consistent-object-property-key-style',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent Zod Mini object property key style',
    },
    fixable: 'code',
    messages: {
      invalidStyle: 'Property key "{{name}}" should be {{style}}.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          style: {
            description: 'Decides which naming style to enforce for object property keys',
            type: 'string',
            enum: [...ZOD_OBJECT_PROPERTY_KEY_STYLES],
          },
          allow: {
            description: 'Decides which object schema creation methods are checked',
            type: 'array',
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
  defaultOptions: [
    {
      style: 'camelCase',
      allow: [...ZOD_OBJECT_METHODS],
    },
  ],
  create: buildConsistentObjectPropertyKeyStyleCreate(zodMiniImportScope),
});
