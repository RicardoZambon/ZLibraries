# Changelog

All notable changes to `@zambon-dev/library` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Upgrading?** Each release lists what changed and, under
> **⚠ Breaking Changes / Migration**, the concrete steps required to move to that version.
> When no migration is needed, that subsection is omitted.

## [Unreleased]

### Added

- `SidebarComponent` now renders its own collapse/expand toggle: a light circular chevron "handle"
  that straddles the sidebar's right edge (`angle-left` to collapse when expanded, `angle-right` to
  expand when collapsed), matching the conventional rail-collapse affordance.
- `SidebarComponent` now has a content-projection slot (`<ng-content>`) rendered as a footer at the
  bottom of the sidebar — for extra elements after the menu (e.g. an app version). It is hidden when
  the rail is collapsed and collapses entirely when nothing is projected.
- Semantic `--sidebar-*` design tokens covering the sidebar's surfaces, text, selection, glass, and
  radii (`--sidebar-bg`, `--sidebar-nav-bg`, `--sidebar-text`, `--sidebar-text-muted`,
  `--sidebar-item-hover-bg`, `--sidebar-item-selected-bg`, `--sidebar-blur`, `--sidebar-shadow`,
  `--sidebar-tree-line`, `--sidebar-radius`, `--sidebar-item-radius`, …) so consumers can re-theme
  the sidebar entirely via CSS custom properties.
- **Menu regions**: an optional `SidebarMenu.region` label groups top-level items under an uppercase
  group header (e.g. "MAIN"). Items without a `region` render ungrouped, so it stays
  backward-compatible. When the rail is collapsed, each header cross-fades to a short separator line
  so the groups remain visually distinct.

### Changed

- `SidebarComponent` no longer renders the logo or the user-profile header — it now shows only the
  navigation toggle and menu. Application branding and user identity are expected to live in the top
  bar (`shared-top-bar` in `@shared`).
- Sidebar menu items now use an on-palette hover surface (a subtle light overlay) instead of the
  previous off-palette `slate-700`.
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

### ⚠ Breaking Changes / Migration

If you relied on the sidebar's logo (`SidebarConfigs.logoCollapsedPath` / `logoExpandedPath`) or its
user profile (`SidebarService.getUserProfile()`), move that presentation to the top bar. Those
config options and the `getUserProfile()` method still exist but are no longer consumed by
`SidebarComponent`.

The sidebar surface is now **translucent** ("glass"). If your app does not place a colored backdrop
behind the sidebar, the rail will look faint over plain/neutral content — either add a
colored/gradient backdrop behind it (see `@shared`'s `--app-backdrop` in `MainLayoutComponent`) or
override `--sidebar-bg` (and the other `--sidebar-*` surface tokens) with opaque values to keep a
solid rail.

## [1.3.0] - 2026-05-01

- Baseline release: the changelog starts being tracked from this version. Earlier history is
  available via [GitHub Releases](https://github.com/RicardoZambon/ZLibraries/releases) and the
  `library-v*` tags.

[Unreleased]: https://github.com/RicardoZambon/ZLibraries/compare/library-v1.3.0...HEAD
[1.3.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.3.0
