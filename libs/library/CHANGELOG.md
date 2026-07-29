# Changelog

All notable changes to `@zambon-dev/library` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Upgrading?** Each release lists what changed and, under
> **⚠ Breaking Changes / Migration**, the concrete steps required to move to that version.
> When no migration is needed, that subsection is omitted.

## [Unreleased]

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

### Deprecated

### Removed

### Fixed

- **Form inputs no longer render a stray bordered box when `type` is set as a static attribute.**
  Angular keeps static attributes in the DOM even when a directive consumes them as an `@Input()`, so
  `<lib-form-input-group type="checkbox">` left a `type="checkbox"` attribute on the host element —
  where `@tailwindcss/forms`' tag-agnostic `[type="checkbox"]` base rules styled the host itself as a
  checkbox (1px border, white fill, `height: 1rem`), drawing an empty-input box around the field row
  and tinting its icon. `FormInputGroupComponent` and `FormInputComponent` now clear the attribute via
  a host binding. This affects every value of `type` (`checkbox`, `date`, `number`, `password`, …);
  both `type="checkbox"` and `[type]="'checkbox'"` now render identically, so existing call sites are
  fixed with no changes required.
- **`lib-ribbon` now hides itself when it contains no visible buttons.** A screen with no ribbon
  actions — a dashboard, or any view that projects an empty `#ribbon` template — previously still
  rendered the bar's border, background and padding around nothing, wasting vertical space at the top
  of the page. This mirrors `lib-ribbon-group`, which already hid itself when none of its children
  were visible. Ribbons with at least one visible group are unaffected.

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

[Unreleased]: https://github.com/RicardoZambon/ZLibraries/compare/library-v1.2.0...HEAD
[1.2.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.2.0
[1.1.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.1.1
