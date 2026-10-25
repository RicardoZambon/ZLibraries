// Fails when something is unreachable on a phone.
//
// The small-screen work has one acceptance rule, and this is it: at 375px, nothing may sit past
// the right edge of the viewport unless some ancestor can scroll it into view. A clipped element
// with no scroller is not "slightly cut off" -- it is gone, with no affordance saying so, which is
// exactly how the ribbon lost its Refresh and Export buttons.
//
//   node tools/overflow-probe/probe.mjs <storybook-dist-dir> [port]
//
// Exits 1 with one line per offending element, 0 when there are none.
//
// OVERFLOW_PROBE_CHANNEL picks an installed browser (`msedge`, `chrome`) over the one Playwright
// downloads, for a machine that cannot reach its CDN -- the same escape hatch, and the same
// reasoning, as tools/style-snapshot.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const [, , distDir, portArg] = process.argv;
const port = Number(portArg ?? 6207);

if (!distDir) {
  console.error('usage: node tools/overflow-probe/probe.mjs <storybook-dist-dir> [port]');
  process.exit(2);
}

// 375x812 is the phone this work targets. Height matters only in that a shorter viewport would
// change what is laid out at all; the rule itself is about the horizontal axis.
const VIEWPORT = { width: 375, height: 812 };

/*
 * `open: true` means the story renders a trigger and nothing else, so the thing to measure does
 * not exist until something is clicked.
 *
 * Driven by an explicit flag rather than "click the first button if the dialog is absent": the
 * showcase stories are full of buttons -- a ribbon alone has six -- and a heuristic would click
 * one of them and measure a different screen than the one named here.
 */
const STORIES = [
  { id: 'shared-app-showcase--navigable-app' },
  { id: 'shared-app-showcase--list-view' },
  { id: 'shared-app-showcase--details-view' },
  { id: 'shared-app-showcase--many-tabs' },
  { id: 'library-ribbon-ribbon--primary' },
  { id: 'library-modals-simple-modal--primary', open: true },
  { id: 'library-modals-multi-select--wide-permission-selector', open: true },
  { id: 'library-modals-multi-editor--pricing-editor', open: true },
];

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

/*
 * Wait until the page stops moving, rather than for a fixed time. Lifted from
 * tools/style-snapshot/capture.mjs, for the reason recorded there: a story keeps working after
 * the network goes quiet -- the data grid debounces a ResizeObserver for 150ms and then
 * recalculates its viewport, a ribbon button's access check resolves -- and a flat wait lands in
 * the middle of it. Here that would mean measuring a layout that is still settling.
 */
const settle = async (page, { interval = 120, stableRounds = 3, timeout = 8000 } = {}) => {
  const fingerprint = () =>
    page.evaluate(() => {
      const root = document.querySelector('#storybook-root') ?? document.body;
      const parts = [];
      const walk = (el) => {
        const box = el.getBoundingClientRect();
        parts.push(`${box.width}:${box.height}:${getComputedStyle(el).opacity}`);
        [...el.children].forEach(walk);
      };
      [...root.children].forEach(walk);
      return parts.join('|');
    });

  let previous = await fingerprint();
  let stable = 0;
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    await page.waitForTimeout(interval);
    const current = await fingerprint();
    if (current === previous) {
      if (++stable >= stableRounds) return;
    } else {
      stable = 0;
      previous = current;
    }
  }
};

const findOffenders = (page) =>
  page.evaluate(() => {
    // The nearest custom element is what owns the offending box, and it is the name worth
    // printing: `span` tells you nothing, `lib-ribbon-button` tells you where to look.
    const owner = (el) => {
      let node = el;
      while (node && !node.tagName.includes('-')) node = node.parentElement;
      return node ? node.tagName.toLowerCase() : el.tagName.toLowerCase();
    };

    // How much of the element is actually inside the viewport. Below this it is gone rather than
    // merely trimmed, and "gone" is what this probe is for.
    const VISIBLE_FLOOR_PX = 8;

    // The layout edge, not `innerWidth`. On a platform with classic (non-overlay) scrollbars
    // `innerWidth` includes the scrollbar, which would excuse ~15px of genuine overflow -- and
    // CI is exactly such a platform.
    const edge = document.documentElement.clientWidth;

    return [...document.querySelectorAll('*')]
      .filter((el) => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4 || r.right <= edge + 1) return false;

        // The one exclusion. See README.md -- the grid's header is kept in line with its body by
        // a script-driven transform, so it has no scrollable ancestor and never will.
        if (el.closest('lib-data-grid .header')) return false;

        /*
         * Walk up for the first ancestor that decides this element's fate: a horizontal scroller
         * can bring it into view, a clipping box caps what of it can ever be seen. Whichever
         * comes first wins -- a scroller ABOVE a clipper cannot help, because scrolling moves the
         * clipper and the element together and the element stays outside it.
         */
        let clipper = null;
        for (let p = el.parentElement; p; p = p.parentElement) {
          const pcs = getComputedStyle(p);
          if (pcs.overflowX === 'hidden' || pcs.overflowX === 'clip') {
            clipper = p;
            break;
          }
          if ((pcs.overflowX === 'auto' || pcs.overflowX === 'scroll') && p.scrollWidth - p.clientWidth > 1) {
            return false;
          }
        }

        /*
         * How much of the element can ever be seen, and the measure differs by case.
         *
         * Clipped: measure against the clipper's box, not the viewport. That is scroll-invariant,
         * which is the point -- a grid cell with `overflow: hidden` clips its text to an ellipsis
         * while the cell itself slides into view as the grid scrolls, so judging it against the
         * viewport reports intended truncation as a defect. What matters is whether the element
         * falls inside the box that clips it at all. A `<svg>` clips by default, so its `circle`
         * and `path` land here too, and they sit inside it.
         *
         * Not clipped and nothing scrolls it: the viewport is the box, and anything past it with
         * less than a sliver showing is simply gone -- which is how the ribbon lost Refresh and
         * Export.
         */
        const box = clipper ? clipper.getBoundingClientRect() : { left: 0, right: edge };
        const visible = Math.min(r.right, box.right) - Math.max(r.left, box.left);
        return visible < VISIBLE_FLOOR_PX;
      })
      .map((el) => ({
        owner: owner(el),
        tag: el.tagName.toLowerCase(),
        cutBy: Math.round(el.getBoundingClientRect().right - edge),
      }));
  });

const run = async () => {
  await new Promise((r) => server.listen(port, r));

  /*
   * Check the ids before measuring anything. A renamed or deleted story would otherwise load as a
   * blank page, report no offenders, and quietly turn this gate green -- the failure mode that
   * makes an acceptance test worth less than no acceptance test.
   */
  const index = JSON.parse(readFileSync(join(distDir, 'index.json'), 'utf8'));
  const missing = STORIES.filter((s) => !index.entries[s.id]).map((s) => s.id);
  if (missing.length > 0) {
    console.error(`probe: these story ids are not in the built Storybook:\n  ${missing.join('\n  ')}`);
    await new Promise((r) => server.close(r));
    process.exit(2);
  }

  const channel = process.env.OVERFLOW_PROBE_CHANNEL;
  const browser = await chromium.launch(channel ? { channel } : {});
  const page = await browser.newPage({ viewport: VIEWPORT });

  // A transition mid-flight has an element somewhere it will not stay, and the settle loop would
  // either wait it out or catch it. Zeroing them makes the measurement the resting layout.
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent =
      '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;' +
      'transition-duration:0s!important;transition-delay:0s!important;}';
    document.documentElement.appendChild(style);
  });

  /*
   * A story that throws while rendering leaves `#storybook-root` empty, which measures clean and
   * turns this gate green for the worst possible reason. The id check above only catches renames.
   */
  let pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message.split('\n')[0]));

  let total = 0;

  for (const story of STORIES) {
    pageErrors = [];
    await page.goto(`http://localhost:${port}/iframe.html?id=${story.id}&viewMode=story`, {
      waitUntil: 'networkidle',
    });
    await settle(page);

    const rendered = await page.evaluate(() => {
      const root = document.querySelector('#storybook-root');
      return root ? root.childElementCount : 0;
    });
    if (rendered === 0) {
      console.error(`probe: ${story.id} rendered nothing`);
      for (const message of pageErrors) console.error(`  ${message}`);
      await browser.close();
      await new Promise((r) => server.close(r));
      process.exit(2);
    }

    if (story.open) {
      const trigger = page.locator('#storybook-root button').first();
      await trigger.click();
      await settle(page);

      // The click is load-bearing: without an open dialog this story measures an empty page and
      // passes for the wrong reason.
      const opened = await page.locator('lib-modal.show').count();
      if (opened === 0) {
        console.error(`probe: ${story.id} did not open a modal; the trigger or its markup changed`);
        await browser.close();
        await new Promise((r) => server.close(r));
        process.exit(2);
      }
    }

    const offenders = await findOffenders(page);
    for (const o of offenders) {
      console.log(`${story.id} ${o.owner} (${o.tag}) cut by ${o.cutBy}px`);
    }
    total += offenders.length;
  }

  await browser.close();
  await new Promise((r) => server.close(r));

  console.log(`\ntotal unreachable elements at ${VIEWPORT.width}px: ${total}`);
  process.exit(total === 0 ? 0 : 1);
};

run().catch(async (error) => {
  console.error(error);
  process.exit(2);
});
