# Top Bar Configuration Guide (for consuming applications)

This guide explains how an application that consumes `@zambon-dev/shared` (via `MainLayoutComponent`)
adopts the application top bar: brand, environment badge, notifications, language selector, and the
user profile.

The top bar renders automatically inside `MainLayoutComponent` — you do not add any component. You
only need to (1) upgrade the packages, (2) provide `AppConfig` values, and (3) — for notifications —
install `@microsoft/signalr` and expose a SignalR hub.

## 1. Upgrade packages

```bash
npm i @zambon-dev/framework@latest @zambon-dev/shared@latest @zambon-dev/library@latest
# Required only if you enable notifications (peer dependency):
npm i @microsoft/signalr
```

> The sidebar (`@zambon-dev/library`) no longer renders a logo or a user profile — branding and user
> identity now live in the top bar. If you relied on the sidebar's `logoCollapsedPath` /
> `logoExpandedPath` or `SidebarService.getUserProfile()`, move that presentation to the top bar.

## 2. Configure `AppConfig`

Provide `AppConfig` with the new options where you bootstrap the app (usually in `app.config.ts`
or a root `providers` array). All options are optional and backward-compatible.

```ts
import { APP_CONFIG, AppConfig } from '@zambon-dev/framework';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_CONFIG,
      useValue: new AppConfig(environment.apiBaseUrl, {
        appName: 'Engineering Change',
        companyName: 'Zilia Technologies',
        environment: environment.name,        // 'DEV' | 'QA' | 'STG' | 'PROD'
        logoUrl: '/assets/logo.svg',          // optional
        notificationsEnabled: environment.notificationsEnabled,
        notificationsUrl: environment.notificationsHubUrl, // e.g. `${apiBaseUrl}/hubs/notifications`
      }),
    },
    // ...
  ],
};
```

| Option | Type | Purpose |
|--------|------|---------|
| `appName` | `string` | Brand title in the top bar |
| `companyName` | `string` | Line under the app name |
| `environment` | `string` | Environment badge. `DEV`/`QA`/`STG` are colored; any other non-empty value uses a neutral style; **`PROD` or empty hides the badge** |
| `logoUrl` | `string?` | Optional brand logo |
| `notificationsEnabled` | `boolean` | Turns the notifications bell on/off (default `false`) |
| `notificationsUrl` | `string` | SignalR hub URL; the bell is only shown when enabled **and** this is set |

## 3. Notifications (SignalR)

When `notificationsEnabled` is `true` and `notificationsUrl` is set, the top bar opens a SignalR
connection (authenticated with the current JWT) and renders whatever the hub pushes.

### 3.1 Notification contract

The client expects each notification to match `INotification`:

```ts
export interface INotification {
  title: string;
  description: string;
  icon: string;            // a Font Awesome class, e.g. 'fa-solid fa-envelope'
  callToActionUrl?: string; // optional; clicking navigates here
  isRead: boolean;
}
```

- `icon` is applied verbatim as a CSS class, so any icon set available in your app works.
- `callToActionUrl`: an internal route (e.g. `/ecns/123`) is navigated via the Angular router; an
  absolute URL (`https://…`) opens in a new tab. Omit it for non-actionable notifications.
- The unread badge counts notifications where `isRead === false`; a count of `0` hides the number.

### 3.2 Hub contract

The client:

- **Listens** for `ReceiveNotifications` and expects the **full current list** (`INotification[]`).
  Push it on connect and whenever it changes.
- **Invokes** `MarkAllAsRead` (no arguments) when the user clicks “mark all as read”. Implement it if
  you want server-side read state; otherwise it is a harmless no-op. (Single-item read is handled
  optimistically on the client and reconciled by your next `ReceiveNotifications` push.)

### 3.3 Backend example (ASP.NET Core)

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

Register and map the hub:

```csharp
app.MapHub<NotificationsHub>("/hubs/notifications");
```

> **Auth note:** SignalR sends the JWT as an `access_token` query-string parameter for the
> WebSocket handshake. Configure JWT bearer to read it for the hub path (the standard
> `OnMessageReceived` → `context.Token = accessToken` pattern when the request path starts with
> `/hubs/notifications`).

To push a new notification later, send the updated list to the user's connection(s):

```csharp
await hubContext.Clients.User(userId).SendAsync("ReceiveNotifications", updatedList);
```

## 4. User profile fields

The user profile shows the name (from the existing auth response) plus an avatar and a position.
To populate the avatar image and the position line, return `pictureUrl` and `position` on the
authentication response (they are optional fields on `ICurrentUserInfo`). When `pictureUrl` is
absent the avatar falls back to the user's initials; when `position` is empty that line is hidden.

## 5. Internationalization

The top bar ships its own `top-bar` i18n bundle (`en`/`pt`) registered in
`ZAMBON_SHARED_I18N_RESOURCES`, so its labels are covered by the existing shared i18n asset copy —
no action needed beyond the shared i18n setup you already have.

## Summary checklist

- [ ] Upgrade `@zambon-dev/*` packages; `npm i @microsoft/signalr` if using notifications.
- [ ] Provide `AppConfig` with `appName`, `companyName`, `environment`, and optionally `logoUrl`.
- [ ] Move any sidebar logo/profile usage to the top bar (sidebar no longer shows them).
- [ ] For notifications: set `notificationsEnabled` + `notificationsUrl`, and expose a hub that
      pushes `ReceiveNotifications(INotification[])` (and optionally handles `MarkAllAsRead`).
- [ ] Return `pictureUrl` / `position` on the auth response to complete the user profile.
