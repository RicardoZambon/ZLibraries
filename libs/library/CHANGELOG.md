# Changelog

All notable changes to `@zambon-dev/library` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Upgrading?** Each release lists what changed and, under
> **⚠ Breaking Changes / Migration**, the concrete steps required to move to that version.
> When no migration is needed, that subsection is omitted.

## [Unreleased]

### Added

- **`lib-catalog-select` takes a `searchable` input.** A catalog of one or two entries is a picker,
  not a search: the text box invites typing that only gets in the way, and the minimum-length rule
  hides the very entries the user opened the field to choose from. Setting `[searchable]="false"`
  leaves the input read-only to the keyboard while the dropdown still opens on click and the clear
  button still works.

  It differs from `readOnly`, which means the value cannot be changed at all and takes the clear
  button away. It does not suit an endpoint that answers `shouldUseCriteria`: that endpoint
  returns nothing until it is given criteria, and there would be no way left to type any.

- **`lib-catalog-select` exposes `refresh()`.** The entries are fetched once, when the field
  initialises, so a screen that changes the data behind the catalog -- granting a role, moving an
  employee -- kept offering the list it read before the change. Calling `refresh()` re-reads the
  catalog, including whether its endpoint now requires search criteria.

### Changed

### Deprecated

### Removed

### Fixed

- **`lib-catalog-select` no longer reports "no results" when its endpoint arrives after the field
  does.** A screen that reads the endpoint off a model it loads over HTTP binds an empty string
  first. The field initialised against that, showed _no results found_ on the first open, and only
  filled in once the user typed something and cleared it again.

  With no endpoint the component takes its static-list path, finds an empty list and latches the
  message. `searchEndpoint` was a plain input, so nothing re-ran the search when the real value
  landed -- unlike `entriesList` and `filters`, which have always refreshed on change. It is now a
  setter and re-reads the catalog, treating a new endpoint as a new catalog rather than carrying
  over what the previous one reported about needing search criteria.

### ⚠ Breaking Changes / Migration

## [3.1.2] - 2026-09-22

### Fixed

- **Group headings in a narrow navigation panel no longer spill their label past the edge.** On a
  window under 768px the panel opens at its collapsed width, but each group still printed its full
  label -- clipped mid-word against a bar with no room for it -- where it should show the short
  divider the collapsed panel uses.

  The width that widens the panel is declared inside the `md` query, so below that breakpoint the
  panel stays narrow whatever its expanded class says. The heading, though, was keyed off that
  class rather than the width it actually got. It now follows the width, with the overlay still
  excluded -- that one does widen the panel at any size.

## [3.1.1] - 2026-09-22

### Fixed

- **`lib-catalog-select` now offers its clear button for a value it did not see arrive.** A field
  restored from a saved filter showed the value and its label but no way to empty it, so the only
  escape was to clear the whole filter and start again.

  The button asked an internal field that is written when the component itself takes the value --
  a pick in the dropdown, or the initial read in `ngOnInit`. A form patched after the component
  has initialised, and patched without an event, reaches the form control and the display and
  nothing else. The button now asks the form control, which is the value that actually counts.

## [3.1.0] - 2026-09-21

### Added

- Added the --tabs-* design tokens to the published stylesheet. They style @zambon-dev/framework's
  tab strip; they live here because this package owns the shared token layer, alongside --sidebar-*.

## [3.0.1] - 2026-09-21

- Maintenance release (no consumer-facing changes were documented).

## [3.0.0] - 2026-09-21

- Maintenance release (no consumer-facing changes were documented).

## [2.0.1] - 2026-09-21

### Changed

- `RibbonComponent`, `FormGroupComponent` and `GroupContainerComponent` now use
  `ChangeDetectionStrategy.OnPush`. They render from their inputs only, so behaviour is
  unchanged, but consuming applications no longer check them on every change detection pass.

## [2.0.0] - 2026-09-21

### Changed

- **Accessibility.** Every interactive element that previously responded only to a mouse is now
  reachable and operable by keyboard. `RibbonButtonComponent` (button, dropdown toggle and each
  option), `GroupAccordionComponent`, `GroupScrollSpyComponent`, `SidebarItemComponent` and the
  `MultiSelectComponent` result grid gained focus, `Enter`/`Space` activation and the matching ARIA
  roles and state. `CatalogSelectComponent` status rows are now `role="presentation"`; its retry
  action is a real button.
- `MultiEditorComponent` and the multi-select result grid render their actions as `<button>`
  rather than `<a>`. They are styled identically but now honour `disabled` natively.

## [1.6.4] - 2026-09-21

### Fixed

- **Host styles now apply.** Ten components declared their host block as `:host-context {` with no
  argument. That is not a valid host selector, so every rule inside was silently dropped -- the
  ribbon never became a flex row (its buttons stacked vertically), `lib-group-container` never got
  its card background or border, and `lib-data-grid`, `lib-form-group`, `lib-group-accordion`,
  `lib-group-scroll-spy`, `lib-catalog-select`, `lib-ribbon-group`, `lib-ribbon-button` and the
  multi-select result grid all rendered unstyled at the host level. They are `:host {` now.

- `CatalogSelectComponent` subscribed to its `forkJoin` with an empty handler; it now subscribes
  without one. No behavioural change.

## [1.6.3] - 2026-09-20

### Fixed

- Declared `ngx-resize-observer` and `rxjs` in `peerDependencies`. `DataGridRowComponent` imports
  `ngx-resize-observer` at runtime, but the package was never declared, so installing
  `@zambon-dev/library` on its own left the dependency unresolved.
- Added a README to the published package.

### ⚠ Breaking Changes / Migration

**Requires Angular 22.** Every `@angular/*` peer range moved from `^19.1.0` to `^22.0.0`, and
the package is built and tested against Angular 22.1 with TypeScript 6.0.

Upgrade your application to Angular 22 first — Angular does not support skipping majors, so go
19 → 20 → 21 → 22 with `ng update`. Angular 22 also requires Node.js 22.22.3 or newer.

- Requires `ngx-resize-observer` 4.x (the Angular 22 line); the peer range moved from `^3.0.0`.

**`FormInputComponent` outputs renamed.** Four outputs were named after native DOM events. Because
`<lib-form-input>` is a real element, `(change)` and `(input)` fired a consumer's handler twice --
once from the native event bubbling out of the inner control, once from the component -- and
`(blur)`/`(focus)` shadowed the native events. All four are typed `any`, so TypeScript could not
catch the mismatch.

Rename the bindings in your templates:

| Before     | After            |
| ---------- | ---------------- |
| `(blur)`   | `(blurred)`      |
| `(change)` | `(changed)`      |
| `(focus)`  | `(focused)`      |
| `(input)`  | `(inputChanged)` |

`(fixedValueChanged)` is unchanged, but its payload type is now `string` instead of `any` --
matching what it always emitted.

If you were relying on the double-fire, expect one call per event now instead of two.

## [1.6.2] - 2026-09-20

### Fixed

- **A `lib-data-grid` column with no room from the start no longer drags its heading out of line.**
  1.6.1 removes the heading of a collapsed column, but only once that column had measured a real
  width at some point. A column that never has any room does not, so it kept a heading over nothing
  and pushed every column to its right along -- up to 263px on a fourteen-column screen, which is
  the same drift 1.6.1 set out to remove.

  Whether a zero is believable is now settled by the row rather than by what the column measured
  before: if the row has a width the layout is live, so a column reporting zero really has
  collapsed.

- **`lib-data-grid` headings no longer stay behind after you revisit a tab.** Re-activating a
  detached tab puts the grid back in the page with its horizontal scroll at the start again, and no
  scroll event follows to say so, so the headings kept the offset they had when you left: on a grid
  scrolled 300px every heading sat 300px away from its column. The header now reconciles with the
  body whenever the grid is re-measured, which is what re-inserting it triggers.

## [1.6.1] - 2026-09-19

### Fixed

- **`lib-data-grid` headings now sit over their own column.** On a grid with many columns each
  heading drifted further from its cells than the last -- up to 263px on a fourteen-column screen --
  and scrolling sideways separated them completely.

  The body lays the columns out as a CSS grid inside the CDK viewport; the heading row is a flex
  row outside it that copies each column's measured width. Four things pulled the two apart:

  - The heading cells could **shrink**, so once the columns together were wider than the view every
    heading was compressed a little and the error accumulated across the row.
  - The heading row **did not follow the body sideways**. The rows scroll inside the viewport and
    the headings simply stayed where they were.
  - A column was **measured once and never again**, while the body keeps resizing its
    `minmax(x, min-content)` columns as virtual scrolling brings different content into view.
  - A column measured at **zero** -- a `1fr` column collapsed for want of room -- left its heading
    with no width at all, so it kept its text width and shoved everything to its right along.

  Headings are now fixed to the measured width, translate with the body's horizontal scroll, track
  every resize, and a heading whose column has collapsed is removed rather than left taking a gap
  the body does not have. Measured in a running application the drift is zero across every column,
  at rest and scrolled.

  A column that declares no `size` is laid out as `minmax(0, 1fr)`, which is free to collapse. If
  one of yours does, its heading now goes with it rather than staying behind as a label over
  nothing. Give such a column a real minimum -- `size: 'minmax(8rem, 1fr)'` -- to keep both on
  screen.

## [1.6.0] - 2026-09-16

### Added

- **`DisplayControls`**, which records the form controls that exist only to show a catalog
  selection's label. `lib-catalog-select` works in pairs — `controlName` holds the identifier,
  `displayControlName` holds the text — and it creates the second itself when a screen does not
  declare one, so a form carries controls nobody wrote down. It now marks whichever control it
  drives as its display, and `framework-button-filters` reads that mark to keep those out of what
  it submits.

  The mark is held in a `WeakSet` keyed by the control instance, not by its name: two forms may
  each have an `employeeName`, and only the one a catalog select drives is a display control.
  Nothing about an application changes — declaring the display control yourself still works, and
  it is marked just the same.

## [1.5.0] - 2026-09-09

### Added

- **`SidebarConfigs.shouldDeriveAreasFromRootMenus`** — derive region headers from the menu tree
  instead of from `SidebarMenu.region`. Off by default, so nothing changes until you opt in.

  With it on, a top-level menu that has children **and no URL** stops being a collapsible node and
  becomes an area header, with its children rendered flat beneath it as top-level items — icons
  included. A top-level menu that has its own URL stays an item, and a parent that carries a URL
  stays collapsible, so only the menus that were already acting purely as groups change shape.

  The point is where the grouping lives. `region` is a label repeated on every item that belongs to
  a group, matched by exact string equality: a typo silently splits one area into two, and the
  area has no row of its own to carry an order or a translation. Derived from the tree, the area
  _is_ a menu row — it already has a translated label and an order — and nothing has to be
  duplicated across its items.

  The children of an area are fetched **eagerly**, at load, because they are rendered without a
  click and the lazy load a collapsible parent relies on would never fire. That is one extra
  request per area. `region` keeps working exactly as before for anyone who prefers it; the two
  mechanisms are independent and the flag chooses between them.

- **`SidebarService.loadChildrenFor(parentMenu)`** — loads a parent’s children and returns them as
  an observable, for callers that need them before the user clicks. `loadChildren` is unchanged: it
  is still the fire-and-forget variant that raises `childrenLoading` and `childrenFailed`, and it
  now delegates to this one.

### ⚠ Breaking Changes / Migration

None. `shouldDeriveAreasFromRootMenus` defaults to `false`, so a sidebar keeps grouping by
`region` and keeps rendering top-level parents as collapsible nodes until you set it.

## [1.4.1] - 2026-09-08

- Maintenance release (no consumer-facing changes were documented).

## [1.4.0] - 2026-09-08

### Added

- **Sidebar menu items can now open an external destination instead of an internal route.**
  `SidebarMenu` gained an optional `openMode` (`SidebarMenuOpenMode`): `Internal` (the default),
  `ExternalNewTab`, or `ExternalEmbedded`. Read it through the exported
  `toSidebarMenuOpenMode(menu.openMode)` helper rather than comparing the field directly — the
  value is deserialized straight from your menu endpoint, so the helper accepts the mode as a
  camelCase string, as a case-insensitive variant of it, or as the enum ordinal an ASP.NET Core
  enum property serializes to. Anything unrecognized — an omitted field from a backend that
  predates this feature, `null`, or a mode a newer version adds — degrades to `Internal`, so a
  menu you have not touched behaves exactly as it does today.

- **`SidebarService.menuExternalUrlSelected`** — a separate output carrying the items whose mode
  is not `Internal`. They are deliberately **not** announced on `menuUrlSelected`, which keeps its
  existing contract: the URL it carries is always an Angular route. Acting on external items needs
  `@zambon-dev/shared` (which opens the browser tab or the embedded view), or your own subscription
  to the new output. Until then an external item highlights and does nothing, rather than sending
  `https://…` to the router.

- **`SidebarConfigs.externalLinkText`** — the tooltip on items that open in a new browser tab.
  Defaults to `Opens in a new browser tab` and, like `errorText` and `loadingText`, is rendered
  as-is rather than through the translate pipe, so pass an already-localized string.

### Changed

- **Selection now follows the open mode.** An item that opens in a new browser tab is treated as an
  action rather than a destination: it takes no selection pill and, importantly, does not clear the
  selection of the view the user is still looking at. Items that open embedded become real
  application tabs and keep today’s selection behaviour exactly. A parent that also carries a URL
  still expands, so it cannot become impossible to open.

- **Items that open in a new browser tab show a trailing outbound glyph.** It sits in the same
  absolutely-positioned slot as the parent chevron, so a long label still ellipsises inside the
  anchor and the collapsed rail is unchanged, and it fades in with the sidebar like the other
  affordances. Embedded items get no glyph — they stay inside the application. Items with no
  `openMode`, or with `openMode: Internal`, render exactly as before.

### ⚠ Breaking Changes / Migration

None. `openMode` is optional, so a backend that does not send it produces today’s behaviour, and
`menuUrlSelected` is unchanged for internal items. If you subscribe to `menuUrlSelected` yourself
and want external items too, add a subscription to `menuExternalUrlSelected`.

## [1.3.2] - 2026-07-30

### Added

- **Storybook: `Data Grid/Data Grid ▸ Multi Select Tall Rows` story** — multi-selection over rows
  taller than the default `rowHeight` (41.6px), the height a row needs once it shows a thumbnail.
  Misalignment in the selection column is obvious at that height, so this is the story to check the
  selection checkbox against. Development-only: stories are excluded from the package build.

### Changed

- **`lib-ribbon` now hides itself when it contains no visible buttons.** A screen with no ribbon
  actions — a dashboard, or any view that projects an empty `#ribbon` template — previously still
  rendered the bar's border, background and padding around nothing, wasting vertical space at the top
  of the page. This mirrors `lib-ribbon-group`, which already hid itself when none of its children
  were visible. Ribbons with at least one visible group are unaffected. See
  **⚠ Breaking Changes / Migration** below.

### Fixed

- **`lib-data-grid`'s multi-selection checkbox is now vertically centred in the row.** The checkbox is
  styled with `vertical-align: super`, which lifts it off the middle of its line box — roughly 6px at
  the default font size. At the default `configs.rowHeight` (41.6px) the drift is easy to miss, but on
  taller rows (say `rowHeight: 56` for a row showing a thumbnail) the checkbox visibly hugged the top
  of the row while the text columns stayed centred. The selection cell now lays its checkbox out as a
  flex item, so it is centred by the box model and `vertical-align` no longer applies to it. The cell
  is also tagged with a `selection` class, mirroring the header's `header-cell selection`. Horizontal
  placement is unchanged, and no consumer changes are required.
- **Form inputs no longer render a stray bordered box when `type` is set as a static attribute.**
  Angular keeps static attributes in the DOM even when a directive consumes them as an `@Input()`, so
  `<lib-form-input-group type="checkbox">` left a `type="checkbox"` attribute on the host element —
  where `@tailwindcss/forms`' tag-agnostic `[type="checkbox"]` base rules styled the host itself as a
  checkbox (1px border, white fill, `height: 1rem`), drawing an empty-input box around the field row
  and tinting its icon. `FormInputGroupComponent` and `FormInputComponent` now clear the attribute via
  a host binding. This affects every value of `type` (`checkbox`, `date`, `number`, `password`, …);
  both `type="checkbox"` and `[type]="'checkbox'"` now render identically, so existing call sites are
  fixed with no changes required.
- **`lib-multi-editor` no longer discards rows the user did not type into.** `MultiEditorDataset.newData()`
  exists so implementations can pre-fill a new row, but `onNewClick` reached the form through
  `reset()` + `patchValue()`, which leaves it pristine — and the change tracker only records a row
  while `formGroup.dirty`. Pre-filled values were therefore shown in the grid and then dropped from
  the save batch. The visible symptom was worse than lost defaults: adding several rows and editing
  only the last one saved just that row, because `onSaveClick` validates the current selection only,
  so the earlier rows silently vanished on refresh. `newData()`'s values are now registered when the
  row is added.
- **`lib-catalog-select` no longer renders an empty caption after a form reset.** `FormService.resetForm()`
  clears every control and then patches the model back, so the component receives the value it already
  held. It skipped refreshing the caption in that case, on the assumption that an unchanged value means
  the caption is still on screen — but the reset had emptied the display control a moment earlier. The
  field therefore rendered blank whenever the stored value equalled the control's initial value, which
  is why it only ever showed on the entry the form defaults to: a `nonNullable` control declared as
  `new FormControl(0)` bound to an enum whose first member is `0`, for instance. Values differing from
  the initial one refreshed normally and always looked right, which made the fault read like a
  translation or data problem rather than a reset one. The caption is now rewritten whenever it has
  drifted from the selected entry, so the value alone no longer decides. Selects backed by a
  `searchEndpoint` are unaffected, since their caption comes from the server-side selection rather than
  `entriesList`. No consumer changes are required.

### ⚠ Breaking Changes / Migration

`lib-multi-editor` now sends rows that `newData()` pre-filled but the user never edited. Nothing to do
if your `newData()` returns an empty object (`{}`) — the common "blank row" convention — since a
value-less row is still skipped and the posted batch is byte-for-byte what it was before. If your
`newData()` _does_ return field values, those rows now reach `saveData()` where they were previously
dropped, so a batch may contain entries it did not before; verify your backend rejects or defaults
them as you expect.

`lib-ribbon` now hides itself when it has neither a visible `lib-ribbon-group` nor any other
projected content. No action needed if your ribbons use groups (the normal case). The rule is a
global selector at specificity (0,1,2), so overriding it requires `!important`. Because the bar can
now appear and disappear rather than merely resize, anything positioned relative to the ribbon may
shift when a button's visibility resolves (e.g. as permissions arrive).

## [1.3.1] - 2026-07-28

> There is no `1.3.0` on npm: the version number was taken by an early publish that was later
> unpublished, and npm never allows a retired version number to be reused. The sidebar rework below
> therefore shipped as `1.3.1`. Upgrade straight from `1.2.0` to `1.3.1`.

### Added

- Semantic `--sidebar-*` design tokens covering the sidebar's surfaces, text, selection, glass, and
  radii (`--sidebar-bg`, `--sidebar-nav-bg`, `--sidebar-text`, `--sidebar-text-muted`,
  `--sidebar-item-hover-bg`, `--sidebar-item-selected-bg`, `--sidebar-blur`, `--sidebar-shadow`,
  `--sidebar-tree-line`, `--sidebar-radius`, `--sidebar-item-radius`, …) so consumers can re-theme
  the sidebar entirely via CSS custom properties.
- **Menu regions**: an optional `SidebarMenu.region` label groups top-level items under an uppercase
  group header (e.g. "MAIN"). Items without a `region` render ungrouped, so it stays
  backward-compatible. When the rail is collapsed, each header cross-fades to a short separator line
  so the groups remain visually distinct. The grouping type is exported as `SidebarRegion`.

### Changed

- Selected menu items now render as a rounded **pill** highlight (inset when expanded) instead of the
  previous 4px left accent bar.
- The sidebar is now a **translucent, blurred "glass" panel** — rounded corners, a soft drop shadow,
  and a semi-transparent brand surface — rather than a solid, square, edge-to-edge rail (all
  token-driven via `--sidebar-bg`, `--sidebar-blur`, `--sidebar-shadow`, `--sidebar-radius`).
- **Child (sub-menu) items** now render a rounded **tree-connector** line instead of a menu icon;
  top-level items keep their icons.
- Collapsing/expanding the rail is now **animated end to end**: the toggle chevron and the
  expandable-parent caret rotate in the same direction, the selection pill inset and item icons ease
  into place, and region headers cross-fade to their separators — all in sync with the rail width.

### ⚠ Breaking Changes / Migration

The sidebar surface is now **translucent** ("glass"). If your app does not place a colored backdrop
behind the sidebar, the rail will look faint over plain/neutral content — either add a
colored/gradient backdrop behind it (see `@shared`'s `--app-backdrop` in `MainLayoutComponent`) or
override `--sidebar-bg` (and the other `--sidebar-*` surface tokens) with opaque values to keep a
solid rail.

## [1.2.0] - 2026-07-24

### Added

- `SidebarComponent` now renders its own collapse/expand toggle: a light circular chevron "handle"
  that straddles the sidebar's right edge (`angle-left` to collapse when expanded, `angle-right` to
  expand when collapsed), matching the conventional rail-collapse affordance.
- `SidebarComponent` now has a content-projection slot (`<ng-content>`) rendered as a footer at the
  bottom of the sidebar — for extra elements after the menu (e.g. an app version). It is hidden when
  the rail is collapsed and collapses entirely when nothing is projected.

### Changed

- `SidebarComponent` no longer renders the logo or the user-profile header — it now shows only the
  navigation toggle and menu. Application branding and user identity are expected to live in the top
  bar (`shared-top-bar` in `@shared`).
- Sidebar menu items now use an on-palette hover surface (a subtle light overlay) instead of the
  previous off-palette `slate-700`.

### ⚠ Breaking Changes / Migration

If you relied on the sidebar's logo (`SidebarConfigs.logoCollapsedPath` / `logoExpandedPath`) or its
user profile (`SidebarService.getUserProfile()`), move that presentation to the top bar. Those
config options and the `getUserProfile()` method still exist but are no longer consumed by
`SidebarComponent`.

## [1.1.1] - 2026-06-17

- Baseline release: the changelog starts being tracked from this version. Earlier history is
  available via [GitHub Releases](https://github.com/RicardoZambon/ZLibraries/releases) and the
  `library-v*` tags.

[Unreleased]: https://github.com/RicardoZambon/ZLibraries/compare/library-v3.1.2...HEAD
[3.1.2]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v3.1.2
[3.1.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v3.1.1
[3.1.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v3.1.0
[3.0.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v3.0.1
[3.0.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v3.0.0
[2.0.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v2.0.1
[2.0.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v2.0.0
[1.6.4]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.6.4
[1.6.3]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.6.3
[1.6.2]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.6.2
[1.6.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.6.1
[1.6.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.6.0
[1.5.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.5.0
[1.4.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.4.1
[1.4.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.4.0
[1.3.2]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.3.2
[1.3.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.3.1
[1.2.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.2.0
[1.1.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.1.1
