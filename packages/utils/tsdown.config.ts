import { definePluginTsdownConfig } from '@eslint-zod/tooling/tsdown';

export default definePluginTsdownConfig({
  // `!` excludes specs: the glob would otherwise publish them and vitest would
  // then collect the built copies alongside the sources.
  entry: [
    'src/index.ts',
    'src/rule-types.ts',
    'src/rule-builders/*.ts',
    'src/rule-patterns/*.ts',
    '!src/**/*.spec.ts',
  ],
});
