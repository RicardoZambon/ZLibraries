---
title: Main layout and top bar
summary: The signed-in application shell, with the sidebar, the top bar and the tab strip in place.
entryPoint: shared
api:
  [
    MainLayoutComponent,
    TopBarComponent,
    BrandComponent,
    EnvironmentBadgeComponent,
    NotificationsComponent,
    UserProfileComponent,
    ExternalContentComponent,
  ]
storybook: shared-app-showcase--navigable-app
---

`shared-main-layout` is the frame of a signed-in application. It places the
[sidebar](./sidebar.md) on the side, the top bar across the top and the [tab strip](./tabs.md) with
your routed screens in the middle. Menu choices open as tabs, embedded pages or new browser windows,
and logging out asks for confirmation first.

## Usage

Use the layout as the component of your root route, with your screens as its children:

```ts
import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@zambon-dev/ui/shared';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [/* your screens */],
  },
];
```

The layout has no inputs. It is configured through providers and `AppConfig`. See
[The full application shell](../guides/getting-started.md#the-full-application-shell) for the
complete provider list and routes. In short, it needs a `SidebarService` subclass, `APP_CONFIG`,
`CustomReuseStrategy`, the auth services, translations and HTTP.

### The top bar

`shared-top-bar` holds, from left to right: the brand (logo and application name), the environment
badge, the notifications bell, the language selector, the [theme switch](./theme-switch.md), the
user's profile and the logout button. There is no input to hide or reorder them. Each reads its
settings from `AppConfig`; for example, the bell shows only when notifications are turned on.

[Top bar configuration](../guides/top-bar-configuration.md) covers every setting, the notifications
contract and the user profile.

The top bar emits `logout` when its button is clicked. The layout answers with a confirmation dialog;
on confirm it signs out and navigates to `/login`.

### Menu destinations

The layout listens to the sidebar service:

- An application route opens as a tab.
- An external address with the "new browser tab" mode opens in a new window, if the address is
  allowed.
- An external address with the "embedded" mode opens in a tab through `ExternalContentComponent`.
  Add `externalContentRoutes` to the layout's children for this.

When the application starts on a deep link, the layout asks `SidebarService.getMenuFromUrl()` for the
tab's title. A failed answer is ignored.

### The sidebar footer

The layout shows `AppConfig.version` in the sidebar footer, prefixed with `v`.

## Accessibility

The layout combines the [sidebar](./sidebar.md#accessibility), the [tabs](./tabs.md#accessibility)
and the [modal](./modal.md#accessibility) used for the logout confirmation; see their pages. The
top bar's icon-only buttons (logout, theme) carry translated accessible names. The logout dialog
shares the modal's current limits.

## Theming

The page behind the shell is `--app-backdrop`. Override it in both themes; see
[Theming](../guides/design-tokens.md#overriding-a-component-token). The sidebar and the tabs have
their own token sets. The top bar's parts read core role tokens such as `--color-content-primary`,
`--color-accent` and `--shadow-overlay`.
