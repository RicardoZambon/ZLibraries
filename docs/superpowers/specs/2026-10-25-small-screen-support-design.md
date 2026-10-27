# Small-screen support: the ribbon and the two-pane modals

- **Date:** 2026-10-25
- **Status:** Proposed
- **Entry points affected:** `@zambon-dev/ui/library`, `@zambon-dev/ui/framework`
- **Predecessor:** [library-wide layout review](2026-10-24-library-wide-layout-review-design.md)

## 1. Context

The layout review brought all 57 components onto one visual language. It did not ask whether any
of them survive a narrow window. This does.

The target is 375px, the width of a phone. Everything below was measured in the Storybook showcase
at 375, 768 and 1024, not inferred from the stylesheets.

**Ten components already hold up at 375px.** The sidebar is the only one designed for it: it parks
off-screen with its handle showing, slides in as a 70px icon rail, and widens to a 220px overlay
when an item with children is tapped. The tabs scroll with chevrons and an edge fade. The data grid
scrolls horizontally and its header follows the body — verified, the header carries a matching
`translateX`. The top bar drops the app name and the user block below 768px. Login, breadcrumbs,
the group accordion, the scroll spy and the simple modal all fit.

**Three things break.**

| What                       | At 375px                                                           | Why it matters                                                                                                      |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Ribbon                     | List view needs 483px of content in 309px; detail view needs 357px | Refresh and Export are **gone**, not merely clipped: the bar neither wraps nor scrolls, and an ancestor clips it    |
| Multi-select, multi-editor | Two panes forced side by side, ~150px each                         | Not clipped, so nothing reports it; the grid reads "ID / Na…" and the right pane is a column of unlabelled icons    |
| Form input group           | Fits today                                                         | Latent: the label never wraps and sits in a `min-content` column, so a long translated label will squeeze the field |

The ribbon's breaking point is set by its content, not by the viewport. The detail bar needs 332px
of content and the list bar 528px. A bar of seven buttons is already cut around 600px — well above
any phone. **No media query can express this**, which is what rules out the obvious fix.

## 2. Decisions locked with the user

| Decision                 | Choice                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| Smallest supported width | 375px                                                                                                   |
| Ribbon behaviour         | Two stages: compact first, scroll with whatever still does not fit                                      |
| Implementation           | CSS only. No JavaScript, no measuring                                                                   |
| Group-to-menu collapse   | Out. It would need a per-group icon and priority — new public API every consumer must fill in           |
| Stacked modal panes      | Each pane scrolls itself, with a floor so neither can be squeezed away. The shared modal is not touched |

## 3. Approaches considered

**Scroll only.** Reuse what the tabs do. Nearly free, nothing is ever lost. Rejected as the whole
answer: the labels keep eating width, so a seven-button bar becomes a long scroll on a phone, and
the bar keeps its full 110px of height on an 812px screen.

**Measured cascade, the Office model.** A `ResizeObserver` measures the natural content width and
steps the bar down — labels off, then group captions off — turning on scrolling only if it still
does not fit. This is what Microsoft's ribbon, Syncfusion and DevExpress all do, and it reacts to
content rather than to a number chosen by hand. Rejected for now: it needs a measurement loop and
hysteresis, because hiding a label makes the bar fit, fitting brings the label back, and the bar
oscillates. The user asked for no JavaScript.

**Two stages in pure CSS. Chosen.** A container query on the ribbon switches it to a compact mode
below a fixed width; horizontal scrolling catches whatever still overflows. No measurement, no
loop, nothing to oscillate. Its weakness — that the threshold is a width and not a fit — is set out
under the risks below.

Industry precedent for the two-stage shape, for the record: DevExpress collapses groups and then
drops still-unfitting groups into a common overflow menu. The shape is standard; only the last
step differs, and ours is scrolling rather than a menu.

## 4. What the measurements changed

The first draft of this design assumed "compact" meant hiding button labels. **That is worth almost
nothing horizontally.** Measured on the list view at 375px: hiding every button label and group
caption moved the bar from 483px to 475px — eight pixels — while the height halved, 110px to 57px.

The reason is the icon. Font Awesome's fixed-width class renders the glyph at 1.25× its font size,
and at the large size that font is 36px, so the glyph box is 45px. The labels on these buttons are
45px or narrower, so the label never drove the width. **The icon is the horizontal lever; the label
is the vertical one.**

The library already has the smaller step and it works — the showcase's address list uses it:

|                            | Glyph font | Glyph box | Button width | Button height |
| -------------------------- | ---------- | --------- | ------------ | ------------- |
| Large (default)            | 36px       | 45px      | 69px         | 80px          |
| Small (`iconSize="small"`) | 24px       | 30px      | 46–62px      | 68px          |

At the small size the label does start to bind: "Refresh" is 46px against a 30px glyph, so that
button is 62px where "Edit" is 46px. So dropping labels pays off **only once the icon has already
shrunk** — which fixes the order of the compact step.

**What compacting will and will not buy.** Fully compact, a six-button bar still does not fit a
phone. Measured after the change: the list view's bar is 58px tall instead of 110px and still asks
for 184px of horizontal scroll, while the detail view's four-button bar now fits outright and
never scrolls. (The 40px this section first predicted for the height was optimistic — the icon
row and its padding floor it at 58px.) Scrolling is what guarantees nothing is lost; compacting is
what keeps the scroll short and gives a phone back 70px of vertical space.

This is stated plainly because it sets expectations: **stage 1 does not remove the need for stage 2
at 375px.** Both are load-bearing.

## 5. The design

### 5.1 Ribbon

Three changes, all in the ribbon's own stylesheet plus the button's.

**Establish a query container.** `container-type: inline-size` on the ribbon host, with an explicit
`width: 100%`. This is what lets the bar react to the room it actually has rather than to the
viewport — the detail bar and the list bar are in the same window at different widths, and the
window cannot tell them apart.

The explicit width makes the bar fill whatever the parent offers, which is what every usage here
already gets from a `flex flex-col` host.

**It does not prevent the collapse this section originally claimed it did.** Inline-size
containment stops the element contributing any width to its parent, so a parent that sizes to its
own contents — an inline-block, a float, a grid auto column — shrinks to nothing and `100%` of
nothing is nothing. Measured at 10px: padding and border, no buttons. That is inherent to
container queries, not a defect in this component: an element cannot both size to its contents and
be queried on its own width, and no declaration on it changes that.

So it is a constraint on the consumer rather than a guarantee from us, and it belongs in the
impact table below. The `CollapsesInAContentSizedParent` story is kept as the demonstration, so a
collapsed bar is one search away from its cause.

**Compact mode below the threshold.** Inside `@container (max-width: 36rem)`:

- the button icon drops to the small size (24px font, 30px glyph);
- the button label is hidden, and its text moves to the accessible name described below;
- the group caption is hidden;
- button and group padding tighten.

36rem — 576px — is a literal, not a token. A custom property cannot appear in a container query
condition, the same constraint the tokens guide already records for breakpoints. The value is
chosen so a bar that fits at its natural size is never compacted gratuitously: the list bar's
483px is the widest in the showcase, and 576px clears it.

**Scroll whatever is left.** `overflow-x: auto` on the ribbon host.

This section originally called for an edge mask as well, fading a clipped button instead of
guillotining it, the way the tabs do. **It shipped without one, and that was the right call.**

The tabs switch their fade on from two classes that TypeScript sets by measuring scroll position,
so it appears only when there is something to scroll to. Pure CSS has no scroll state to key on —
the one feature that would supply it, a scroll-driven animation, is absent in Firefox, which this
repo has no browserslist to rule out. So a CSS fade is unconditional, and an unconditional fade
dims whatever is at the edge whether or not anything lies beyond it.

Something always is. Every detail view in this library puts the Views button in the `[right]`
slot, `justify-between` pushes it flush to the edge, and the group inside it carries `pr-0`.
Measured at 375px, that bar fits with no scroll at all — so the fade would have dimmed a working
control, at rest, on every detail view on a phone, and eaten part of its focus ring with it. A
cosmetic hint is not worth obscuring a control.

What remains as the affordance: the scrollbar, touch, and a button visibly cut at the edge. That
last one is already the whole difference from the old behaviour, which was to lose the button with
nothing on screen saying so.

No chevrons, for the same reason: the tabs' are driven by measured scroll positions. Under "no
JavaScript" the affordances are the scrollbar, touch, and the fade.

The `[right]` slot currently sits opposite the groups under `justify-between`. Once the row can
scroll, "opposite" stops being meaningful at narrow widths; the slot joins the scrolling row at the
end rather than being pinned.

### 5.2 Two-pane modals

Both put their two panes side by side at every width, but **not by the same mechanism**, and one
fix does not cover both.

`lib-multi-editor` is the simple case: its body is `grid-flow-col`, so the panes land in columns.
Stacking it means switching the flow to rows.

`lib-multi-select` is not. Its body already sets `grid-flow-row` with `!important`; the
side-by-side comes from somewhere else entirely — a two-row grid in which both panes carry
`row-span-full`, so auto-placement puts the second one in a new column rather than a new row, with
the left pane's inner rows tied to the outer ones through a subgrid. Switching the flow there does
nothing. Stacking means dropping the row span, retargeting the row template, and unpicking the
subgrid.

Both are driven by a container query on the modal body at the same 36rem, rather than a media
query, because the modal's width comes from its `size` input and not from the window: a `size-sm`
modal is narrow on a desktop too, and should stack there as well.

**Stacking order**, my call, no strong precedent either way: the source pane stays on top and the
result or form pane goes below, because that follows the reading order of the task — you pick on
the left today, and you would pick first when stacked. Controls that act on a pane travel with it
rather than staying in a fixed bar.

**What gives vertically.** The modal body does not scroll: it is `overflow: hidden` inside a
content box capped at the viewport height, so anything that does not fit is clipped in silence.
Stacked on a 375×667 phone, once the modal's padding, header and footer are out, two panes share
roughly 450px — and the multi-editor's lower pane holds a form the consuming application projects,
whose height is their content and not ours to compress.

So each pane scrolls inside itself, and the stacked grid becomes two rows of `minmax(11rem, 1fr)`.
The floor is what stops either pane collapsing to nothing when the other one is tall; 11rem is a
header plus about three rows at the data grid's default row height of 41.6px, which is the least
that still reads as a list rather than as a sliver. Two floors come to 352px against the ~450px
available, so both panes are always usable and the leftover is shared evenly.

The existing 24rem minimum on the result grid is a desktop figure — two of those would be 768px —
and must not survive into the stacked layout.

**The shared modal is deliberately not touched.** Making its body scroll below the threshold would
have fixed a latent clipping bug in every dialog in the library at once, which is the stronger
argument on the merits; it was not chosen, because it reaches every consuming application's modals
and this change does not need to.

### 5.3 Accessibility

Hiding the label must not remove the accessible name. The ribbon button already takes an optional
tooltip and puts it on `title`, but that is optional and does not survive touch. The button gets an
`aria-label` derived from the translated label whenever the label is visually hidden, and the
`title` falls back to the label when no tooltip is given.

This is the one part of the change that is not purely stylistic, and it is the part most likely to
be skipped. It is not optional: an icon-only toolbar with no accessible names is unusable with a
screen reader.

Two cases the rule above does not reach, both settled here rather than left to the builder:

**The dropdown chevron.** A button with options renders a second control beside the first, and it
has no accessible name today. Once the bar is icon-only that is a nameless button sitting next to a
named one. It gets its name from the main button's label through `aria-labelledby`, not from a new
string. Naming it "more options" would read better, but the library layer ships no translation
files of its own — only the framework and shared layers do — so any new string becomes a key every
consuming application has to supply. A soft addition to the public API is too high a price for a
nicer name, and `aria-haspopup="menu"` is already there to say what the control does.

**A button with an icon and no label.** The label input defaults to empty, so this is reachable.
The name falls back to the tooltip; with neither, there is nothing to invent and the button stays
unnamed. Worth a lint-style note in the component docs rather than a runtime warning.

## 6. Risks and what is deliberately not solved

**The threshold is not fit-based.** This is the known cost of the chosen approach. A bar of nine
buttons needs roughly 700px and will be cut at 600px while still showing labels, because 600px is
above the 36rem threshold. The measured cascade considered and rejected above is the fix, and it
can be added later without changing any public API — the compact mode becomes a class the component
sets instead of a container query. Nothing in this design forecloses it.

**`container-type` creates a containing block** for `position: fixed` descendants. The ribbon
button's option list already renders through a CDK overlay rather than in place, so it is out of the
subtree; this must be confirmed, not assumed, because the same trap cost the tab panel a phantom
scrollbar during the layout review.

**Two scroll areas on one phone screen.** The cost of keeping the fix inside these two components:
a stacked modal has a scrollable pane above a scrollable pane, and a drag that begins in one does
not continue into the other. It is the known trade for not touching the shared modal. If it reads
badly in practice, the fallback is the shared-modal route, which is recorded above as considered
and declined rather than missed.

**The latent clipping bug in every other modal stays open.** Any dialog whose content exceeds a
phone's viewport is clipped in silence today, and this change does not address that. Worth its own
ticket; it is out of scope here.

**The mask and focus rings.** An edge mask clips the focused button's ring at the ends of the
scroll. To be checked with keyboard focus at both ends.

**Out of scope, recorded rather than fixed:** the form input group's long-label squeeze. It fits
with today's labels and the fix — letting the label wrap, or moving it above the field below a
threshold — is a separate decision about form layout, not about overflow.

**Not touched:** sidebar, tabs, data grid, top bar, login, breadcrumbs, accordion, scroll spy and
the simple modal. All measured as passing at 375px.

## 7. Verification

The acceptance test is mechanical, and it is the probe that produced the table at the top of this
document. It does not exist in the repo yet — the only Storybook tooling is the style snapshot,
which diffs computed styles and cannot see overflow — so **writing and committing it is part of
this work**, not a step someone performs by hand.

The rule it enforces: at 375px, no element may sit past the viewport's right edge unless some
ancestor is a horizontal scroller that can bring it into view.

Scope: the five app showcase stories, the ribbon story, and the two modal stories. The modals only
render once opened, so the probe clicks a story's opener where there is one; without that it would
pass them by measuring an empty page, which is worse than not checking at all.

One exclusion, and it needs to be written into the probe rather than remembered: **the data grid's
header is a false positive.** Its cells sit past the edge and no ancestor scrolls them, because the
header is kept in line with the body by a script-driven transform instead. Verified — scrolling the
body to 150px puts a matching `translateX(-150px)` on the header row. The grid passes.

Today the probe flags the ribbon and the button components inside it: seven element tags on the
list view, four on the detail view, plus the data grid's header on the detail view, which is the
exclusion above. Target after the change: zero, excluding that header.

Beyond that: the ribbon's height at 375px should be 58px rather than 110px; both modals should
show one pane per row; Jest tests for the accessible name; and the Storybook built, since a
published-API rename passes tests and lint and only fails in the Storybook build.

Stylesheet work needs `--skip-nx-cache`: the component stylesheets reference the theme by relative
path and the dependency graph cannot see it, so Nx will otherwise replay a stale build.

## 8. Public API and consumer impact

| Change                                                            | Type                 | Migration                                                                                                                                                                                            |
| ----------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ribbon compacts and scrolls below 36rem of its own width          | Changed, visual      | None. A consumer who wants labels at every width has no opt-out; add one only if asked                                                                                                               |
| Ribbon host becomes a query container                             | Changed              | Containment makes the host a containing block, so a consumer positioning something `fixed` **or `absolute`** inside the ribbon must check it                                                         |
| Ribbon host scrolls horizontally                                  | Changed              | Anything projected into the ribbon that used to paint outside it — an in-place popover, a sticky child, an absolutely positioned badge — is now clipped or scrolled by the new scroll container      |
| Ribbon host gains an explicit `width: 100%`                       | Changed              | None on its own                                                                                                                                                                                      |
| **A ribbon in a parent that sizes to its contents now collapses** | **Breaking, narrow** | Give the parent a width. An `inline-block`, float or grid auto column around a `lib-ribbon` must become a block, a grid cell or a stretched flex item. Inherent to making the host a query container |
| Ribbon host stops shrinking vertically (`flex-shrink: 0`)         | Changed, visual      | None in a column, where the list below absorbs the space. **In a flex _row_ parent the bar now overflows** instead of shrinking to fit: `width: 100%` plus no shrink leaves nothing to give          |
| `[right]` slot joins the scroll row when narrow                   | Changed, visual      | None                                                                                                                                                                                                 |
| Ribbon button gains an accessible name from its label             | Added                | None; strictly an improvement                                                                                                                                                                        |
| Dropdown chevron takes its name from the button's label           | Added                | None. Deliberately no new translation key — the library layer ships no translations and a key would be a string every consumer must supply                                                           |
| Two-pane modals stack below 36rem of modal width                  | Changed, visual      | None                                                                                                                                                                                                 |
| Each stacked pane scrolls itself, floored at 11rem                | Changed, visual      | None. Contained to the two components; `lib-modal` is unchanged                                                                                                                                      |
