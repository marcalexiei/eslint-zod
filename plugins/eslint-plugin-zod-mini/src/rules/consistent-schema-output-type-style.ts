import { zodMiniImportScope } from '@eslint-zod/utils';
import {
  ZOD_SCHEMA_TYPE_STYLES,
  buildConsistentSchemaOutputTypeStyleCreate,
} from '@eslint-zod/utils/rule-builders/consistent-schema-output-type-style';

import { createZodMiniPluginRule } from '../meta.js';

export const consistentSchemaOutputTypeStyle = createZodMiniPluginRule({
  name: 'consistent-schema-output-type-style',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Enforce consistent use of z.infer or z.output for schema type inference',
    },
    messages: {
      useInfer: 'Use infer instead of output.',
      useOutput: 'Use output instead of infer.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          style: {
            description: 'Decides which style to use for schema type inference',
            type: 'string',
            enum: [...ZOD_SCHEMA_TYPE_STYLES],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ style: 'output' }],
  create: buildConsistentSchemaOutputTypeStyleCreate(zodMiniImportScope),
});
