import type { InvalidTestCase } from '@typescript-eslint/rule-tester';
import type { TSESLint } from '@typescript-eslint/utils';

/** Which of the rule's messages a case asserts, and what to interpolate into them. */
export interface SuggestionCaseOptions<TMessageIds extends string> {
  /** The message the rule reports. */
  messageId: NoInfer<TMessageIds>;
  /** The message its suggestion carries. */
  suggestionMessageId: NoInfer<TMessageIds>;
  /** Asserted on both the report and the suggestion; one builder per payload. */
  data?: Readonly<Record<string, unknown>>;
}

/** Builders returned by {@link createSuggestionCases}. */
export interface SuggestionCaseBuilders<
  TMessageIds extends string,
  TOptions extends ReadonlyArray<unknown>,
> {
  /** A case whose single suggestion rewrites `code` into `output`. */
  suggest: (name: string, code: string, output: string) => InvalidTestCase<TMessageIds, TOptions>;
  /** A case the rule reports but offers no suggestion for. */
  report: (name: string, code: string) => InvalidTestCase<TMessageIds, TOptions>;
}

/**
 * Case builders for a rule whose invalid cases all report one messageId and
 * offer at most one suggestion, so each case is written as its code pair
 * instead of a dozen lines of RuleTester scaffolding.
 *
 * Both ids and the options tuple are inferred from `rule`, so a messageId the
 * rule does not declare — or the two ids swapped — is a type error.
 *
 * @example
 * ```ts
 * const { suggest, report } = createSuggestionCases(noAnySchema, {
 *   messageId: 'noZAny',
 *   suggestionMessageId: 'useUnknown',
 * });
 * // invalid: [suggest('namespace import', 'before', 'after')]
 * ```
 */
export function createSuggestionCases<
  TMessageIds extends string,
  TOptions extends ReadonlyArray<unknown>,
>(
  // only read for its types: both ids and the options tuple come from it
  rule: TSESLint.RuleModule<TMessageIds, TOptions>,
  { messageId, suggestionMessageId, data }: SuggestionCaseOptions<TMessageIds>,
): SuggestionCaseBuilders<TMessageIds, TOptions> {
  return {
    suggest: (name, code, output) => ({
      name,
      code,
      output: null,
      errors: [
        {
          messageId,
          data,
          suggestions: [{ messageId: suggestionMessageId, data, output }],
        },
      ],
    }),
    report: (name, code) => ({
      name,
      code,
      errors: [{ messageId, data, suggestions: [] }],
    }),
  };
}
