/*
 * Fails if a packaged bundle still carries Tailwind source syntax in a component's styles.
 *
 * Component styles travel inside the FESM bundle as plain strings that Angular injects verbatim at
 * runtime. Nothing downstream processes them: an `@apply` that reaches this far is an at-rule the
 * browser does not know, so it drops the rule and the component renders unstyled. No build fails,
 * no test fails, and Storybook is fine because Storybook compiles from source — the only place the
 * breakage exists is the artifact consumers install.
 *
 * That is exactly what shipped in library 3.2.1, framework 3.2.1 and shared 4.2.0. This is the
 * check that would have caught it.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Source-only syntax. Each has to be gone by the time it is packaged.
const FORBIDDEN = ['@apply', '@reference', '@tailwind ', '@screen', '@plugin', '@theme'];

const DIST = 'dist/libs';

// CI builds only the affected packages, so an absent dist means nothing was packaged on this run.
// That is not a failure; there is simply nothing to look at.
if (!existsSync(DIST)) {
  console.log(`${DIST} does not exist — nothing was packaged, nothing to check.`);
  process.exit(0);
}

let failed = false;

for (const pkg of readdirSync(DIST, { withFileTypes: true }).filter((e) => e.isDirectory())) {
  const fesm = join(DIST, pkg.name, 'fesm2022');
  if (!existsSync(fesm)) continue;

  for (const file of readdirSync(fesm).filter((f) => f.endsWith('.mjs'))) {
    const path = join(fesm, file);
    const text = readFileSync(path, 'utf8');

    for (const token of FORBIDDEN) {
      const count = text.split(token).length - 1;
      if (count > 0) {
        failed = true;
        console.error(`${path}: ${count} occurrence(s) of "${token.trim()}" survived packaging.`);
      }
    }
  }
}

if (failed) {
  console.error(
    '\nng-packagr resolves its PostCSS configuration from the library directory, so each library\n' +
      'needs its own .postcssrc.json — the one at the workspace root is not enough. Check that\n' +
      'libs/<package>/.postcssrc.json exists and names @tailwindcss/postcss.',
  );
  process.exit(1);
}

console.log('No Tailwind source syntax survived packaging.');
