// Finishes a built docs site for GitHub Pages.
//
//   node tools/docs-content/postbuild.mjs dist/apps/docs/browser
//
// Pages serves 404.html for any unknown URL, so the prerendered 404 route is copied there. Then
// Pagefind indexes the prerendered HTML for the site's search.

import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const site = process.argv[2];
if (!site || !existsSync(join(site, 'index.html'))) {
  console.error('usage: node tools/docs-content/postbuild.mjs <built-site-dir>');
  process.exit(2);
}

const notFound = join(site, '404', 'index.html');
if (!existsSync(notFound)) {
  console.error(`postbuild: ${notFound} is missing; is the 404 route still prerendered?`);
  process.exit(1);
}
copyFileSync(notFound, join(site, '404.html'));

execSync(`npx --no-install pagefind --site "${site}"`, { stdio: 'inherit' });
console.log('postbuild: 404.html written, search index built');
