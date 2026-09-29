import prettierConfig from '@marcalexiei/prettier-config';
import type { GenerateOptions } from 'eslint-doc-generator';
import * as prettier from 'prettier';

/**
 * `eslint-doc-generator` config shared by the plugins.
 * The generator does not traverse past `package.json` boundaries, so each plugin re-exports this.
 */
export const eslintDocGeneratorConfig = {
  // Every non-deprecated rule is in `all`, so marking it per rule adds nothing.
  ignoreConfig: ['all'],
  postprocess: (content): Promise<string> => {
    const config: prettier.Config = { parser: 'markdown', ...prettierConfig };
    return prettier.format(content, config);
  },
} satisfies GenerateOptions;
