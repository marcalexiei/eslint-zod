import { ZOD_STRING_FORMAT_METHODS, zodImportScope } from '@eslint-zod/utils';
import type { ZodStringFormatMethodName } from '@eslint-zod/utils';
import { buildPreferTopLevelFactoryCreate } from '@eslint-zod/utils/rule-patterns/prefer-top-level-factory';

import { createZodPluginRule } from '../meta.js';

const TOP_LEVEL_STRING_FORMATS_URL = 'https://zod.dev/v4?id=top-level-string-formats';

interface Options {
  ignore?: ReadonlyArray<ZodStringFormatMethodName>;
}

type MessageIds = 'preferTopLevelStringFormat';

const ZOD_STRING_FORMAT_METHOD_NAMES = ZOD_STRING_FORMAT_METHODS.map(
  ({ sourceMethodName }) => sourceMethodName,
);

export const preferTopLevelStringFormats = createZodPluginRule<[Options], MessageIds>({
  name: 'prefer-top-level-string-formats',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Prefer top-level string format schemas over deprecated `z.string().<format>()` methods',
      url: TOP_LEVEL_STRING_FORMATS_URL,
    },
    messages: {
      preferTopLevelStringFormat:
        'Use `z.{{replacementMethod}}()` instead of `z.string().{{sourceMethod}}()`.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            type: 'array',
            description: 'Top-level string format methods to ignore for this rule.',
            items: {
              type: 'string',
              enum: [...ZOD_STRING_FORMAT_METHOD_NAMES],
            },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [{ ignore = [] }]) {
    return buildPreferTopLevelFactoryCreate<MessageIds, [Options]>({
      scope: zodImportScope,
      factoryName: 'string',
      replacements: ZOD_STRING_FORMAT_METHODS,
      messageId: 'preferTopLevelStringFormat',
      ignore,
    })(context);
  },
});
