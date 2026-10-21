import type { KnipConfig } from 'knip';

export default {
  ignoreBinaries: [
    // ignore github actions matrix syntax to test different eslint versions
    /^eslint@/,
  ],
  workspaces: {
    'plugins/eslint-plugin-zod': {
      entry: ['.eslint-doc-generatorrc.ts'],
      // eslint is an optional peer dependency referenced only for `satisfies` type checks
      // in src/index.ts — it doesn't need to be a devDependency
      ignoreDependencies: ['eslint'],
    },
    'plugins/eslint-plugin-zod-mini': {
      entry: ['.eslint-doc-generatorrc.ts'],
      // eslint is an optional peer dependency referenced only for `satisfies` type checks
      // in src/index.ts — it doesn't need to be a devDependency
      ignoreDependencies: ['eslint'],
    },
    'plugins/eslint-plugin-zod-core': {
      entry: ['.eslint-doc-generatorrc.ts'],
      // eslint is an optional peer dependency referenced only for `satisfies` type checks
      // in src/index.ts — it doesn't need to be a devDependency
      ignoreDependencies: ['eslint'],
    },
    'packages/tooling': {},
    'packages/utils': {},
    'packages/zod-api': {},
  },
} satisfies KnipConfig;
