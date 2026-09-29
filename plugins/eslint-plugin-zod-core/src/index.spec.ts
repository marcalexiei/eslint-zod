import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getConfigRuleEntries,
  getDocFileNames,
  getRegisteredRuleNames,
  getRuleDocReferences,
  getRuleFileNames,
} from '@eslint-zod/tooling/vitest/spec-helpers';
import { describe, expect, expectTypeOf, it } from 'vitest';

import plugin from './index.js';

describe('plugin export', async () => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));

  const ruleFileNames = await getRuleFileNames(dirname);

  it('should include all meta', () => {
    expect(plugin.meta.name).toBeTypeOf('string');
    expect(plugin.meta.version).toBeTypeOf('string');
  });

  it('should register exactly the rules created inside `src/rules` folder', () => {
    expect(getRegisteredRuleNames(plugin)).toEqual(ruleFileNames);
  });

  /**
   * @see https://github.com/marcalexiei/eslint-zod/pull/99
   * @see https://github.com/marcalexiei/eslint-zod/pull/102
   */
  it('all rules must have a documentation file matching their name', () => {
    for (const { ruleName, docFileName } of getRuleDocReferences(plugin)) {
      expect(docFileName).toBe(ruleName);
    }
  });

  it('every file inside `docs/rules` must match a registered rule', async () => {
    await expect(getDocFileNames(dirname)).resolves.toEqual(ruleFileNames);
  });
});

describe('recommended config', () => {
  it('has correct shape', () => {
    const recommendedConfig = plugin.configs.recommended;
    expect(recommendedConfig).toBeTypeOf('object');
    expect(recommendedConfig.name).toBe('eslint-plugin-zod-core/recommended');
    expect(recommendedConfig.plugins).toHaveProperty('zod-core');
    expect(recommendedConfig.rules).toBeTypeOf('object');
  });

  it('only references registered, non-deprecated rules', () => {
    for (const { configRuleName, rule } of getConfigRuleEntries(plugin, 'recommended')) {
      expect(configRuleName).toMatch(/^zod-core\//);
      expect(rule, `rule \`${configRuleName}\` is not registered in the plugin`).toBeDefined();
      expect(
        rule?.meta.deprecated ?? false,
        `deprecated rule \`${configRuleName}\` must not be part of the recommended config`,
      ).toBe(false);
    }
  });

  it('has correct type shape', () => {
    expectTypeOf(plugin.configs).toHaveProperty('recommended').toBeObject();

    // keys different from recommended should not be types
    expectTypeOf(plugin.configs).not.toMatchObjectType<{
      otherObject: object;
    }>();

    expect(1).toBe(1);
  });
});
