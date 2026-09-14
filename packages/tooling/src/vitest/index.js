// @ts-check
import { fileURLToPath } from 'node:url';

import { defineProject } from 'vitest/config';

/**
 * Plain JavaScript, not TypeScript: Vitest hands this entry to Node when it loads a
 * plugin's `vitest.config.ts`, and the test matrix includes Node 20, which cannot
 * strip types. `spec-helpers.ts` is a separate export for the same reason — this
 * file must not import it. The other tools only ever run on modern Node, so their
 * entries stay TypeScript.
 */

/** Setup files go through Vite, so this one may stay TypeScript. */
const RULE_TESTER_SETUP_FILE = fileURLToPath(new URL('./rule-tester-setup.ts', import.meta.url));

const SOURCE_CONDITIONS = ['@eslint-zod/source'];

/**
 * Vitest project config shared by the plugins: resolves workspace imports to their
 * TypeScript source and installs the `RuleTester` → Vitest adapter.
 *
 * @type {typeof import('./index.js').definePluginTestProject}
 */
export const definePluginTestProject = (name) =>
  defineProject({
    resolve: {
      conditions: SOURCE_CONDITIONS,
    },
    ssr: {
      resolve: {
        conditions: SOURCE_CONDITIONS,
      },
    },
    test: {
      name,
      setupFiles: [RULE_TESTER_SETUP_FILE],
      // Specs touch no global state, so one worker can serve every file.
      isolate: false,
    },
  });
