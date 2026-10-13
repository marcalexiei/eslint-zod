import type { RuleContext, RuleListener, RuleMeta, RuleModule } from './rule-types.js';

/** What a rule passes to the function {@link createRuleCreator} returns. */
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
 * Builds a plugin's rule factory: each rule gets its docs URL from `getRuleURL`,
 * and `create` receives the user's options merged over `defaultOptions`.
 */
export function createRuleCreator(
  getRuleURL: (ruleName: string) => string,
): <TOptions extends ReadonlyArray<unknown>, TMessageIds extends string>(
  rule: Readonly<RuleDefinition<TOptions, TMessageIds>>,
) => RuleModule<TMessageIds, TOptions> {
  return function createRule({ name, meta, defaultOptions, create }) {
    return {
      name,
      meta: { ...meta, docs: { ...meta.docs, url: getRuleURL(name) } },
      defaultOptions,
      create: (context) => create(context, applyDefaultOptions(defaultOptions, context.options)),
    };
  };
}
