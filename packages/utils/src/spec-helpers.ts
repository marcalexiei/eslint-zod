import { parseCode } from '@eslint-zod/tooling/vitest/parse-code';
import type { ParsedCode } from '@eslint-zod/tooling/vitest/parse-code';
import type { TSESTree } from '@typescript-eslint/types';

import type { SourceCode } from './rule-types.js';
import type { ZodSchemaImportTracker, ZodTrackerOptions } from './track-zod-schema-imports.js';
import { zodImportScope } from './zod-import-scope.js';
import type { ZodImportScope } from './zod-import-scope.js';

/** The outermost call of the last expression statement. */
export const LAST_CALL = 'Program > ExpressionStatement:last-child > CallExpression';

/** The parsed code, with a tracker fed its imports. */
export function track(
  code: string,
  {
    scope = zodImportScope,
    kind = 'value',
  }: { scope?: ZodImportScope; kind?: ZodTrackerOptions['kind'] } = {},
): Omit<ParsedCode, 'sourceCode'> & { sourceCode: SourceCode; tracker: ZodSchemaImportTracker } {
  const parsed = parseCode(code);
  const sourceCode = parsed.sourceCode as unknown as SourceCode;
  const tracker = scope.createTracker({ kind, sourceCode });
  for (const declaration of parsed.findAll<TSESTree.ImportDeclaration>('ImportDeclaration')) {
    tracker.importDeclarationListener(declaration);
  }
  return { ...parsed, sourceCode, tracker };
}

/** `code`'s last call and its chain, with `z` imported from `scope`. */
export function trackChain(
  code: string,
  scope: ZodImportScope = zodImportScope,
): ReturnType<typeof track> & {
  call: TSESTree.CallExpression;
  methods: ReturnType<ZodSchemaImportTracker['collectZodChainMethods']>;
} {
  const imports = `import * as z from '${scope.sources[0]}';`;
  const parsed = track(`${imports}\n${code}`, { scope });
  const call = parsed.find<TSESTree.CallExpression>(LAST_CALL);
  return {
    ...parsed,
    call,
    methods: parsed.tracker.collectZodChainMethods(call),
    // Drops the import line from the output.
    applyFix: (build) => parsed.applyFix(build)?.slice(imports.length + 1) ?? null,
  };
}
