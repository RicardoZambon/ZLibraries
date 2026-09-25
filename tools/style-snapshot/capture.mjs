// Captures a deterministic snapshot of the computed styles every story renders.
//
// The Tailwind 4 migration changes CSS and nothing else; the repository's own guide says the
// result is visual and that no test asserts on computed styles, so a broken upgrade passes CI.
// This is that assertion: run it against the built Storybooks before the migration and after, and
// diff the two JSON files.
//
//   node tools/style-snapshot/capture.mjs <storybook-dist-dir> <out.json> [port]
//
// STYLE_SNAPSHOT_CHANNEL picks an installed browser (`msedge`, `chrome`) over the one Playwright
// downloads, for a machine that cannot reach its CDN. Either is fine: a snapshot is only ever
// compared with another taken the same way, so what matters is that both runs use one engine.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { writeFileSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const [, , distDir, outFile, portArg] = process.argv;
const port = Number(portArg ?? 6199);

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

const server = createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = resolve(join(distDir, urlPath));
  if (!filePath.startsWith(resolve(distDir))) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
  if (!existsSync(filePath)) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(filePath)] ?? 'application/octet-stream' });
  res.end(readFileSync(filePath));
});

// The properties a restyle actually moves. Layout and box metrics catch a renamed spacing or
// radius utility; colour and shadow catch a changed palette or default; filter catches `blur`.
const PROPS = [
  'display',
  'position',
  'visibility',
  'opacity',
  'z-index',
  'color',
  'background-color',
  'background-image',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-top-style',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'box-shadow',
  'outline-width',
  'outline-style',
  'outline-color',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'flex-direction',
  'justify-content',
  'align-items',
  'gap',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'grid-template-columns',
  'overflow-x',
  'overflow-y',
  'filter',
  'backdrop-filter',
  'transform',
  'cursor',
  'pointer-events',
  'animation-name',
  'animation-iteration-count',
];

const run = async () => {
  await new Promise((r) => server.listen(port, r));
  const index = JSON.parse(readFileSync(join(distDir, 'index.json'), 'utf8'));
  const ids = Object.keys(index.entries).sort();

  const channel = process.env.STYLE_SNAPSHOT_CHANNEL;
  const browser = await chromium.launch(channel ? { channel } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Animations make a snapshot non-deterministic; a spinner mid-rotation is not a regression.
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent =
      '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;' +
      'transition-duration:0s!important;transition-delay:0s!important;}';
    document.documentElement.appendChild(style);
  });

  const snapshot = {};
  for (const id of ids) {
    await page.goto(`http://localhost:${port}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(350);

    snapshot[id] = await page.evaluate((props) => {
      const root = document.querySelector('#storybook-root') ?? document.body;
      const out = [];
      // A stable address for each element: its index path from the story root, plus its tag. Class
      // names are deliberately not part of the key -- a utility rename would change the key and
      // hide the very difference this is looking for.
      const walk = (el, path) => {
        const cs = getComputedStyle(el);
        const styles = {};
        for (const p of props) styles[p] = cs.getPropertyValue(p);
        // A spinner is mid-rotation at an arbitrary angle, so its matrix differs between two runs
        // of the same build. Whether it animates is the signal; the angle is noise.
        if (styles['animation-name'] !== 'none' && styles.transform.startsWith('matrix')) {
          styles.transform = '<animated>';
        }
        out.push({ path, tag: el.tagName.toLowerCase(), styles });
        [...el.children].forEach((child, i) => walk(child, `${path}/${i}`));
      };
      [...root.children].forEach((child, i) => walk(child, String(i)));
      return out;
    }, PROPS);
  }

  await browser.close();
  server.close();
  writeFileSync(outFile, JSON.stringify(snapshot, null, 1));
  const elements = Object.values(snapshot).reduce((n, s) => n + s.length, 0);
  console.log(`captured ${ids.length} stories, ${elements} elements -> ${outFile}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
