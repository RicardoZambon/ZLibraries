# Style snapshot

`docs/guides/dependency-holds.md` says of the Tailwind upgrade that "no test here asserts on
computed styles, so a broken upgrade would pass CI". This is that assertion.

It loads every story in a built Storybook, walks the rendered DOM, and writes the computed value of
around fifty visually meaningful properties for each element to a JSON file. Two snapshots — one
before a change, one after — diff into a list of exactly what moved.

## Running it

```bash
npx nx run-many --target=build-storybook --projects=framework,library,shared --configuration=ci
node tools/style-snapshot/capture.mjs dist/storybook/library before-library.json
# ...make the change, rebuild...
node tools/style-snapshot/capture.mjs dist/storybook/library after-library.json
node tools/style-snapshot/diff.mjs before-library.json after-library.json
```

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
angle is noise, so a rotation matrix on an animated element is recorded as `<animated>`. Everything
else is captured verbatim: two runs against one build are byte-identical.

## What it does not do

It compares computed styles, not pixels. A change that produces identical computed values on every
element but a different rendering — a font that fails to load, a background image that 404s, an
`::before` whose content changes — will not show up here. It narrows what a human has to look at;
it does not replace looking.

It also only covers what the stories render. A component state no story reaches is not in the
snapshot.
