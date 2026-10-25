# Overflow probe

The acceptance gate for small-screen support: at 375px, nothing may sit past the right edge of the
viewport unless some ancestor can scroll it into view.

The distinction is the whole point. An element that overflows a scroll container is reachable —
you scroll to it. An element that overflows a container which _clips_ is gone, and nothing on
screen says so. That is how the ribbon lost its Refresh and Export buttons on a phone: the bar
neither wrapped nor scrolled, and an ancestor clipped it.

The style snapshot next door cannot catch this. It diffs computed styles between two builds, so it
reports that something changed — not that something is unreachable, and not on a build with
nothing to compare against.

## Running it

Needs a built Storybook, and the build must not come from the Nx cache when a stylesheet changed:

```bash
npx nx build-storybook ui --configuration=ci --skip-nx-cache
node tools/overflow-probe/probe.mjs dist/storybook/ui
```

One line per offending element, then a total. Exit 0 when the total is 0, 1 otherwise, 2 when the
probe itself could not run.

`OVERFLOW_PROBE_CHANNEL=msedge` (or `chrome`) uses an installed browser instead of the one
Playwright downloads, for a machine that cannot reach its CDN.

## The one exclusion: the data grid's header

`lib-data-grid .header` is excluded, and must stay excluded.

Its cells genuinely sit past the right edge with no scrollable ancestor, so the rule flags them —
but they are not unreachable. The grid's rows scroll inside a CDK viewport while the header sits
outside it, and the component keeps the two in line by translating the header row in script.
Verified: scrolling the body to 150px puts `translateX(-150px)` on the header row, and the heading
that was off-screen is now under the cells it belongs to.

Without the exclusion the probe can never reach zero, and a gate that can never be met is a gate
nobody runs.

## A tail past the edge is not a finding

An element is reported only when less than 8px of it is inside the viewport.

Without that floor the probe reports text that is working as intended. A `span` inside a grid cell
with `overflow: hidden` keeps its full layout width while the cell shows an ellipsis, so its box
reaches past the viewport although the text is on screen and deliberately truncated. The first
baseline run produced five of those from the data grid and not one was a defect.

A ribbon button 69px wide cut by 93px has no presence on screen at all. That is the difference the
floor draws, and it is the difference between "trimmed" and "gone".

## A scroller further up does not always help

The ancestor walk stops at the first box that hard-clips. An element cut by an
`overflow: hidden` or `overflow: clip` ancestor is unreachable however far some outer scroller
scrolls, so finding a scroller above that box proves nothing.

The shape exists in this codebase — `.panes` is `overflow: clip` in both two-pane modals, and the
ribbon host is now a scroller — so without the stop the probe would quietly excuse exactly the
kind of defect it exists to find.

The right edge is `document.documentElement.clientWidth`, not `window.innerWidth`. On a platform
with classic rather than overlay scrollbars the two differ by the scrollbar's width, and using
`innerWidth` would excuse about 15px of genuine overflow.

## It fails rather than measures an empty page

Two ways a story can be present and still render nothing: it throws while rendering, or its
modal never opens. Either leaves `#storybook-root` empty, which measures clean and turns the gate
green for the worst possible reason. The probe asserts the root has children, prints any uncaught
page error, and exits 2.

## What it will not catch

Being squeezed rather than cut. The two-pane modals were unusable at 375px — each pane about
150px, one of them a column of unlabelled icons — and nothing overflowed anything, so this probe
passes them and always will. It answers "is anything unreachable", not "is this usable". The
second question still needs eyes on the Storybook at 375px.

## Keeping the story list honest

The story ids are listed in `probe.mjs`. A renamed or deleted story would otherwise load as a
blank page, report nothing, and turn the gate green for the worst possible reason, so the probe
checks every id against the built `index.json` first and exits 2 if one is missing. A story that
needs a click to render its dialog carries `open: true`; the probe fails rather than measures if
that click does not produce a modal.
