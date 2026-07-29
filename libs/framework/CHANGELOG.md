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

- **Routed list views now fill the available height automatically.** `DefaultTabViewComponent` gave its
  routed child no layout and `lib-data-grid` has no `flex-grow` of its own, so a grid collapsed to its
  `rowsToDisplay × rowHeight` minimum with empty space beneath it, and every consuming list component
  had to repeat the same `:host { flex; flex-grow; overflow: hidden }` + `lib-data-grid { flex-grow }`
  stylesheet to compensate. `TabViewList` now carries a `framework-view-list` host class — inherited by
  every subclass — which `DefaultTabViewComponent` styles, so **consuming apps can delete those
  per-component stylesheets**. Routed screens that do not extend `TabViewList` (forms, dashboards) are
  unaffected.

### ⚠ Breaking Changes / Migration

None. Optional cleanup: components extending `TabViewList` can now delete their
`:host { display: flex; flex-grow: 1; overflow: hidden }` / `lib-data-grid { flex-grow: 1 }`
stylesheets — `DefaultTabViewComponent` styles the inherited `framework-view-list` host class.

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

[Unreleased]: https://github.com/RicardoZambon/ZLibraries/compare/framework-v1.2.0...HEAD
[1.2.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.2.0
[1.1.1]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.1.1
[1.1.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/framework-v1.1.0
