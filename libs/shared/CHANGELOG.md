# Changelog

All notable changes to `@zambon-dev/shared` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Upgrading?** Each release lists what changed and, under
> **⚠ Breaking Changes / Migration**, the concrete steps required to move to that version.
> When no migration is needed, that subsection is omitted.

## [Unreleased]

### Added

- New application top bar (`shared-top-bar`), rendered by `MainLayoutComponent`, composing the
  brand (app name, company name, optional logo), an environment badge, notifications, the language
  selector, and the user profile — alongside the existing sidebar-collapse and logout controls.
- `NotificationsService` (root-provided) exposing `getNotifications()`, `getUnreadCount()`,
  `markAsRead()`, and `markAllAsRead()`. It ships with an empty placeholder data source until the
  ZWebAPI notifications endpoint is available; swapping in the real endpoint requires no consumer
  changes.
- Individually reusable top-bar components: `BrandComponent`, `EnvironmentBadgeComponent`,
  `NotificationsComponent`, `UserProfileComponent`, and the composing `TopBarComponent`.
- `top-bar` i18n bundle (`en`/`pt`) registered in `ZAMBON_SHARED_I18N_RESOURCES`.

### Changed

- `ICurrentUserInfo` gained optional `pictureUrl` and `position` fields, displayed in the top-bar
  user profile. The avatar falls back to the user's initials when `pictureUrl` is absent, and the
  position line is hidden when `position` is empty.

### Deprecated

### Removed

### Fixed

### ⚠ Breaking Changes / Migration

None. To populate the top bar, provide `appName`, `companyName`, `environment`, and optionally
`logoUrl` via `AppConfig` options (requires `@zambon-dev/framework` with the new `AppConfig`
options). The environment badge maps `DEV`/`QA`/`STG` to colors, renders any other non-empty value
with a neutral style, and is hidden for `PROD` or when no environment is set. Notification content
and the user's `pictureUrl`/`position` will be supplied by the backend once available.

## [1.0.2] - 2026-05-02

- Baseline release: the changelog starts being tracked from this version. Earlier history is
  available via [GitHub Releases](https://github.com/RicardoZambon/ZLibraries/releases) and the
  `shared-v*` tags.

[Unreleased]: https://github.com/RicardoZambon/ZLibraries/compare/shared-v1.0.2...HEAD
[1.0.2]: https://github.com/RicardoZambon/ZLibraries/releases/tag/shared-v1.0.2
