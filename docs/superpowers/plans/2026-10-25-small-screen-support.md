# Small-screen support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nothing in the ribbon or the two-pane modals is unreachable at 375px.

**Architecture:** The ribbon host becomes a named query container and scrolls horizontally; below
36rem of its own width the buttons and groups inside it switch to a compact, icon-only form. The
two modals stack their panes below the same threshold, each pane scrolling inside a floor. All of
it is CSS except the accessible names. A Playwright probe is the acceptance gate.

**Tech Stack:** Angular 22, Tailwind 4 (`@apply` against a referenced theme), SCSS with Angular
emulated encapsulation, Jest + jsdom, Playwright (transitively, via `@storybook/test-runner`).

**Spec:** [docs/superpowers/specs/2026-10-25-small-screen-support-design.md](../specs/2026-10-25-small-screen-support-design.md)

## Global Constraints

- No JavaScript in the layout decision. Container queries and `overflow` only; no `ResizeObserver`,
  no measuring, no class set from TypeScript. The accessible names in Task 4 are template work and
  are not a layout decision.
- One threshold, written as the literal `36rem`, in every container query this plan adds. A custom
  property cannot appear in a container query condition.
- No new translation key. The `library` entry point ships no translation files; a new key would be
  a string every consuming application must supply.
- `lib-modal` is not modified. The stacking fix stays inside the two modal components.
- Desktop rendering must not change. Above the threshold every rule this plan adds must be inert.
- Every task that touches `libs/ui/src/` needs a `libs/ui/CHANGELOG.md` entry under
  `## [Unreleased]`; CI enforces this. Task 7 writes the whole entry, so earlier tasks skip it.
- Stylesheet work is invisible to the Nx graph: every `--target=build-storybook` or
  `build-storybook` run in this plan needs `--skip-nx-cache`.

## Review Focus

Five things the spec implies that no task's own tests would otherwise exercise. Each one's test is
added to the task that owns the code.

1. **A ribbon button outside a `lib-ribbon`.** The data grid's buttons bar projects ribbon buttons
   with no ribbon ancestor. The named container never matches there, so those buttons must render
   exactly as they do today, at any width. Test in Task 3.
2. **A ribbon in a parent that sizes to its content.** Inline-size containment stops the host
   sizing to its contents, so without the explicit width it collapses to nothing. Test in Task 2.
3. **A button with options and an empty label.** `label` defaults to `''`, so the chevron's
   `aria-labelledby` would point at an empty element and name nothing. Test in Task 4.
4. **A projected form taller than the floor.** The multi-editor's lower pane holds consumer
   content; stacked, it must scroll rather than clip. Test in Task 5.
5. **Keyboard focus at the scrolled ends.** Tabbing to a button that is scrolled out must bring it
   into view, and the edge mask must not swallow its focus ring. Test in Task 6.

---

### Task 1: The acceptance probe

The gate for everything after it. Written first so it fails first.

**Files:**
- Create: `tools/overflow-probe/probe.mjs`
- Create: `tools/overflow-probe/README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: `node tools/overflow-probe/probe.mjs <storybook-dist-dir> [port]`. Prints one line per
  offending element as `<story id> <tag> cut by <n>px`, then a total. Exits 0 when the total is 0,
  1 otherwise.

- [ ] **Step 1: Write the probe**

Serve `<storybook-dist-dir>` over `node:http` and drive it with `chromium` from `playwright` — copy
the static-server and browser-launch shape from `tools/style-snapshot/capture.mjs`, including its
`STYLE_SNAPSHOT_CHANNEL` escape hatch for a machine that cannot reach Playwright's CDN.

Viewport `375x812`. Stories, by id:

```
shared-app-showcase--navigable-app
shared-app-showcase--list-view
shared-app-showcase--details-view
shared-app-showcase--many-tabs
library-ribbon-ribbon--primary
library-modals-simple-modal--primary
library-modals-multi-select--wide-permission-selector
library-modals-multi-editor--pricing-editor
```

Load each at `iframe.html?id=<id>&viewMode=story`. The three modal stories render only a trigger,
so after load click the first `button` in `#storybook-root` when one is present and the story's
dialog is not already in the DOM; without that the probe measures an empty page and passes.

Reuse the settle loop from `capture.mjs` rather than a flat wait — poll box sizes until they hold
still — for the reason recorded there: a flat wait lands in the middle of the data grid's 150ms
debounce and the ribbon button's access check.

The rule, evaluated in the page:

```js
// An element past the right edge is fine if SOME ancestor can scroll it into view.
const offenders = [...document.querySelectorAll('*')].filter((el) => {
  const cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden') return false;
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4 || r.right <= innerWidth + 1) return false;
  if (el.closest('lib-data-grid .header')) return false; // see Step 2
  for (let p = el.parentElement; p; p = p.parentElement) {
    const pcs = getComputedStyle(p);
    if ((pcs.overflowX === 'auto' || pcs.overflowX === 'scroll') && p.scrollWidth - p.clientWidth > 1) return false;
  }
  return true;
});
```

- [ ] **Step 2: Document the one exclusion in `tools/overflow-probe/README.md`**

The data grid's header is excluded and must stay excluded. Its cells sit past the edge with no
scrollable ancestor because the header is held in line with the body by a script-driven transform
instead — scrolling the body to 150px puts `translateX(-150px)` on the header row. Without the
exclusion the probe can never reach zero and the gate means nothing.

- [ ] **Step 3: Build the Storybook and run the probe**

```bash
npx nx build-storybook ui --configuration=ci --skip-nx-cache
node tools/overflow-probe/probe.mjs dist/storybook/ui
```

Expected: FAIL, exit 1. The ribbon and its buttons are reported on the list view and the detail
view. This failing run is the baseline; record the total in the commit message.

- [ ] **Step 4: Commit**

```bash
git add tools/overflow-probe
git commit -m "test(no-release): add the small-screen overflow probe"
```

---

### Task 2: The ribbon becomes a query container and scrolls

**Files:**
- Modify: `libs/ui/src/library/components/ribbon/ribbon.component.scss`

**Interfaces:**
- Produces: a container named `ribbon` on the `lib-ribbon` host. Task 3 queries it by that name;
  the name is the contract between them. Tasks 5 and 6 are unrelated — they declare their own
  `modal-body` container inside their own components.

- [ ] **Step 1: Add the container and the scroll to `:host`**

In the existing `:host` block, alongside `@apply flex flex-row border p-1 relative`:

```scss
container-type: inline-size;
container-name: ribbon;
width: 100%;
overflow-x: auto;
```

Comment why `width: 100%` is there, in the register the rest of this file uses: inline-size
containment stops the host sizing to its contents, so in a parent that sizes to *its* contents the
bar would collapse to nothing. Both in-repo usages stretch it already; this is for consumers.

Scrolling is unconditional, not inside the query: a nine-button bar overflows at 600px, above the
threshold, and must still be reachable there.

This is also what moves the `[right]` slot. The host keeps `justify-between`, which falls back to
flex-start once the content overflows, so the slot stops being pinned opposite the groups and
joins the scrolling row at the end. No separate rule is needed; confirm it in Step 3.

- [ ] **Step 2: Verify the ribbon no longer clips**

```bash
npx nx build-storybook ui --configuration=ci --skip-nx-cache
node tools/overflow-probe/probe.mjs dist/storybook/ui
```

Expected: PASS for the ribbon on both showcase stories — scrolling alone satisfies the probe's
rule. The modal stories still fail; Tasks 5 and 6 own those.

- [ ] **Step 3: Check the two things scrolling can break**

Run `npm run storybook` and, at 375px, confirm on the detail view:

- `overflow-y` now computes to `auto` on the host, because a `visible` axis beside a non-`visible`
  one becomes `auto`. Nothing in the ribbon overflows vertically, so there must be no vertical
  scrollbar and no clipped button.
- The options list still escapes the host. It renders through a CDK overlay, so containment should
  not reach it — confirm the list opens outside the bar and is not clipped. The same trap cost the
  tab panel a phantom scrollbar during the layout review.

- [ ] **Step 4: Review Focus 2 — a content-sized parent**

Add a story to `libs/ui/src/library/stories/ribbon/ribbon.component.stories.ts` that puts a
`lib-ribbon` inside `<div style="display:inline-block">`. Confirm in Storybook that the bar still
shows its buttons rather than collapsing. Keep the story: it is the regression guard.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/src/library/components/ribbon/ribbon.component.scss libs/ui/src/library/stories/ribbon/ribbon.component.stories.ts
git commit -m "fix(ui): let the ribbon scroll instead of clipping its buttons"
```

---

### Task 3: Compact mode below 36rem

**Files:**
- Modify: `libs/ui/src/library/components/ribbon-button/ribbon-button.component.scss`
- Modify: `libs/ui/src/library/components/ribbon-group/ribbon-group.component.scss`
- Modify: `libs/ui/src/library/components/ribbon/ribbon.component.scss`

**Interfaces:**
- Consumes: the `ribbon` container from Task 2.

- [ ] **Step 1: Compact the button**

In `ribbon-button.component.scss`, at the end of the file:

```scss
@container ribbon (max-width: 36rem) {
  .button {
    @apply px-2;

    .icon {
      @apply text-2xl h-7;
    }

    .label {
      @apply hidden;
    }
  }

  .button-dropdown {
    @apply px-0.5;
  }
}
```

Named `ribbon`, not bare: a bare `@container` matches the nearest container of any name, and these
buttons are also used outside a ribbon. Measured: this takes the glyph box from 45px to 30px and
the button from 69px to about 46px, and it is the icon — not the label — that does the work.

- [ ] **Step 2: Compact the group**

In `ribbon-group.component.scss`:

```scss
@container ribbon (max-width: 36rem) {
  :host {
    @apply pr-1;
  }

  .label {
    @apply hidden;
  }
}
```

The caption saves height rather than width — the group is almost always wider than its caption —
which is the point: this is what takes the bar from 110px tall to roughly 40px.

- [ ] **Step 3: Add the edge fade, compact only**

In `ribbon.component.scss`, inside `@container ribbon (max-width: 36rem)`, take the gradient shape
from the tabs' `.tabs-nav` — `linear-gradient(to right, transparent 0, black <start>, black
calc(100% - <end>), transparent 100%)` as both `mask-image` and `-webkit-mask-image` — with a
literal `1.5rem` at each end.

A literal, **not** `var(--tabs-fade-width)`. That is the tabs' published token, and borrowing it
would mean an application retuning its tabs silently retunes the ribbon too.

The query is deliberate. A pure-CSS fade has no scroll state to key on — the tabs' is switched on
by two classes TypeScript sets from measured scroll positions — so an unconditional fade would
show on every desktop ribbon in every consuming application, and the style snapshot has a noise
floor of zero. Write that reason in the comment.

- [ ] **Step 4: Verify compaction and the height**

```bash
npx nx build-storybook ui --configuration=ci --skip-nx-cache
node tools/overflow-probe/probe.mjs dist/storybook/ui
```

Then in Storybook at 375px, on the list view: the bar is icon-only, its height is near 40px rather
than 110px, and it scrolls. At 1024px it is unchanged.

- [ ] **Step 5: Review Focus 1 — a ribbon button with no ribbon**

In Storybook at 375px, open the detail view and look at the ADDRESSES child list, whose buttons sit
in the data grid's buttons bar with no `lib-ribbon` ancestor. They must still show their labels at
`iconSize="small"` — unchanged from today. If they compact, the query is unnamed somewhere.

- [ ] **Step 6: Confirm desktop is untouched**

Capture a style snapshot before and after this task's three files and diff it. Expected: an empty
diff at the default viewport.

```bash
node tools/style-snapshot/capture.mjs dist/storybook/ui after.json
node tools/style-snapshot/diff.mjs before.json after.json
```

- [ ] **Step 7: Commit**

```bash
git add libs/ui/src/library/components/ribbon-button/ribbon-button.component.scss libs/ui/src/library/components/ribbon-group/ribbon-group.component.scss libs/ui/src/library/components/ribbon/ribbon.component.scss
git commit -m "feat(ui): compact the ribbon to icons on a narrow screen"
```

---

### Task 4: Accessible names for an icon-only bar

The only task with Jest tests, because it is the only one jsdom can see — container queries do not
evaluate there.

**Files:**
- Modify: `libs/ui/src/library/components/ribbon-button/ribbon-button.component.html`
- Modify: `libs/ui/src/library/components/ribbon-button/ribbon-button.component.ts`
- Test: `libs/ui/src/library/components/ribbon-button/ribbon-button.component.spec.ts`

**Interfaces:**
- Produces: `protected get accessibleName(): string` on `RibbonButtonComponent` — the label,
  falling back to the tooltip, `''` when both are empty. Translation stays in the template, where
  the label already goes through the `translate` pipe.
- Produces: `protected get labelId(): string` — a stable element id for the label span.

- [ ] **Step 1: Write the failing tests**

Append to the existing `describe('RibbonButtonComponent')`, in its style — the suite builds the
component with `Object.create` and assigns signals, so these are unit tests on the getter, not
`TestBed` renders.

```ts
describe('accessibleName', () => {
  it('should use the label when there is one', () => {
    component.label = signal('Save');
    expect((component as any).accessibleName).toBe('Save');
  });

  it('should fall back to the tooltip when the label is empty', () => {
    component.label = signal('');
    component.tooltip = signal('Save the record');
    expect((component as any).accessibleName).toBe('Save the record');
  });

  it('should be empty when there is neither', () => {
    component.label = signal('');
    component.tooltip = signal('');
    expect((component as any).accessibleName).toBe('');
  });
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `npx nx test ui --testPathPatterns=ribbon-button`
Expected: FAIL, `accessibleName` undefined.

- [ ] **Step 3: Implement `accessibleName` and wire the template**

Add both getters to `ribbon-button.component.ts`. For `labelId`, follow the pattern this repo
already uses in two places — a private static counter incremented in the constructor and a
template-literal id, as `TabsComponent` does with `framework-tabs-${instances++}` and
`CatalogSelectComponent` with `catalog-select-${instanceCounter++}`. Here:
`ribbon-button-${instanceId}-label`.

In the template:

- give the main `a.button` `[attr.aria-label]="accessibleName | translate"`;
- give the label `<span>` `[id]="labelId"`, and point the chevron at it with
  `[attr.aria-labelledby]="accessibleName ? labelId : null"`.

Binding to `null` when the name is empty is Review Focus 3: pointing `aria-labelledby` at an empty
element names the control *nothing at all*, which is worse than leaving it unnamed, because it
suppresses the fallback a screen reader would otherwise use.

No new translation key: the chevron borrows the button's name, and `aria-haspopup="menu"` already
says what it does.

- [ ] **Step 4: Run them and watch them pass**

Run: `npx nx test ui --testPathPatterns=ribbon-button`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/src/library/components/ribbon-button/
git commit -m "fix(ui): name the ribbon buttons when the labels are hidden"
```

---

### Task 5: The multi-editor stacks

The simple one of the two: its panes are in columns because the flow says so.

**Files:**
- Modify: `libs/ui/src/library/components/multi-editor/multi-editor.component.html`
- Modify: `libs/ui/src/library/components/multi-editor/multi-editor.component.scss`

- [ ] **Step 1: Give the component a container to query**

A grid cannot query itself, and `:host` is `display: contents` for a reason recorded in the file.
So wrap the two panes: in the template, `<div body class="body-content">` gains an inner
`<div class="panes">` holding `.data-grid` and `.data`.

Move the grid declaration from `.body-content` to `.panes`, and give `.body-content`
`container-type: inline-size; container-name: modal-body`.

- [ ] **Step 2: Stack below the threshold**

```scss
@container modal-body (max-width: 36rem) {
  .panes {
    @apply grid-flow-row;
    grid-template-rows: minmax(11rem, 1fr) minmax(11rem, 1fr);
  }

  .data-grid,
  .data {
    @apply overflow-y-auto;
  }
}
```

11rem is a header plus about three rows at the data grid's default row height of 41.6px. Two floors
come to 352px against the ~450px a 375×667 phone leaves once the modal's padding, header and footer
are out.

A container query rather than a media query because the modal's width comes from its `size` input,
not from the window: a `size-sm` modal is narrow on a desktop too and should stack there as well.

Stacking order needs no rule: the template already has the grid before the form, so row flow puts
the source pane on top, which is the order the design asks for. The add and delete buttons stay
inside `.data` and so travel with the form pane. Confirm both rather than assume them.

- [ ] **Step 3: Review Focus 4 — a projected form taller than the floor**

In Storybook at 375px, open the pricing editor story. The lower pane holds a projected form. It
must scroll inside its own row; no field may be clipped and unreachable. Scroll to the last field
and confirm it is reachable.

- [ ] **Step 4: Verify**

```bash
npx nx build-storybook ui --configuration=ci --skip-nx-cache
node tools/overflow-probe/probe.mjs dist/storybook/ui
```

Expected: the multi-editor story passes. Check at 1024px that the panes are still side by side.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/src/library/components/multi-editor/
git commit -m "fix(ui): stack the multi-editor panes on a narrow screen"
```

---

### Task 6: The multi-select stacks

Not the same fix, and this is the trap. Its body already sets `grid-flow-row` with `!important`;
the side-by-side comes from both panes carrying `row-span-full` in a two-row grid, so
auto-placement puts the second one in a new *column*. Switching the flow here does nothing.

**Files:**
- Modify: `libs/ui/src/library/components/multi-select/multi-select.component.html`
- Modify: `libs/ui/src/library/components/multi-select/multi-select.component.scss`

- [ ] **Step 1: Give the component a container to query**

As in Task 5: an inner `<div class="panes">` inside `<div body class="body-content">`, holding
`.search-grid` and `lib-multi-select-result-grid`. Move the grid declaration to `.panes`;
`.body-content` becomes the container, named `modal-body`.

- [ ] **Step 2: Stack below the threshold**

```scss
@container modal-body (max-width: 36rem) {
  .panes {
    grid-template-rows: minmax(11rem, 1fr) minmax(11rem, 1fr);
  }

  .search-grid,
  lib-multi-select-result-grid {
    @apply row-span-1 overflow-y-auto;
  }

  .search-grid {
    @apply grid-rows-none;
  }

  lib-multi-select-result-grid {
    @apply min-h-0;
  }
}
```

Three undoings, each load-bearing: the row span is what put the second pane in a new column; the
subgrid tied the left pane's inner rows to outer rows that no longer exist once it occupies one
row; and the 24rem minimum is a desktop figure — two of those would be 768px against the ~450px
available.

As in Task 5, the order needs no rule: the search box and its grid come first in the template, so
they land on top.

- [ ] **Step 3: Verify**

```bash
npx nx build-storybook ui --configuration=ci --skip-nx-cache
node tools/overflow-probe/probe.mjs dist/storybook/ui
```

Expected: the multi-select story passes, and the total across all stories is now **0**. At 375px
the search box and its grid sit above the selection pane, both usable. At 1024px nothing moved.

- [ ] **Step 4: Review Focus 5 — keyboard focus at the scrolled ends**

In Storybook at 375px, on the list view, tab through the ribbon. Focus must scroll a button that is
out of view into view, and the focus ring must be legible at both ends rather than swallowed by the
mask. If the mask eats it, reduce the fade width rather than dropping the mask.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/src/library/components/multi-select/
git commit -m "fix(ui): stack the multi-select panes on a narrow screen"
```

---

### Task 7: Changelog, docs and the acceptance run

**Files:**
- Modify: `libs/ui/CHANGELOG.md`
- Modify: `README.md`
- Modify: `tools/style-snapshot/README.md`

- [ ] **Step 1: Write the changelog entry**

Under `## [Unreleased]`, in the voice of the 1.1.0 entry above it. `### Changed`: the ribbon
compacts and scrolls below 36rem of its own width; the two modals stack their panes. `### Added`:
ribbon buttons take an accessible name from their label. `### Fixed`: ribbon actions were
unreachable below roughly 600px.

No breaking-changes subsection. Nothing here requires a consumer to act; say in the Changed entries
that a consumer who positions something `fixed` inside a ribbon should check it, since the host is
now a containing block.

- [ ] **Step 2: Correct the style-snapshot README**

It still names the pre-unification layout — `libs/shared/src/styles/theme.css`,
`--projects=framework,library,shared`, `dist/storybook/library`. Those paths no longer exist. Fix
them to `libs/ui/src/styles/theme.css`, `nx build-storybook ui` and `dist/storybook/ui`. Not
scope creep: Task 3 tells an implementer to run that tool from those instructions.

- [ ] **Step 3: Add the probe to the README's command table**

One row, next to the existing commands, saying what it checks and that it needs a built Storybook.

- [ ] **Step 4: Run the whole gate**

```bash
npm run lint
npm test
npx nx build-storybook ui --configuration=ci --skip-nx-cache
node tools/overflow-probe/probe.mjs dist/storybook/ui
npm run format:check
```

Expected: all pass, probe total 0. On Windows, `nx format:write` rewrites the workspace to LF — if
`format:check` fails, inspect with `git diff --ignore-cr-at-eol` before assuming a real change.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/CHANGELOG.md README.md tools/style-snapshot/README.md
git commit -m "docs: record the small-screen work and fix the stale snapshot paths"
```
