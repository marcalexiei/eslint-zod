import type { TSESTree } from '@typescript-eslint/types';

/**
 * The slice of the linter's rule API this package reads, declared structurally
 * so that no linter has to be installed for the types to resolve.
 * ESLint's and typescript-eslint's own objects are assignable to every type here.
 */

type NodeOrToken = TSESTree.Node | TSESTree.Token;

export interface RuleFix {
  range: Readonly<TSESTree.Range>;
  text: string;
}

export interface RuleFixer {
  insertTextAfter: (nodeOrToken: NodeOrToken, text: string) => RuleFix;
  insertTextAfterRange: (range: Readonly<TSESTree.Range>, text: string) => RuleFix;
  insertTextBefore: (nodeOrToken: NodeOrToken, text: string) => RuleFix;
  insertTextBeforeRange: (range: Readonly<TSESTree.Range>, text: string) => RuleFix;
  remove: (nodeOrToken: NodeOrToken) => RuleFix;
  removeRange: (range: Readonly<TSESTree.Range>) => RuleFix;
  replaceText: (nodeOrToken: NodeOrToken, text: string) => RuleFix;
  replaceTextRange: (range: Readonly<TSESTree.Range>, text: string) => RuleFix;
}

export type ReportFixFunction = (
  fixer: RuleFixer,
) => IterableIterator<RuleFix> | ReadonlyArray<RuleFix> | RuleFix | null;

export interface SuggestionReportDescriptor<TMessageIds extends string> {
  readonly messageId: TMessageIds;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly fix: ReportFixFunction;
}

export type ReportSuggestionArray<TMessageIds extends string> = Array<
  SuggestionReportDescriptor<TMessageIds>
>;

type ReportLocation = Readonly<TSESTree.Position> | Readonly<TSESTree.SourceLocation>;

export type ReportDescriptor<TMessageIds extends string> = {
  readonly messageId: TMessageIds;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly fix?: ReportFixFunction | null;
  readonly suggest?: Readonly<ReportSuggestionArray<TMessageIds>> | null;
} & (
  { readonly node: NodeOrToken; readonly loc?: ReportLocation } | { readonly loc: ReportLocation }
);

interface ScopeDefinitionOf<TType extends string, TNode, TParent> {
  readonly type: TType;
  readonly name: TSESTree.Node;
  readonly node: TNode;
  readonly parent: TParent;
}

/** Only the definition kinds the rules tell apart are narrowed; the rest share one member. */
export type ScopeDefinition =
  | ScopeDefinitionOf<
      'ImportBinding',
      | TSESTree.ImportDefaultSpecifier
      | TSESTree.ImportNamespaceSpecifier
      | TSESTree.ImportSpecifier
      | TSESTree.TSImportEqualsDeclaration,
      TSESTree.ImportDeclaration | TSESTree.TSImportEqualsDeclaration
    >
  | ScopeDefinitionOf<'Variable', TSESTree.VariableDeclarator, TSESTree.VariableDeclaration>
  | ScopeDefinitionOf<
      'FunctionName',
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression
      | TSESTree.TSDeclareFunction
      | TSESTree.TSEmptyBodyFunctionExpression,
      null
    >
  | ScopeDefinitionOf<
      | 'CatchClause'
      | 'ClassName'
      | 'ImplicitGlobalVariable'
      | 'Parameter'
      | 'TSEnumMemberName'
      | 'TSEnumName'
      | 'TSModuleName'
      | 'Type',
      TSESTree.Node,
      TSESTree.Node | null
    >;

export interface ScopeReference {
  readonly identifier: TSESTree.Identifier | TSESTree.JSXIdentifier;
  /** Set on a write that initializes the variable (`const a = 1`). */
  readonly init?: boolean;
  isRead: () => boolean;
  isWrite: () => boolean;
}

export interface ScopeVariable {
  readonly name: string;
  readonly defs: ReadonlyArray<ScopeDefinition>;
  readonly references: ReadonlyArray<ScopeReference>;
}

export interface Scope {
  readonly set: ReadonlyMap<string, ScopeVariable>;
  readonly upper: Scope | null;
}

export interface TokenSearchOptions {
  filter?: (token: TSESTree.Token) => boolean;
  includeComments?: boolean;
  skip?: number;
}

export interface SourceCode {
  getAllComments: () => Array<TSESTree.Comment>;
  getCommentsInside: (node: TSESTree.Node) => Array<TSESTree.Comment>;
  getDeclaredVariables: (node: TSESTree.Node) => ReadonlyArray<ScopeVariable>;
  getScope: (node: TSESTree.Node) => Scope;
  getText: (node?: NodeOrToken, beforeCount?: number, afterCount?: number) => string;
  getTokenAfter: (nodeOrToken: NodeOrToken, options?: TokenSearchOptions) => TSESTree.Token | null;
  getTokenBefore: (nodeOrToken: NodeOrToken, options?: TokenSearchOptions) => TSESTree.Token | null;
}

export interface RuleContext<
  TMessageIds extends string,
  TOptions extends ReadonlyArray<unknown> = [],
> {
  readonly options: TOptions;
  readonly sourceCode: Readonly<SourceCode>;
  report: (descriptor: ReportDescriptor<TMessageIds>) => void;
}

type RuleFunction<TNode = never> = (node: TNode) => void;

type RuleListenerEnterSelectors = {
  [TNode in TSESTree.Node as `${TNode['type']}`]?: RuleFunction<TNode>;
};

type RuleListenerExitSelectors = {
  [TNode in TSESTree.Node as `${TNode['type']}:exit`]?: RuleFunction<TNode>;
};

/** Node listeners by type, `:exit` variants, and any other selector as a catch-all. */
export type RuleListener = RuleListenerEnterSelectors &
  RuleListenerExitSelectors &
  Record<string, RuleFunction | undefined>;

export interface RuleMeta<TMessageIds extends string> {
  type: 'layout' | 'problem' | 'suggestion';
  docs: { description: string; url?: string };
  messages: Record<TMessageIds, string>;
  /** JSON Schema of the options; left loose, as the linter validates it when the rule loads. */
  schema: object | ReadonlyArray<object>;
  fixable?: 'code' | 'whitespace';
  hasSuggestions?: boolean;
  deprecated?: boolean | object;
}

export interface RuleModule<
  TMessageIds extends string,
  TOptions extends ReadonlyArray<unknown> = [],
> {
  name: string;
  meta: RuleMeta<TMessageIds>;
  defaultOptions: TOptions;
  create: (context: Readonly<RuleContext<TMessageIds, TOptions>>) => RuleListener;
}
