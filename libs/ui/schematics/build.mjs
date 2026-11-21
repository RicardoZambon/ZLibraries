// Builds the schematics into the packaged library. ng-packagr does not build them, so this runs
// after it: it compiles the TypeScript to CommonJS and copies the JSON the Angular CLI reads.
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDir = dirname(fileURLToPath(import.meta.url));
const outDir = join(sourceDir, '..', '..', '..', 'dist', 'libs', 'ui', 'schematics');

if (!existsSync(join(outDir, '..', 'package.json'))) {
  throw new Error('dist/libs/ui is missing. Build the package with ng-packagr first.');
}

const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');
execFileSync(process.execPath, [tsc, '-p', join(sourceDir, 'tsconfig.json')], { stdio: 'inherit' });

function copyJson(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      copyJson(path);
    } else if (entry.name.endsWith('.json') && entry.name !== 'tsconfig.json') {
      const target = join(outDir, relative(sourceDir, path));
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(path, target);
    }
  }
}
copyJson(sourceDir);

// The package itself is an ES module package; the CLI loads schematics with require().
writeFileSync(join(outDir, 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2) + '\n');

console.log(`Schematics built into ${relative(process.cwd(), outDir)}`);
