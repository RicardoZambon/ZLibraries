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
const FORBIDDEN = ['@apply', '@reference', '@tailwind ', '@screen', '@plugin', '@theme', '@custom-variant', '@utility'];

const DIST = 'dist/libs';

// CI builds only the affected packages, so an absent dist means nothing was packaged on this run.
// That is not a failure; there is simply nothing to look at.
if (!existsSync(DIST)) {
  console.log(`${DIST} does not exist — nothing was packaged, nothing to check.`);
  process.exit(0);
}

/**
 * The component styles in a bundle, as the strings Angular injects at runtime.
 *
 * Only these are the subject. ng-packagr keeps source comments, and a comment that writes about
 * `@apply` is prose, not a stylesheet -- scanning the whole file reports it and the check stops
 * meaning anything. Walks each `styles: [` array to its closing bracket, tracking string literals,
 * because CSS contains both brackets and quotes.
 */
function styleBlocks(text) {
  const blocks = [];
  const opener = /styles:\s*\[/g;
  let match;

  while ((match = opener.exec(text))) {
    let depth = 1;
    let quote = null;
    let i = opener.lastIndex;

    for (; i < text.length && depth > 0; i++) {
      const c = text[i];

      if (quote) {
        if (c === '\\') i++;
        else if (c === quote) quote = null;
        continue;
      }

      if (c === '"' || c === "'" || c === '`') quote = c;
      else if (c === '[') depth++;
      else if (c === ']') depth--;
    }

    blocks.push(text.slice(opener.lastIndex, i - 1));
    opener.lastIndex = i;
  }

  return blocks.join('\n');
}

let failed = false;

for (const pkg of readdirSync(DIST, { withFileTypes: true }).filter((e) => e.isDirectory())) {
  const fesm = join(DIST, pkg.name, 'fesm2022');
  if (!existsSync(fesm)) continue;

  for (const file of readdirSync(fesm).filter((f) => f.endsWith('.mjs'))) {
    const path = join(fesm, file);
    const styles = styleBlocks(readFileSync(path, 'utf8'));

    for (const token of FORBIDDEN) {
      const count = styles.split(token).length - 1;
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
