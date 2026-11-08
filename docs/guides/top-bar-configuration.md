# Top bar configuration

`MainLayoutComponent` from `@zambon-dev/ui/shared` renders a top bar above the tabs. You do not
add it yourself. It shows, from left to right:

- the brand: logo, application name and company name;
- the environment badge;
- the notifications bell;
- the language selector;
- the theme switch;
- the user profile;
- the logout button.

This guide explains how to configure each part.

## Before you start

[Getting started](./getting-started.md) covers installing the package and the providers the main
layout needs. `@microsoft/signalr` is a required peer dependency of the package, whether or not you
turn notifications on.

## Configure `AppConfig`

The top bar reads its settings from `AppConfig`, provided under `APP_CONFIG`:

```ts
import { ApplicationConfig } from '@angular/core';
import { APP_CONFIG, AppConfig } from '@zambon-dev/ui/framework';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_CONFIG,
      useValue: new AppConfig(environment.apiBaseUrl, {
        appName: 'Engineering Change',
        companyName: 'Example Ltd',
        environment: environment.name, // 'DEV' | 'QA' | 'STG' | 'PROD'
        logoUrl: '/assets/logo.svg',
        version: '1.4.0',
        notificationsEnabled: environment.notificationsEnabled,
        notificationsUrl: environment.notificationsHubUrl, // e.g. `${apiBaseUrl}/hubs/notifications`
      }),
    },
    // ...
  ],
};
```

The first argument, `baseUrl`, is required. It is the root URL of your API. The package uses it
for the sign-in, token refresh and permission endpoints, for the audit history endpoints, and to
decide which requests the auth interceptor refreshes an expired token for. It is exposed as
`AppConfig.BASE_URL`.

Every option in the second argument is optional:

| Option                 | Type      | Default | Purpose                                                                                     |
| ---------------------- | --------- | ------- | ------------------------------------------------------------------------------------------- |
| `appName`              | `string`  | `''`    | Application name in the top bar.                                                            |
| `companyName`          | `string`  | `''`    | Line under the application name. Hidden when empty.                                         |
| `environment`          | `string`  | `''`    | Environment badge. See [Environment badge](#environment-badge).                             |
| `logoUrl`              | `string`  | none    | Brand logo in the top bar. Also the sign-in logo when `loginLogoUrl` is not set.            |
| `loginBackgroundUrl`   | `string`  | none    | Image behind the sign-in screen. Without it, the application backdrop shows.                |
| `loginLogoUrl`         | `string`  | none    | Logo on the sign-in card. Falls back to `logoUrl`.                                          |
| `version`              | `string`  | `''`    | Application version, shown at the bottom of the sidebar. Hidden when empty.                 |
| `notificationsEnabled` | `boolean` | `false` | Turns the notifications bell on.                                                            |
| `notificationsUrl`     | `string`  | `''`    | SignalR hub URL. The bell shows only when `notificationsEnabled` is `true` and this is set. |

## Environment badge

The badge shows `environment`, trimmed and in upper case.

- `DEV`, `QA` and `STG` each have their own colour.
- Any other non-empty value uses a neutral style.
- `PROD` or an empty value hides the badge.

## Notifications

When `notificationsEnabled` is `true` and `notificationsUrl` is set, the top bar opens a SignalR
connection to the hub. It authenticates with the current JWT and reconnects automatically. It
renders whatever list the hub pushes.

### Notification contract

Each notification must match `INotification`, exported from `@zambon-dev/ui/shared`:

```ts
export interface INotification {
  title: string;
  description: string;
  icon: string; // a CSS class, e.g. 'fa-solid fa-envelope'
  callToActionUrl?: string; // optional; clicking navigates here
  isRead: boolean;
}
```

- `icon` is applied as a CSS class as it is, so any icon set your application loads works.
- `callToActionUrl`: a URL that starts with `http://` or `https://` opens in a new browser tab.
  Anything else is navigated to with the Angular router, for example `/ecns/123`. Omit it for a
  notification with no action.
- The badge counts notifications where `isRead` is `false`. A count of `0` hides the badge.

### Hub contract

The client:

- **listens** for `ReceiveNotifications` and expects the **full current list**
  (`INotification[]`). Push it on connect and whenever it changes.
- **invokes** `MarkAllAsRead` with no arguments when the user clicks "Mark all as read". Implement
  it to keep the read state on the server.

Clicking one notification marks it read on the client only. Your next `ReceiveNotifications` push
replaces the list.

### Backend example (ASP.NET Core)

```csharp
public record NotificationDto(
    string Title,
    string Description,
    string Icon,
    string? CallToActionUrl,
    bool IsRead);

[Authorize]
public class NotificationsHub : Hub
{
    private readonly INotificationsProvider _provider;
    public NotificationsHub(INotificationsProvider provider) => _provider = provider;

    public override async Task OnConnectedAsync()
    {
        var items = await _provider.GetForUserAsync(Context.UserIdentifier!);
        await Clients.Caller.SendAsync("ReceiveNotifications", items);
        await base.OnConnectedAsync();
    }

    public Task MarkAllAsRead() => _provider.MarkAllAsReadAsync(Context.UserIdentifier!);
}
```

Map the hub:

```csharp
app.MapHub<NotificationsHub>("/hubs/notifications");
```

SignalR sends the JWT as an `access_token` query-string parameter during the WebSocket handshake.
Configure JWT bearer authentication to read it for the hub path: in `OnMessageReceived`, set
`context.Token` from `access_token` when the request path starts with `/hubs/notifications`.

To push a new notification, send the updated list to the user's connections:

```csharp
await hubContext.Clients.User(userId).SendAsync("ReceiveNotifications", updatedList);
```

## Language selector

The selector lists the languages registered with `TranslateService` when the top bar is created.
Register them at startup:

```ts
translate.addLangs(['en', 'pt']);
```

Choosing a language calls `translate.use()` and stores the code in `localStorage` under the key
`language`. The package does not read that key back. Restore it yourself at startup, for example
with `translate.use(localStorage.getItem('language') ?? 'en')`.

Each entry is labelled with the translation key `Language-<code>`. The package ships labels and
flags for `en` and `pt` only. See [Internationalization](./internationalization.md) for the full
setup.

## Theme switch

The theme switch steps through light, dark and system. It is always shown; no option hides it. See
[Theming](./design-tokens.md#light-and-dark-themes) for how the theme is stored and how to avoid a
flash of the wrong theme on load.

## User profile

The profile shows the signed-in user's name, an avatar and a position. They come from the
`ICurrentUserInfo` that `AuthenticationService` stored at sign-in.

To fill in the avatar and the position, return `pictureUrl` and `position` in the sign-in
response. Both are optional:

- Without `pictureUrl`, the avatar shows the user's initials.
- Without `position`, that line is hidden.

## Logout

The logout button opens a confirmation dialog. On confirm, the layout calls
`AuthenticationService.signOut()` and navigates to `/login`.

`signOut()` clears all of `localStorage` and `sessionStorage`, and closes every tab. That also
removes the stored theme and language choices.

## Sidebar

The sidebar shows no logo and no user profile; the top bar shows them. `SidebarConfigs.logoCollapsedPath`
and `logoExpandedPath` are ignored. `SidebarService.getUserProfile()` is still abstract, so a
subclass must implement it, but nothing calls it: return `undefined`.

## Translations

The top bar uses keys from both translation layers:

- **Shared translations:** the notifications and theme switch labels, the language selector
  title, and the logout labels (`Main-Logout`, `Main-Logout-Modal-Message`,
  `Main-Logout-Modal-Message-Cancel`, `Main-Logout-Modal-Message-Confirm`).
- **Framework translations:** the language names (`Language-en`, `Language-pt`).

Load both layers. [Internationalization](./internationalization.md) shows how.

## Checklist

- [ ] Install `@zambon-dev/ui` and register the providers in [Getting started](./getting-started.md).
- [ ] Provide `AppConfig` with your API `baseUrl`, plus `appName`, `companyName`, `environment` and
      optionally `logoUrl` and `version`.
- [ ] Load the shared and framework translations.
- [ ] Register your languages with `translate.addLangs()`, and restore the stored `language` at
      startup.
- [ ] For notifications: set `notificationsEnabled` and `notificationsUrl`, and expose a hub that
      pushes `ReceiveNotifications(INotification[])` and optionally handles `MarkAllAsRead`.
- [ ] Return `pictureUrl` and `position` in the sign-in response to complete the user profile.
- [ ] Return `undefined` from `SidebarService.getUserProfile()`.
