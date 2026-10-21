// Fails when a published declaration leaks a `@eslint-zod/tooling` type (see AGENTS.md).
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

const DIST_DIRS = [
  'packages/utils/dist',
  'plugins/eslint-plugin-zod/dist',
  'plugins/eslint-plugin-zod-mini/dist',
  'plugins/eslint-plugin-zod-core/dist',
];

/** The module a node imports from, if it is an import, a re-export or an `import("…")` type. */
function getModuleSpecifier(node) {
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
    return node.moduleSpecifier?.text;
  }
  if (ts.isImportTypeNode(node)) {
    return node.argument.literal?.text;
  }
  return undefined;
}

/** Every leak in one declaration file, as `path:line: message`. */
function findLeaks(filePath) {
  const source = ts.createSourceFile(
    filePath,
    readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
  );
  const leaks = [];

  const report = (node, message) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    leaks.push(`${filePath}:${line + 1}: ${message}`);
  };

  const visit = (node) => {
    // A leaked type the build could not resolve is written out as `any`.
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      report(node, '`any` type');
    }
    const moduleSpecifier = getModuleSpecifier(node);
    if (moduleSpecifier?.includes('tooling')) {
      report(node, `imports from ${moduleSpecifier}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  return leaks;
}

const leaks = DIST_DIRS.flatMap((dir) =>
  readdirSync(dir, { recursive: true })
    .filter((file) => file.endsWith('.d.mts'))
    .flatMap((file) => findLeaks(path.join(dir, file))),
);

if (leaks.length > 0) {
  process.stderr.write(`Published declarations leak a tooling type:\n${leaks.join('\n')}\n`);
  process.exitCode = 1;
}
