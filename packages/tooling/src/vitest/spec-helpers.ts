import fs from 'node:fs/promises';
import path from 'node:path';

import type { TSESLint } from '@typescript-eslint/utils';

/**
 * Minimal structural view of a plugin used by the data helpers.
 * Matches the `satisfies ESLint.Plugin as CompatiblePlugin` shape each
 * plugin's `index.ts` exports.
 */
export interface PluginLike {
  meta: { name: string; version: string };
  rules?: object;
  configs: Record<string, ConfigLike> & { recommended: ConfigLike };
}

interface ConfigLike {
  name?: string;
  rules?: object;
  plugins?: object;
}

function getRules(plugin: PluginLike): Record<string, TSESLint.RuleModule<string>> {
  return (plugin.rules ?? {}) as Record<string, TSESLint.RuleModule<string>>;
}

/** Returns the sorted rule names derived from the files inside `<srcDir>/rules`. */
export async function getRuleFileNames(srcDir: string): Promise<Array<string>> {
  const entries = await fs.readdir(path.join(srcDir, 'rules'), { withFileTypes: true });

  return entries
    .filter((item) => item.isFile() && !item.name.includes('.spec'))
    .map((item) => path.basename(item.name, '.ts'))
    .sort();
}

/** Returns the sorted rule names derived from the files inside `<srcDir>/../docs/rules`. */
export async function getDocFileNames(srcDir: string): Promise<Array<string>> {
  const entries = await fs.readdir(path.join(srcDir, '..', 'docs', 'rules'));

  return entries
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.basename(name, '.md'))
    .sort();
}

/** Returns the sorted names of the rules registered in the plugin's `rules` map. */
export function getRegisteredRuleNames(plugin: PluginLike): Array<string> {
  return Object.keys(getRules(plugin)).sort();
}

/** Returns the sorted names of the registered rules that are not deprecated. */
export function getNonDeprecatedRuleNames(plugin: PluginLike): Array<string> {
  return Object.entries(getRules(plugin))
    .filter(([, rule]) => !(rule.meta.deprecated ?? false))
    .map(([ruleName]) => ruleName)
    .sort();
}

/**
 * For each registered rule, returns its name together with the documentation
 * file name (without extension) referenced by its `meta.docs.url`.
 */
export function getRuleDocReferences(
  plugin: PluginLike,
): Array<{ ruleName: string; docFileName: string | undefined }> {
  return Object.entries(getRules(plugin)).map(([ruleName, rule]) => {
    const ruleDocsURL = rule.meta.docs?.url;
    const docFileName = ruleDocsURL?.split('/').pop();

    return {
      ruleName,
      docFileName: docFileName === undefined ? undefined : path.basename(docFileName, '.md'),
    };
  });
}

/**
 * For each entry of the given config, returns the config key together
 * with the registered rule it points to (`undefined` when it doesn't resolve).
 */
export function getConfigRuleEntries(
  plugin: PluginLike,
  configName: string,
): Array<{ configRuleName: string; rule: TSESLint.RuleModule<string> | undefined }> {
  const rules = getRules(plugin);

  return Object.keys(plugin.configs[configName].rules ?? {}).map((configRuleName) => ({
    configRuleName,
    rule: rules[configRuleName.slice(configRuleName.indexOf('/') + 1)],
  }));
}
