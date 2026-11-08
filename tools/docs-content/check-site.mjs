// Checks an assembled docs site before it is published.
//
//   node tools/docs-content/check-site.mjs <site-dir>
//
// The site is the prerendered docs app with Storybook copied into storybook/. Every page must
// exist, every link inside the site must lead to a file, and every link into Storybook must name
// a story that exists. Exits 1 and lists each problem otherwise.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const site = process.argv[2];
const BASE = '/ZLibraries/';
if (!site || !existsSync(join(site, 'index.html'))) {
  console.error('usage: node tools/docs-content/check-site.mjs <site-dir>');
  process.exit(2);
}

const problems = [];
const required = ['index.html', '404.html', 'pagefind/pagefind-ui.js', 'storybook/index.html', 'storybook/index.json'];
for (const file of required) if (!existsSync(join(site, file))) problems.push(`missing ${file}`);

const storyIds = existsSync(join(site, 'storybook/index.json'))
  ? new Set(Object.keys(JSON.parse(readFileSync(join(site, 'storybook/index.json'), 'utf8')).entries))
  : new Set();

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (name === 'storybook' && dir === site) continue; // Storybook checks its own links.
    if (statSync(path).isDirectory()) yield* htmlFiles(path);
    else if (name.endsWith('.html')) yield path;
  }
}

/** Resolves a site path ("guides/x", "api/library#Button") to a file, as GitHub Pages would. */
function resolves(path) {
  const clean = decodeURIComponent(path.split(/[?#]/)[0]).replace(/^\/+/, '');
  if (clean === '') return existsSync(join(site, 'index.html'));
  const target = join(site, clean);
  return (
    (existsSync(target) && statSync(target).isFile()) ||
    existsSync(join(target, 'index.html')) ||
    existsSync(`${target}.html`)
  );
}

let pages = 0;
let links = 0;
for (const file of htmlFiles(site)) {
  pages++;
  const page = relative(site, file).replace(/\\/g, '/');
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    let url = match[1].replace(/&amp;/g, '&');
    if (/^(mailto:|data:|javascript:)/.test(url) || url.startsWith('#')) continue;
    if (/^https?:\/\//.test(url)) {
      const own = 'https://ricardozambon.github.io/ZLibraries/';
      if (!url.startsWith(own)) continue;
      url = BASE + url.slice(own.length);
    }
    if (url.startsWith(BASE)) url = url.slice(BASE.length);
    else if (url.startsWith('/')) {
      problems.push(`${page}: absolute link ${url} ignores the /ZLibraries/ base`);
      continue;
    }
    links++;
    if (url.startsWith('storybook/')) {
      const story = /[?&]path=\/(?:docs|story)\/([^&#]+)/.exec(url);
      if (story && !storyIds.has(story[1])) problems.push(`${page}: Storybook link to unknown story ${story[1]}`);
      if (!story && !resolves(url)) problems.push(`${page}: broken link ${url}`);
      continue;
    }
    if (!resolves(url)) problems.push(`${page}: broken link ${url}`);
  }
}

if (pages < 10) problems.push(`only ${pages} pages were prerendered`);

if (problems.length) {
  console.error(`check-site: ${problems.length} problem(s)\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`check-site: ${pages} pages, ${links} internal links, ${storyIds.size} stories, all good`);
