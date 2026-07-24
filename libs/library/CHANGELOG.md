# Changelog

All notable changes to `@zambon-dev/library` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Upgrading?** Each release lists what changed and, under
> **⚠ Breaking Changes / Migration**, the concrete steps required to move to that version.
> When no migration is needed, that subsection is omitted.

## [Unreleased]

### Added

- `SidebarComponent` now renders its own collapse/expand toggle at the top of the sidebar (the
  hamburger aligns with the menu-item icons and stays put between collapsed/expanded states).

### Changed

- `SidebarComponent` no longer renders the logo or the user-profile header — it now shows only the
  navigation toggle and menu. Application branding and user identity are expected to live in the top
  bar (`shared-top-bar` in `@shared`).

### Deprecated

### Removed

### Fixed

### ⚠ Breaking Changes / Migration

If you relied on the sidebar's logo (`SidebarConfigs.logoCollapsedPath` / `logoExpandedPath`) or its
user profile (`SidebarService.getUserProfile()`), move that presentation to the top bar. Those
config options and the `getUserProfile()` method still exist but are no longer consumed by
`SidebarComponent`.

## [1.3.0] - 2026-05-01

- Baseline release: the changelog starts being tracked from this version. Earlier history is
  available via [GitHub Releases](https://github.com/RicardoZambon/ZLibraries/releases) and the
  `library-v*` tags.

[Unreleased]: https://github.com/RicardoZambon/ZLibraries/compare/library-v1.3.0...HEAD
[1.3.0]: https://github.com/RicardoZambon/ZLibraries/releases/tag/library-v1.3.0
