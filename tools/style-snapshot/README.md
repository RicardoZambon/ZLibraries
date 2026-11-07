# Style snapshot

No unit test asserts on computed styles, so a change that breaks how things look still passes CI.
This tool is that assertion.

It is a manual check: CI does not run it. Run it before merging a stylesheet change, or an
upgrade of Tailwind, Angular or Font Awesome.

It loads every story in a built Storybook, walks the rendered DOM, and writes the computed value of
around fifty visually meaningful properties for each element to a JSON file. Two snapshots — one
before a change, one after — diff into a list of exactly what moved.

## Running it

The tool drives Chromium through Playwright. Playwright is not a direct dependency of the
workspace; it arrives with `@storybook/test-runner`. Download its browser once:

```bash
npx playwright install chromium
```

Or set `STYLE_SNAPSHOT_CHANNEL=msedge` (or `chrome`) to use an installed browser instead, for a
machine that cannot reach Playwright's CDN. Either is fine: a snapshot is only ever compared with
another taken the same way.

Then build Storybook, capture, make the change, rebuild and capture again:

```bash
npm run build-storybook -- --skip-nx-cache
node tools/style-snapshot/capture.mjs dist/storybook/ui-examples before.json
# ...make the change...
npm run build-storybook -- --skip-nx-cache
node tools/style-snapshot/capture.mjs dist/storybook/ui-examples after.json
node tools/style-snapshot/diff.mjs before.json after.json
```

`--skip-nx-cache` makes sure each build contains the current source, not a cached result.

`diff.mjs` groups the changes by property and caps each list. Add `--full` to list every changed
element. It exits 1 when any element changed, and 0 when none did.

## What it is careful about

**Elements are addressed by position, not by class.** The key for an element is its index path from
the story root plus its tag name. Keying on class names would mean a utility rename changed the key
and the diff showed a removal and an addition rather than the change itself — hiding the one thing
this exists to catch.

**Animated transforms are normalised.** A spinner is mid-rotation at an arbitrary angle, so its
matrix differs between two runs of the same build. Whether an element animates is the signal, the
angle is noise, so a rotation matrix on an animated element is recorded as `<animated>`.

**It waits for the page to stop moving.** Animations and transitions are forced to zero duration,
but a story keeps working after the network goes quiet: the data grid debounces a ResizeObserver
for 150ms and then recalculates its viewport, a ribbon button's access check resolves and drops it
to 60% opacity, a web font arrives and reflows everything by a fraction of a pixel. This used to
wait a flat 350ms, which landed in the middle of that -- two runs against one Storybook build
disagreed on 122 of 1331 elements, enough noise to bury a real change. It now polls
box sizes and opacity until they hold still for three rounds. The floor that measured 122 is now 0.

With that, two runs against one build are byte-identical. A story that never settles is captured
anyway after eight seconds, and the diff is where that shows up.

## What it does not do

It compares computed styles, not pixels. A change that produces identical computed values on every
element but a different rendering — a font that fails to load, a background image that 404s, an
`::before` whose content changes — will not show up here. It narrows what a human has to look at;
it does not replace looking.

It also only covers what the stories render. A component state no story reaches is not in the
snapshot.
