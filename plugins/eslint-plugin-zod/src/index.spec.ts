import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getConfigRuleEntries,
  getDocFileNames,
  getNonDeprecatedRuleNames,
  getRegisteredRuleNames,
  getRuleDocReferences,
  getRuleFileNames,
} from '@eslint-zod/tooling/vitest/spec-helpers';
import { Linter } from 'eslint';
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

const CONFIG_NAMES = ['recommended', 'strict', 'stylistic', 'all'] as const;

function getConfigRuleNames(configName: string): Array<string> {
  return getConfigRuleEntries(plugin, configName)
    .map((entry) => entry.configRuleName)
    .sort();
}

describe.each(CONFIG_NAMES)('%s config', (configName) => {
  it('has correct shape', () => {
    const config = plugin.configs[configName];
    expect(config).toBeTypeOf('object');
    expect(config.name).toBe(`eslint-plugin-zod/${configName}`);
    expect(config.plugins).toHaveProperty('zod');
    expect(config).toHaveProperty('files', ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}']);
    expect(config.rules).toBeTypeOf('object');
  });

  it('only references registered, non-deprecated rules', () => {
    for (const { configRuleName, rule } of getConfigRuleEntries(plugin, configName)) {
      expect(configRuleName).toMatch(/^zod\//);
      expect(rule, `rule \`${configRuleName}\` is not registered in the plugin`).toBeDefined();
      expect(
        rule?.meta.deprecated ?? false,
        `deprecated rule \`${configRuleName}\` must not be part of the ${configName} config`,
      ).toBe(false);
    }
  });
});

describe('config composition', () => {
  const recommended = getConfigRuleNames('recommended');
  const strict = getConfigRuleNames('strict');
  const stylistic = getConfigRuleNames('stylistic');
  const all = getConfigRuleNames('all');

  it('`strict` is a superset of `recommended`', () => {
    expect(strict).toEqual(expect.arrayContaining(recommended));
  });

  it('`strict` and `stylistic` do not overlap', () => {
    expect(strict.filter((ruleName) => stylistic.includes(ruleName))).toEqual([]);
  });

  it('`all` is a superset of `strict` and `stylistic`', () => {
    expect(all).toEqual(expect.arrayContaining([...strict, ...stylistic]));
  });

  it('only `all` carries the naming and overlapping rules', () => {
    expect(
      all.filter((ruleName) => !strict.includes(ruleName) && !stylistic.includes(ruleName)),
    ).toEqual(['zod/consistent-object-property-key-style', 'zod/consistent-object-schema-type']);
  });

  it('`all` contains every non-deprecated rule', () => {
    const nonDeprecated = getNonDeprecatedRuleNames(plugin).map((ruleName) => `zod/${ruleName}`);
    expect(all).toEqual(nonDeprecated);
  });

  it('has correct type shape', () => {
    expectTypeOf(plugin.configs).toHaveProperty('recommended').toBeObject();
    expectTypeOf(plugin.configs).toHaveProperty('strict').toBeObject();
    expectTypeOf(plugin.configs).toHaveProperty('stylistic').toBeObject();
    expectTypeOf(plugin.configs).toHaveProperty('all').toBeObject();

    // keys different from the declared configs should not be types
    expectTypeOf(plugin.configs).not.toMatchObjectType<{
      otherObject: object;
    }>();

    expect(1).toBe(1);
  });
});

describe('config usage', () => {
  it.each(['file.mts', 'file.cts'])('lints %s files', (filename) => {
    const messages = new Linter().verify(
      "import * as z from 'zod';\nexport const userSchema = z.any();\n",
      [plugin.configs.recommended],
      filename,
    );
    expect(messages.map((message) => message.ruleId)).toContain('zod/no-any-schema');
  });

  it('lets the exported plugin be registered again', () => {
    const messages = new Linter().verify(
      "import * as z from 'zod';\nexport const user = z.string();\n",
      [
        plugin.configs.recommended,
        {
          plugins: { zod: plugin },
          rules: { 'zod/consistent-schema-var-name': ['error', { after: '_schema' }] },
        },
      ],
      'file.js',
    );
    expect(
      messages
        .filter((message) => message.ruleId === 'zod/consistent-schema-var-name')
        .map((message) => message.message),
    ).toEqual(['Rename this Zod schema to "user_schema"']);
  });

  it('registers the plugin object that is exported', () => {
    for (const configName of CONFIG_NAMES) {
      expect(plugin.configs[configName].plugins?.zod).toBe(plugin);
    }
  });
});
