import type { UserConfig } from 'tsdown';
import { defineConfig } from 'tsdown';

/**
 * tsdown config shared by every published package: ESM-only, unbundled,
 * `src/index.ts` as the only entry unless the caller overrides it.
 * `target` is left unset — tsdown derives it from each package's `engines.node`.
 */
export function definePluginTsdownConfig(overrides?: UserConfig): UserConfig {
  return defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    outDir: 'dist',
    unbundle: true,
    ...overrides,
  });
}
