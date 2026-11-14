import { parseCode } from '@eslint-zod/tooling/vitest/parse-code';
import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

import type { SourceCode } from './rule-types.js';
import { LAST_CALL, track } from './spec-helpers.js';
import type { ZodSchemaImportTracker, ZodTrackerOptions } from './track-zod-schema-imports.js';
import { zodImportScope, zodMiniImportScope } from './zod-import-scope.js';
import type { ZodImportScope } from './zod-import-scope.js';

type Call = TSESTree.CallExpression;

/** The chain of the last call, and the tracker that walked it. */
function chainOf(code: string): {
  tracker: ZodSchemaImportTracker;
  call: Call;
  names: Array<string>;
} {
  const { tracker, find } = track(code);
  const call = find<Call>(LAST_CALL);
  return { tracker, call, names: tracker.collectZodChainMethods(call).map((item) => item.name) };
}

describe('createTracker', () => {
  it('each createTracker() call returns an independent instance', () => {
    const { tracker } = track("import * as z from 'zod';");
    expect(tracker.isZodNamespace('z')).toBe(true);
    expect(zodImportScope.createTracker({ kind: 'value' }).isZodNamespace('z')).toBe(false);
  });
});

describe('importDeclarationListener', () => {
  it.each([["import * as z from 'zod';"], ["import z from 'zod';"], ["import { z } from 'zod';"]])(
    'tracks a namespace: %s',
    (code) => {
      expect(track(code).tracker.isZodNamespace('z')).toBe(true);
    },
  );

  it('tracks named imports, aliased or not', () => {
    const { tracker } = track("import { string, number as zodNumber } from 'zod';");
    expect(tracker.getNamedImportOriginal('string')).toBe('string');
    expect(tracker.getNamedImportOriginal('zodNumber')).toBe('number');
    expect(tracker.getNamedImportLocal('number')).toBe('zodNumber');
  });

  it('falls back to the local name for a string-literal import name', () => {
    const { tracker } = track("import { 'string' as s } from 'zod';");
    expect(tracker.getNamedImportOriginal('s')).toBe('s');
  });

  it('ignores sources outside the scope', () => {
    expect(track("import * as _ from 'lodash';").tracker.isZodNamespace('_')).toBe(false);
    const mini = { scope: zodMiniImportScope };
    expect(track("import * as z from 'zod';", mini).tracker.isZodNamespace('z')).toBe(false);
    expect(track("import * as z from 'zod/mini';", mini).tracker.isZodNamespace('z')).toBe(true);
  });
});

describe('collectZodChainMethods', () => {
  it('collects a namespace chain with its nodes: z.number().min(1)', () => {
    const { tracker, find } = track("import * as z from 'zod'; z.number().min(1);");
    const min = find<Call>(LAST_CALL);
    const number = find<Call>('CallExpression[callee.property.name="number"]');

    expect(tracker.collectZodChainMethods(min)).toStrictEqual([
      { name: 'number', node: number, member: number.callee },
      { name: 'min', node: min, member: min.callee },
    ]);
  });

  it('collects a named chain, the factory without a member: string().optional()', () => {
    const { tracker, find } = track("import { string } from 'zod'; string().optional();");
    const optional = find<Call>(LAST_CALL);

    expect(
      tracker.collectZodChainMethods(optional).map((item) => [item.name, item.member]),
    ).toStrictEqual([
      ['string', null],
      ['optional', optional.callee],
    ]);
  });

  it.each([
    ["z['string']()"],
    // A partial `['transform', 'readonly']` would no longer start at the factory.
    ["z['string']().transform(f).readonly()"],
    ["z.string()['min'](1)"],
    ['z[factory]()'],
  ])('returns [] rather than a partial chain: %s', (expression) => {
    expect(chainOf(`import * as z from 'zod'; ${expression};`).names).toStrictEqual([]);
  });
});

describe('findZodChainedMethod', () => {
  function find(code: string, methodName: string | Array<string>): unknown {
    const { tracker, call } = chainOf(code);
    return tracker.findZodChainedMethod(call, tracker.detectZodSchemaRootNode(call)!, methodName);
  }

  it('returns null when the method is not chained: z.number().min(0)', () => {
    expect(find("import * as z from 'zod'; z.number().min(0);", 'finite')).toBeNull();
  });

  it('finds a chained method with its callee: z.number().min(0).finite()', () => {
    const { tracker, call } = chainOf("import * as z from 'zod'; z.number().min(0).finite();");
    expect(
      tracker.findZodChainedMethod(call, tracker.detectZodSchemaRootNode(call)!, 'finite'),
    ).toStrictEqual({
      name: 'finite',
      methods: tracker.collectZodChainMethods(call),
      index: 2,
      member: call.callee,
    });
  });

  it('takes the first chained of several names: z.number().safe().int()', () => {
    expect(
      find("import * as z from 'zod'; z.number().safe().int();", ['int', 'safe']),
    ).toMatchObject({ name: 'safe', index: 1 });
  });

  it('does not mistake an aliased factory for the method: finite().min(0)', () => {
    const code = "import { number as finite } from 'zod'; finite().min(0);";
    // The head carries the export name, not the local alias.
    expect(chainOf(code).names).toStrictEqual(['number', 'min']);
    expect(find(code, 'finite')).toBeNull();
  });

  it("matches without a callee when the chain is unnameable: z['number']().finite()", () => {
    expect(find("import * as z from 'zod'; z['number']().finite();", 'finite')).toStrictEqual({
      name: 'finite',
      methods: [],
      index: -1,
      member: null,
    });
  });
});

describe('createSchemaVisitor', () => {
  /** The schema types `onSchema` sees over `code`, with the given filter. */
  function visit(
    code: string,
    schemaType?: string | Array<string>,
    scope: ZodImportScope = zodImportScope,
  ): Array<string> {
    const { findAll } = parseCode(code);
    const seen: Array<string> = [];
    const visitor = scope.createTracker({ kind: 'value' }).createSchemaVisitor({
      schemaType,
      onSchema: (_node, meta) => {
        seen.push(meta.schemaType);
      },
    });
    for (const node of findAll('ImportDeclaration')) {
      visitor.ImportDeclaration?.(node as TSESTree.ImportDeclaration);
    }
    for (const node of findAll<Call>('CallExpression')) {
      visitor.CallExpression?.(node);
    }
    return seen;
  }

  const CODE = "import * as z from 'zod'; z.string(); z.boolean(); z.number(); lodash.map();";

  it('throws for localSchemas when the tracker was built without a sourceCode', () => {
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    expect(() => tracker.createSchemaVisitor({ localSchemas: true, onSchema: () => {} })).toThrow(
      /sourceCode/,
    );
  });

  it('wires the import listener itself and skips calls that are not zod schemas', () => {
    expect(visit(CODE)).toStrictEqual(['string', 'boolean', 'number']);
  });

  it('filters on one schemaType or a list', () => {
    expect(visit(CODE, 'string')).toStrictEqual(['string']);
    expect(visit(CODE, ['string', 'number'])).toStrictEqual(['string', 'number']);
  });

  it('respects the tracker scope: a zod/mini tracker ignores `zod` imports', () => {
    expect(visit(CODE, undefined, zodMiniImportScope)).toStrictEqual([]);
  });
});

describe('getZodImportBindings', () => {
  it('records each specifier with the declaration it came from', () => {
    const { tracker, program } = track("import z, { string as str } from 'zod';");
    const bindings = tracker.getZodImportBindings();

    expect(bindings.map(({ name, local }) => [name, local.name])).toStrictEqual([
      ['*', 'z'],
      ['string', 'str'],
    ]);
    expect(bindings.every((item) => item.declaration === program.body[0])).toBe(true);
  });

  it('records a named z import as a namespace binding', () => {
    const { tracker } = track("import { z } from 'zod';");
    expect(tracker.getZodImportBindings().map((item) => item.name)).toStrictEqual(['*']);
  });

  it('ignores sources outside the scope', () => {
    const { tracker } = track("import * as z from 'zod';", { scope: zodMiniImportScope });
    expect(tracker.getZodImportBindings()).toStrictEqual([]);
  });
});

describe('createTracker kind', () => {
  const MIXED = [
    "import { type output, string } from 'zod';",
    "import type { infer } from 'zod';",
    "import * as z from 'zod';",
  ].join('\n');

  function names(kind: ZodTrackerOptions['kind']): Array<string> {
    return track(MIXED, { kind })
      .tracker.getZodImportBindings()
      .map((item) => item.name);
  }

  it("kind 'value' skips type-only declarations and specifiers", () => {
    expect(names('value')).toStrictEqual(['string', '*']);
    expect(track(MIXED).tracker.getNamedImportOriginal('output')).toBeUndefined();
  });

  it("kind 'type' is the exact mirror", () => {
    expect(names('type')).toStrictEqual(['output', 'infer']);
    expect(track(MIXED, { kind: 'type' }).tracker.isZodNamespace('z')).toBe(false);
  });

  it("kind 'all' records both, for rules reading a type position", () => {
    expect(names('all')).toStrictEqual(['output', 'string', 'infer', '*']);
  });
});

describe('resolveZodImport', () => {
  it('throws when the tracker was built without a sourceCode', () => {
    const { find } = parseCode('z;');
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    expect(() => tracker.resolveZodImport(find('Identifier'))).toThrow(/sourceCode/);
  });

  it('returns null for a node that cannot name an import', () => {
    const { tracker, find } = track("import * as z from 'zod'; z();");
    expect(tracker.resolveZodImport(find(LAST_CALL))).toBeNull();
    expect(tracker.resolveZodExport(find(LAST_CALL))).toBeNull();
  });

  it('resolves an identifier bound once, by a zod import', () => {
    const { tracker, find } = track("import * as z from 'zod'; z;");
    expect(tracker.resolveZodImport(find('ExpressionStatement > Identifier'))).toMatchObject({
      name: '*',
      local: find('ImportNamespaceSpecifier > Identifier'),
    });
  });

  it('returns null when the binding is declared again', () => {
    const { tracker, find } = track("import * as z from 'zod'; function z() {} z;");
    expect(tracker.resolveZodImport(find('ExpressionStatement > Identifier'))).toBeNull();
  });
});

describe('resolveZodSchema', () => {
  /** Resolves each top-level expression statement after `code`'s declarations. */
  function resolveAll(code: string): Array<unknown> {
    const { tracker, findAll } = track(`import * as z from 'zod';\n${code}`);
    return findAll<TSESTree.ExpressionStatement>('Program > ExpressionStatement').map((item) =>
      tracker.resolveZodSchema(item.expression),
    );
  }

  it('throws when the tracker was built without a sourceCode', () => {
    const { find } = parseCode('z.string();');
    const tracker = zodImportScope.createTracker({ kind: 'value' });
    expect(() => tracker.resolveZodSchema(find(LAST_CALL))).toThrow(/sourceCode/);
  });

  it('resolves an import-rooted chain, outermost or not', () => {
    const { tracker, find } = track("import * as z from 'zod'; z.string().optional();");
    tracker.resolveZodSchema(find(LAST_CALL));
    expect(
      tracker.resolveZodSchema(find('CallExpression[callee.property.name="string"]')),
    ).toMatchObject({ schemaType: 'string', methods: ['string'] });
  });

  it('follows a const and appends the methods called on it', () => {
    expect(resolveAll('const base = z.string();\nbase.nullable().optional();')).toMatchObject([
      {
        schemaDecl: 'namespace',
        schemaType: 'string',
        methods: ['string', 'nullable', 'optional'],
      },
    ]);
  });

  it('reads a literal method key and unwraps TS assertions', () => {
    expect(
      resolveAll("const base = z.string();\n(base satisfies unknown)['optional']();"),
    ).toMatchObject([{ methods: ['string', 'optional'] }]);
  });

  it('returns null for a parse result, a helper call or a non-schema method', () => {
    const code = [
      'const parsed = z.string().parse(input);',
      'const base = z.string();',
      'z.string().parse(input);',
      'parsed.trim();',
      'z.prettifyError(error);',
      'base.safeParse(input);',
    ].join('\n');
    expect(resolveAll(code)).toStrictEqual([null, null, null, null]);
  });

  it('follows a let that is never reassigned', () => {
    expect(resolveAll('let base = z.string();\nbase;')).toMatchObject([{ schemaType: 'string' }]);
  });

  it('returns null for a binding it cannot settle, or a cycle', () => {
    const code = [
      'let mutable = z.string();',
      'mutable = z.number();',
      'let declared;',
      'const { destructured } = z.string();',
      'var redeclared = z.string();',
      'var redeclared = z.string();',
      'const self = self.optional();',
      'mutable; declared; destructured; redeclared; self; unknown;',
    ].join('\n');
    // `mutable = …` is an expression statement too, and is no schema.
    expect(resolveAll(code)).toStrictEqual(Array.from({ length: 7 }, () => null));
  });

  it('resolves each node once', () => {
    const { sourceCode, find } = parseCode(
      "import * as z from 'zod'; const base = z.string(); base;",
    );
    let calls = 0;
    const counting = Object.create(sourceCode, {
      getScope: {
        value: (node: never) => {
          calls += 1;
          return sourceCode.getScope(node);
        },
      },
    }) as SourceCode;
    const tracker = zodImportScope.createTracker({ kind: 'value', sourceCode: counting });
    tracker.importDeclarationListener(find('ImportDeclaration'));
    const identifier = find('ExpressionStatement > Identifier');

    tracker.resolveZodSchema(identifier);
    tracker.resolveZodSchema(identifier);
    expect(calls).toBe(1);
  });
});
