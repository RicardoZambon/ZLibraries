# Changelog

All notable changes to `@zambon-dev/framework` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Upgrading?** Each release lists what changed and, under
> **⚠ Breaking Changes / Migration**, the concrete steps required to move to that version.
> When no migration is needed, that subsection is omitted.

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

- **Both tab scroll controls stay put while the strip overflows**, disabled at the end they point
  at rather than removed. Rendering them per-direction meant the one being reached for disappeared
  on arrival: the strip changed width under the pointer and the click landed on nothing, which is
  what made the arrows look like they sometimes did nothing.

- **The last tab no longer floats past the panel's rounded corner.** While a tab or a scroll
  control holds the strip's right edge, the panel's top-right corner is square, because the card's
  corner is up on the strip; rounding both left whatever sat at the edge standing over the sweep
  where the panel had curved away. With the tabs short of the edge the corner is the panel's again
  and stays round.

### ⚠ Breaking Changes / Migration

## [3.2.0] - 2026-09-25

### Changed

- **Tailwind CSS 4.** The component styles in this package are compiled against Tailwind 4 now.
  They are expanded at build time, so nothing in the published bundle changed shape -- but the
  application consuming it has to be on Tailwind 4 as well.

## [3.1.5] - 2026-09-25

### Fixed

- **The selected tab and the panel are the same colour again.** Both already named an 88% white,
  but the panel lays its fill over a backdrop it has blurred and the tab laid the identical fill
  over an unblurred one — two results from one token, and a visible seam between them. The tab
  carries the same blur now.

- **A tab reaching the right edge no longer sticks out past the panel's rounded corner.** The
  strip spans the panel's full width, so once the tabs filled it the last one's square corner was
  left standing over the point where the panel had already curved away. The strip carries the
  panel's corner now, which clips whatever reaches it; the scroll chevron does the same when it
  is the element at the edge.

- **The tab panel publishes `--surface-radius`** for whatever sits directly inside it — the
  container's radius minus its own padding and border, which is the value that keeps an inner box
  looking parallel to it. `@zambon-dev/library`'s grid and group container read it.

### ⚠ Breaking Changes / Migration

**Requires Tailwind CSS 4**, and `@zambon-dev/shared` 5.x, which ships the theme. The migration
steps are in the `@zambon-dev/shared` changelog for this release; there is nothing specific to
this package to do beyond following them.

## [3.1.4] - 2026-09-25

### Fixed

- **The peer range on `@zambon-dev/library` now matches the version this package is built against.**
  It still asked for `^2.0.0` after the library moved to 3.x, so installing `framework` and
  `library` together at their current releases failed `npm install` with ERESOLVE. An application
  could only get past it with `--legacy-peer-deps` or an override, both of which switch off the
  peer checking that would have caught a genuine mismatch.

## [3.1.3] - 2026-09-24

### Fixed

- **A confirm or error modal no longer adds a gap below the page.** Both render nothing but a
  fixed-position modal, yet their host still counted as a child in the parent's layout, so a flex
  column with a gap reserved a slot for it under the last visible element -- which is why a detail
  view and some list views sat further from the bottom of the window than the rest.

## [3.1.2] - 2026-09-22

### Fixed

- **A filtered view no longer loses its Filter and Clear filters state when another details tab is
  opened.** The grid stayed filtered while the ribbon came back as though nothing were filtered, so
  the only way out was to filter again. Opening a list view never did it -- which is what made the
  behaviour look arbitrary.

  Every details tab keeps its router subscription alive, including the ones the reuse strategy has
  detached, and the lookup that finds the active details route reads the router, which names
  whichever tab the navigation went to. A detached tab therefore adopted the incoming tab's base
  path and switched itself to that tab's view, tearing its own ribbon down and building a fresh
  one -- and the new buttons knew nothing of the filter still held by the grid. A list view is not
  a details route, so the lookup found nothing and the tab was left alone.

  A tab now answers only to navigations matching its own route definition, which still covers the
  one navigation that legitimately changes its path: the redirect from `/new` to `/:id` after a
  save.

## [3.1.1] - 2026-09-22

### Fixed

- **Switching views in a details tab no longer moves the buttons to the wrong view.** Opening a
  second view showed the first view's buttons instead of its own, and going back to the first view
  left it with no buttons at all -- on the employee screen, Histórico showed the Detalhes ribbon and
  Detalhes then showed an empty one.

  1.4.1 taught a tab to claim a ribbon published before its view had been named, which is what a tab
  opened straight at a non-default view needs. It claimed on every naming, though, and the empty id
  is not a spare bucket: it is the default view's own id, since that view is the one whose URL
  carries no sub-path. From the second switch onwards the template being claimed belonged to the
  view being left. Only the first naming may claim it now.

  Also released as 1.4.2 on the 1.4.x line, for applications still on Angular 19.

## [3.1.0] - 2026-09-21

### Added

- **Tabs close on middle click**, and with `Delete` while a tab has focus.
- **The tab strip scrolls.** It was `overflow: hidden`, so once the tabs were wider than the bar the
  ones past the right edge could not be reached at all. Selecting a tab also scrolls it into view.
- **Scroll controls at each end of the strip**, shown only while there is something to scroll to.
- **A vertical mouse wheel over the strip scrolls it horizontally**, so a plain wheel mouse can
  reach an off-screen tab without going to the controls. Trackpad and `Shift`+wheel gestures, which
  already produce horizontal deltas, are left to the browser.

### Changed

- **Tabs restyled to match the sidebar's glass**: a translucent, blurred, rounded panel, with the
  active tab and the content sharing one fill so they read as a single card. Every colour, radius
  and dimension comes from a `--tabs-*` custom property now, so the look can be retuned without
  touching the component. Breadcrumbs follow the same tokens.

  The glass is painted on a `::before` layer rather than on the panel itself. `backdrop-filter`
  makes an element the containing block for its `position: fixed` descendants, and views render
  hidden, viewport-width modal overlays inside the panel — filtering it directly pulled those into
  its scroll width and produced a phantom horizontal scrollbar.

- **The tablist is a single tab stop.** `Tab` reaches the selected tab and the arrow keys move
  between tabs from there, with `Home`/`End` for the ends. Previously every tab was its own tab
  stop and there was no arrow-key support.
- **The panel is a real `tabpanel`**, with `aria-controls` on each tab and `aria-labelledby` on the
  panel, so assistive technology can tell which panel a tab owns.
- **Close buttons are named after their tab** — "Close Acme Industries" rather than six identical
  "Close tab". `Tabs-CloseTab` takes a `title` parameter now; if you have overridden that key in
  your own translations, add `{{title}}` to it.
- **A tab keeps its width while its title loads.** The spinner sits beside the label instead of
  replacing it, so the strip no longer reflows as each title resolves.
- **Tabs compress before the strip scrolls**, down to `--tabs-item-min-width`, so a few more fit
  before any of them goes off screen. Overflowing tabs fade out at the edges instead of being cut
  off mid-tab.
- **The selected tab is pulled back into view when the strip narrows**, not only when the selection
  changes. Resizing the window or collapsing the sidebar used to be able to leave you looking at a
  panel whose tab was nowhere on screen.
- Breadcrumb separators are drawn in CSS rather than as a FontAwesome glyph codepoint, which was
  tied to a specific FontAwesome major.

## [3.0.1] - 2026-09-21

- Maintenance release (no consumer-facing changes were documented).

## [3.0.0] - 2026-09-21

- Maintenance release (no consumer-facing changes were documented).

## [2.0.0] - 2026-09-21

### Changed

- **Accessibility.** `TabsComponent` renders proper `tablist`/`tab` semantics with `aria-selected`,
  its tabs are keyboard-activatable and the close control is a labelled `<button>`.
  `TabBreadcrumbsComponent` entries are focusable and activate with `Enter`/`Space`.
- Added the `Tabs-CloseTab` translation key (en, pt) for the tab close button's accessible name.

## [1.4.3] - 2026-09-21

### Fixed

- **Host styles now apply.** `DefaultTabViewComponent`, `DefaultDetailsTabViewComponent`,
  `TabBreadcrumbsComponent` and `ButtonFiltersComponent` declared their host block as
  `:host-context {` with no argument, so every rule inside was silently dropped. Visible effects:
  no gap between the ribbon and the view below it, and breadcrumbs with neither their bottom rule
  nor their spacing. They are `:host {` now.

- `ButtonFiltersComponent.validateFormFunction` was typed `Function`, which accepted any
  function-like value. It is now `() => void`, matching how it is actually invoked. Consumers
  passing a function that takes arguments or returns a value will now see a type error.
- Removed empty constructors from `ConfirmModalComponent` and `TabViewService`.

- `DefaultDetailsTabViewComponent` imported `ButtonViewsComponent` through the `buttons` barrel,
  which re-exports `./legacy`, whose buttons import the `views` barrel, which re-exports this
  component. The cycle left one of the component's own imports undefined at evaluation time and
  broke any attempt to instantiate it outside a fully booted application. It now imports the
  button by its concrete path.

## [1.4.2] - 2026-09-20

### Fixed

- Declared `rxjs` in `peerDependencies`; it is used throughout the package but was never declared.
- Added a README to the published package.

### ⚠ Breaking Changes / Migration

**Requires Angular 22.** Every `@angular/*` peer range moved from `^19.1.0` to `^22.0.0`, and
the package is built and tested against Angular 22.1 with TypeScript 6.0.

Upgrade your application to Angular 22 first — Angular does not support skipping majors, so go
19 → 20 → 21 → 22 with `ng update`. Angular 22 also requires Node.js 22.22.3 or newer.

**Requires `@zambon-dev/library` 2.x.** The peer range moved from `^1.6.0` to `^2.0.0`. See the
library changelog for the `FormInputComponent` output renames; if your application binds those
outputs directly, apply that migration too.

## [1.4.1] - 2026-09-19

### Fixed

- **A details tab with child views no longer loses its ribbon after you visit another tab and come
  back.** Every button of the child view disappeared -- filter, clear filters, refresh, export --
  while the grid below carried on showing its filtered rows, and nothing brought them back short of
  switching views.

  A child view publishes its ribbon from `ngAfterViewInit`, and the router only names the active
  view afterwards, so the first template of a tab was cached under an empty id. Looking it up later
  under the real name missed and emptied the ribbon. It never recovered because a tab being
  re-activated has its child **re-attached** rather than re-created, so `ngAfterViewInit` does not
  run again and nothing publishes a second time.

  A list screen was unaffected: it has no view switching, so the lookup never happened.

## [1.4.0] - 2026-09-16

### Changed

- **`framework-button-filters` no longer submits the labels of catalog selections.** A filters
  form reads its values straight off the form, so the display control `lib-catalog-select` adds
  for its own use went to the backend beside the real filters — a request filtering by employee
  carried `employeeName: "753 - ADEMILSON LOPES MAGALHAES"` next to `employeeID: 125`.

  They were ignored, being filters no service declares, but the day one does filter by a name it
  would receive the formatted label rather than the stored value and quietly match nothing.

  The labels are still **kept** for the modal: reopening it patches them back into the form, and a
  catalog select backed by a `searchEndpoint` cannot recover its text from the identifier alone —
  it only resolves a display out of a local entries list. Dropping them from what is stored would
  have left the field showing a selection with nothing written in it.

### ⚠ Breaking Changes / Migration

- **Upgrade `@zambon-dev/library` together with this release.** The peer range moved from
  `^1.0.0` to `^1.6.0`, because `framework-button-filters` now imports `DisplayControls` from it.
  On an older library that export does not exist, and the filters button fails — at build time if
  the bundler checks exports, otherwise the first time a filter is submitted. The old range would
  have let npm resolve that combination without a word of warning.

- **A backend no longer receives the label of a catalog selection.** If one of your services
  filters by a key that a `lib-catalog-select` uses as its `displayControlName` — the `xxxName`
  that comes paired with an `xxxID` — that filter now arrives empty and the query stops narrowing,
  silently returning more rows than before rather than failing.

  To check, take each filters form and, for every `lib-catalog-select` in it, note the
  `displayControlName`. Then look for a `TryFilter` on that name in the service behind the list.
  Any hit has to move to the identifier instead: the label was never the stored value — it is what
  the catalog chose to display, so filtering by it was already matching on formatting.

## [1.3.1] - 2026-09-10

### Fixed

- **Returning to an already-open tab no longer crashes with `Maximum call stack size exceeded`.**
  It affected any screen whose route nests two empty-path levels — the shape every list screen uses:
  `path: ''` with `DefaultTabViewComponent`, and a child `path: ''` with the list component.

  `CustomReuseStrategy` keyed its detached-view cache on `route.component.name`, and a production
  build renames every class: esbuild wraps each component as `X = (() => { class i { } return i; })()`,
  so the name is one mangled letter that the whole chunk shares. An empty path contributes no URL
  segment, so both levels also resolved to the same URL — which left the two cache keys identical.
  Storing one handle overwrote the other, both route levels were then handed the same detached view,
  and Angular blew the stack building a router state whose node was its own descendant.

  The key is now built from the component's **identity** and the route's depth rather than its name.
  Applications need to change nothing. Worth knowing when reading old reports of this crash: it only
  ever reproduced in a minified build — `ng serve` keeps real class names — and only on the screens
  whose chunk happened to mangle to the same letter as the framework's, so a rebuild could move the
  symptom from one screen to another.

## [1.3.0] - 2026-07-30

### Added

- `framework-button-export` now accepts a **`defaultOption` `@Input()`** — the index into `options`
  exported when the main button itself is clicked, defaulting to `0` (Excel). This mirrors the input
  `framework-button-save` already had; `-1` means "no default" and makes the button only toggle its
  dropdown. See **Changed** below for the behaviour this changes by default.

### Changed

- **`framework-button-export` now exports on a single click**, to Excel by default, instead of only
  opening its format menu. `RibbonButtonComponent` treats a `defaultOption` of -1 as "no default" and
  merely toggles the dropdown; Export never set one, so the common case took two clicks while
  `framework-button-save` (which sets 0) took one. Export now sets 0 as well, through the new
  `defaultOption` `@Input()`. The format menu is unchanged and still reachable from the button's
  dropdown caret, so every format remains available.

### Fixed

- **Routed list views now fill the available height automatically.** `DefaultTabViewComponent` gave its
  routed child no layout and `lib-data-grid` has no `flex-grow` of its own, so a grid collapsed to its
  `rowsToDisplay × rowHeight` minimum with empty space beneath it, and every consuming list component
  had to repeat the same `:host { flex; flex-grow; overflow: hidden }` + `lib-data-grid { flex-grow }`
  stylesheet to compensate. `TabViewList` now carries a `framework-view-list` host class — inherited by
  every subclass — which `DefaultTabViewComponent` styles, so **consuming apps can delete those
  per-component stylesheets**. Routed screens that do not extend `TabViewList` (forms, dashboards) are
  unaffected.

- `framework-default-tab-view` and `framework-default-details-tab-view` no longer log
  `NG0100: ExpressionChangedAfterItHasBeenCheckedError` on every render in development mode.
  Both views assigned a placeholder ribbon template from `ngAfterViewInit` — after Angular had
  already checked the ribbon's `*ngTemplateOutlet` binding — which tripped the dev-mode change
  detection check one to three times per load. The placeholder rendered no content, so it has
  been removed and the outlet is now left empty until a view publishes its own `#ribbon`
  template. The rendered output is unchanged, and ribbon buttons still appear immediately for
  list and detail screens.

### ⚠ Breaking Changes / Migration

None — nothing has to change for your app to compile against this release. Two behaviour changes to
check, and one optional cleanup:

- **Absolutely-positioned content inside a routed list view is now clipped.** The full-height layout
  applied to `framework-view-list` includes `overflow: hidden`, so a popover, dropdown or tooltip that
  a list screen renders with `position: absolute` inside its own host is now cut off at the host's
  edges. Apps that had already written the equivalent `:host { overflow: hidden }` stylesheet by hand
  are unaffected — the clipping was already in place there. Only list screens that had no such
  stylesheet change. Fix by portaling the content out of the host (CDK Overlay, as `lib-catalog-select`
  does) rather than relying on `position: absolute`.
- If you relied on `framework-button-export`'s first click opening the format menu rather than
  exporting, set `[defaultOption]="-1"` to restore that behaviour.
- _Optional cleanup:_ components extending `TabViewList` can now delete their
  `:host { display: flex; flex-grow: 1; overflow: hidden }` / `lib-data-grid { flex-grow: 1 }`
  stylesheets — `DefaultTabViewComponent` styles the inherited `framework-view-list` host class.

## [1.2.1] - 2026-07-29

### Fixed

- Lint configuration only: the library's ESLint selector rules now accept the `framework-` prefix
  that every `@framework` component already uses. They previously still expected the Angular
  scaffold's `lib` prefix, so the entire component surface reported
  `@angular-eslint/component-selector` errors. No selector was renamed, and no published API or
  runtime behavior changed — nothing to do on upgrade.

### ⚠ Breaking Changes / Migration

None.

## [1.2.0] - 2026-07-24

### Added

- `AppConfig` now accepts optional application metadata through a second `options` argument:
  `appName`, `companyName`, `environment`, `logoUrl`, `version`, `notificationsEnabled`, and
  `notificationsUrl`. These are consumed by the shared application shell (top bar + navigation).
  Existing `new AppConfig(baseUrl)` calls continue to work unchanged (`notificationsEnabled`
  defaults to `false`, other new fields to empty strings).

### ⚠ Breaking Changes / Migration

None.

## [1.1.1] - 2026-06-20

### Fixed

- `framework-button-export` now forwards its `iconSize` input to the underlying ribbon button,
  so setting `iconSize` correctly resizes the export button's icon. Previously the input was
  ignored and the icon always rendered at the default size.

## [1.1.0] - 2026-06-02

- Baseline release: the changelog starts being tracked from this version. Earlier history is
  available via [GitHub Releases](https://github.com/RicardoZambon/ZLibraries/releases) and the
  `framework-v*` tags.

[Unreleased]: https://github.com/RicardoZambon/ZLibraries/compare/framework-v3.2.0...HEAD
[3.2.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v3.2.0
[3.1.5]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v3.1.5
[3.1.4]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v3.1.4
[3.1.3]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v3.1.3
[3.1.2]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v3.1.2
[3.1.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v3.1.1
[3.1.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v3.1.0
[3.0.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v3.0.1
[3.0.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v3.0.0
[2.0.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v2.0.0
[1.4.3]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.4.3
[1.4.2]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.4.2
[1.4.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.4.1
[1.4.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.4.0
[1.3.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.3.1
[1.3.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.3.0
[1.2.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.2.1
[1.2.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.2.0
[1.1.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.1.1
[1.1.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.1.0
