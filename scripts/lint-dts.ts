// Fails when a published declaration leaks a `zod-api` type (see AGENTS.md).
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

const DIST_DIRS = [
  'packages/utils/dist',
  'plugins/eslint-plugin-zod/dist',
  'plugins/eslint-plugin-zod-mini/dist',
  'plugins/eslint-plugin-zod-core/dist',
];

/** An import naming `zod-api`, or the `any` a leaked type becomes when the build cannot resolve it. */
function hasLeak(text: string): boolean {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, text);
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    if (token === ts.SyntaxKind.AnyKeyword) {
      return true;
    }
    if (token === ts.SyntaxKind.StringLiteral && scanner.getTokenValue().includes('zod-api')) {
      return true;
    }
  }
  return false;
}

const leakingFiles = DIST_DIRS.flatMap((dir) =>
  readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.d.mts'))
    .map((file) => path.join(dir, file))
    .filter((file) => hasLeak(readFileSync(file, 'utf8'))),
);

if (leakingFiles.length > 0) {
  process.stderr.write(`Published declarations leak a zod-api type:\n${leakingFiles.join('\n')}\n`);
  process.exitCode = 1;
}
