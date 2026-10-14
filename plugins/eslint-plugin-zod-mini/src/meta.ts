import { createPluginMeta } from '@eslint-zod/utils';

export const {
  name: PLUGIN_NAME,
  version: PLUGIN_VERSION,
  getRuleURL,
  createRule: createZodMiniPluginRule,
} = createPluginMeta(new URL('../package.json', import.meta.url));
