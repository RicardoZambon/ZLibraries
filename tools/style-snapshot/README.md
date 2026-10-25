# Style snapshot

`docs/guides/dependency-holds.md` says of the Tailwind upgrade that "no test here asserts on
computed styles, so a broken upgrade would pass CI". This is that assertion.

It loads every story in a built Storybook, walks the rendered DOM, and writes the computed value of
around fifty visually meaningful properties for each element to a JSON file. Two snapshots — one
before a change, one after — diff into a list of exactly what moved.

## Running it

```bash
npx nx build-storybook ui --configuration=ci --skip-nx-cache
node tools/style-snapshot/capture.mjs dist/storybook/ui before.json
# ...make the change, rebuild...
node tools/style-snapshot/capture.mjs dist/storybook/ui after.json
node tools/style-snapshot/diff.mjs before.json after.json
```

`--skip-nx-cache` is not optional when the change is in a stylesheet. Every component stylesheet
references `libs/ui/src/styles/theme.css` by relative path, which Nx cannot see: editing it leaves
the project looking unaffected and its Storybook is replayed from cache. The snapshot then
compares a build that does not contain your change.

`STYLE_SNAPSHOT_CHANNEL=msedge` (or `chrome`) uses an installed browser instead of the one
Playwright downloads, for a machine that cannot reach its CDN. Either is fine: a snapshot is only
ever compared with another taken the same way.

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
wait a flat 350ms, which landed in the middle of that -- two runs against one build of the shared
Storybook disagreed on 122 of its 1331 elements, enough noise to bury a real change. It now polls
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
