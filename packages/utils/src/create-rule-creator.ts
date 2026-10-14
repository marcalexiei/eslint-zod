import { readFileSync } from 'node:fs';

import type { RuleContext, RuleListener, RuleMeta, RuleModule } from './rule-types.js';

/** What a rule passes to a {@link RuleCreator}. */
export interface RuleDefinition<
  TOptions extends ReadonlyArray<unknown>,
  TMessageIds extends string,
> {
  name: string;
  meta: RuleMeta<TMessageIds>;
  defaultOptions: Readonly<TOptions>;
  create: (
    context: Readonly<RuleContext<TMessageIds, TOptions>>,
    optionsWithDefault: Readonly<TOptions>,
  ) => RuleListener;
}

export type RuleCreator = <TOptions extends ReadonlyArray<unknown>, TMessageIds extends string>(
  rule: Readonly<RuleDefinition<TOptions, TMessageIds>>,
) => RuleModule<TMessageIds, TOptions>;

/** A plugin's identity and rule factory, as {@link createPluginMeta} reads them. */
export interface PluginMeta {
  name: string;
  version: string;
  getRuleURL: (ruleName: string) => string;
  createRule: RuleCreator;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeOption(defaults: unknown, user: unknown): unknown {
  if (!isPlainObject(defaults) || !isPlainObject(user)) {
    return user;
  }
  const merged = { ...defaults };
  for (const [key, value] of Object.entries(user)) {
    merged[key] = key in defaults ? mergeOption(defaults[key], value) : value;
  }
  return merged;
}

function applyDefaultOptions<TOptions extends ReadonlyArray<unknown>>(
  defaultOptions: Readonly<TOptions>,
  userOptions: ReadonlyArray<unknown>,
): TOptions {
  // options past the defaults' length are dropped, as the rule declares no slot for them
  return structuredClone(defaultOptions).map((option, index) =>
    userOptions[index] === undefined ? option : mergeOption(option, userOptions[index]),
  ) as unknown as TOptions;
}

/**
 * Builds a rule factory: each rule gets its docs URL from `getRuleURL`,
 * and `create` receives the user's options merged over `defaultOptions`.
 */
export function createRuleCreator(getRuleURL: (ruleName: string) => string): RuleCreator {
  return function createRule({ name, meta, defaultOptions, create }) {
    return {
      name,
      meta: { ...meta, docs: { ...meta.docs, url: getRuleURL(name) } },
      defaultOptions,
      create: (context) => create(context, applyDefaultOptions(defaultOptions, context.options)),
    };
  };
}

/**
 * Reads a plugin's name and version from its `package.json`, and builds its rule factory.
 * Rule docs are expected at `docs/rules/<rule-name>.md` under `repository.directory`.
 */
export function createPluginMeta(packageJSONURL: URL): PluginMeta {
  const { name, version, repository } = JSON.parse(readFileSync(packageJSONURL, 'utf8')) as {
    name: string;
    version: string;
    repository: { url: string; directory: string };
  };

  // e.g. https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/array-style.md
  const getRuleURL = (ruleName: string): string =>
    `${repository.url}/blob/HEAD/${repository.directory}/docs/rules/${ruleName}.md`;

  return { name, version, getRuleURL, createRule: createRuleCreator(getRuleURL) };
}
