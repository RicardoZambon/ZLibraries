# Top Bar Update — Design (as built)

**Date:** 2026-07-23
**Status:** Implemented
**Location:** `@shared` library — `MainLayoutComponent` toolbar

## Overview

The application top bar (`.toolbar` in `MainLayoutComponent`) was minimal: a sidebar collapse
button and a logout button. This change expands it into a full application header containing brand
identity, environment context, notifications, language selection, and user identity — while keeping
the collapse and logout controls.

The toolbar lives in `@shared`, so the change lands for every consuming app.

## Goals (delivered)

All elements **except** the theme switch:

1. Application name
2. Company name (below the app name)
3. Environment badge (DEV / QA / STG / …)
4. Notifications badge (bell + unread count + dropdown)
5. Language selector (existing component, reused)
6. User profile (picture, name, position)
7. Existing collapse button and logout button retained (logout stays a separate button)

## Non-Goals (deferred)

- **Theme switch (light/dark).** Deferred because it touches every component's SCSS (all styling is
  currently hardcoded light). The layout reserves an insertion slot; no control or theming work.
- **Avatar upload / profile management.** Out of scope; the avatar is display-only.
- **Real notifications backend.** The endpoint will be built later in ZWebAPI. This round ships an
  empty placeholder data source behind `NotificationsService`.

## Architecture

A single `TopBarComponent` composes small, independently testable child components. This keeps
`MainLayoutComponent` thin and matches how the codebase already isolates the sidebar and buttons.

```
MainLayoutComponent (@shared/layouts)
  └─ <shared-top-bar class="toolbar" (collapse)="sidebar.collapse()" (logout)="onLogoutClick()">
       ├─ collapse button              → emits (collapse)
       ├─ <shared-brand>               → logo + app name + company name   (AppConfig)
       ├─ <shared-environment-badge>   → environment pill                 (AppConfig)
       ├─ (spacer)
       ├─ <shared-notifications>       → bell + unread badge + dropdown    (NotificationsService)
       ├─ <shared-language-selector>   → existing component, reused
       ├─ [theme switch slot]          → DEFERRED, not built
       ├─ <shared-user-profile>        → avatar + name + position          (AuthenticationService)
       └─ logout button                → emits (logout)
```

`MainLayoutComponent` keeps ownership of the **logout confirmation modal**; `TopBarComponent`
exposes `(collapse)` and `(logout)` outputs so the layout wires them to the sidebar and modal.
The host `<shared-top-bar>` carries the existing `.toolbar` grid/chrome styles unchanged.

## Data & Configuration Changes

### AppConfig (`@framework`)

Added an optional `options` argument (`AppConfigOptions`): `appName`, `companyName`, `environment`,
`logoUrl`. Backward-compatible — `new AppConfig(baseUrl)` still works; the root factory default
`new AppConfig('')` is unchanged.

### ICurrentUserInfo (`@shared`)

Added optional `pictureUrl` and `position`. The backend will populate them later; the avatar falls
back to initials and the position line is hidden when empty.

### NotificationsService (`@shared/services`)

Root-provided. Holds a `BehaviorSubject<INotification[]>` (seeded empty) and exposes
`getNotifications()`, `getUnreadCount()`, `markAsRead(id)`, `markAllAsRead()`. `loadNotifications()`
is the single seam to replace with the ZWebAPI call when available — no consumer changes required.
It returns an empty list for now so consuming apps never show fabricated notifications in
production; the dropdown's empty state is the visible behavior.

## Component Contracts (each has its own `.spec`)

- **BrandComponent** (`shared-brand`) — reads `AppConfig`; renders optional logo, app name,
  company name. Presentational.
- **EnvironmentBadgeComponent** (`shared-environment-badge`) — reads `AppConfig.environment`
  (normalized upper/trim); maps `DEV`=blue, `QA`=amber, `STG`=violet, else neutral; renders nothing
  for `PROD` or empty.
- **NotificationsComponent** (`shared-notifications`) — subscribes to `NotificationsService`; bell
  with unread badge (hidden at 0); click toggles a dropdown with click-outside dismissal (same
  pattern as `LanguageSelectorComponent`); shows a translated empty state; items are focusable
  buttons; supports mark-as-read and mark-all-as-read.
- **UserProfileComponent** (`shared-user-profile`) — reads `AuthenticationService.getUserInfo()`;
  avatar from `pictureUrl` or initials fallback; name + optional position.

## Layout & Styling

Left cluster: collapse · brand · environment badge. Right cluster: notifications · language ·
[theme slot — deferred] · user profile · logout. Tailwind, consistent with the existing `.toolbar`.

## Internationalization

New `src/i18n/top-bar/{en,pt}.json` bundle registered in `ZAMBON_SHARED_I18N_RESOURCES`. Keys:
`TopBar-Sidebar-Toggle`, `TopBar-Notifications-Title`, `TopBar-Notifications-Empty`,
`TopBar-Notifications-MarkAllRead`. The logout button keeps the app-provided `Main-Logout` key.

## Testing

- Logic specs (via the documented `Object.create()` pattern) for `BrandComponent`,
  `EnvironmentBadgeComponent`, `NotificationsComponent`, `UserProfileComponent`, `TopBarComponent`,
  and `NotificationsService` — all passing.
- The pre-existing shared test suites that fail on `main` (unrelated `declarations`-based specs)
  are untouched; this change adds no new failures.

## Follow-ups (outside this round)

1. ZWebAPI notifications endpoint → replace `NotificationsService.loadNotifications()`.
2. Backend `pictureUrl` + `position` on the auth response.
3. Theme switch — separate future feature spanning all component SCSS.
