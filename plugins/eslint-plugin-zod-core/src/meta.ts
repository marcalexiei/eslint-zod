import { createPluginMeta } from '@eslint-zod/utils';

export const {
  name: PLUGIN_NAME,
  version: PLUGIN_VERSION,
  createRule: createZodPluginRule,
} = createPluginMeta(new URL('../package.json', import.meta.url));
