# @zambon-dev/shared

Shared Angular services, utilities, and styles for Zambon applications.

This is the top layer of [ZLibraries](https://github.com/RicardoZambon/ZLibraries). It supplies
authentication, layouts, history features and cross-cutting services, and builds on both
[`@zambon-dev/library`](https://www.npmjs.com/package/@zambon-dev/library) and
[`@zambon-dev/framework`](https://www.npmjs.com/package/@zambon-dev/framework).

## Installation

```bash
npm install @zambon-dev/shared
```

### Peer dependencies

All peers must be present in the consuming application:

| Package | Range |
| --- | --- |
| `@angular/common` | `^19.1.0` |
| `@angular/core` | `^19.1.0` |
| `@angular/forms` | `^19.1.0` |
| `@angular/platform-browser` | `^19.1.0` |
| `@angular/router` | `^19.1.0` |
| `@auth0/angular-jwt` | `^5.2.0` |
| `@microsoft/signalr` | `^10.0.0` |
| `@ngx-translate/core` | `^16.0.4` |
| `@zambon-dev/framework` | `^1.0.0` |
| `@zambon-dev/library` | `^1.0.0` |
| `ngx-translate-multi-http-loader` | `^19.0.2` |
| `rxjs` | `^7.8.0` |

## Usage

### Authentication

`SharedAuthModule` bundles the guard and HTTP interceptors. `AuthenticationService` handles sign-in, token
storage (`localStorage` or `sessionStorage` depending on "remember me") and refresh.

```ts
import { AuthenticationService } from '@zambon-dev/shared';

const service = inject(AuthenticationService);
await firstValueFrom(service.authenticate(username, password, rememberMe));
```

Route protection uses the exported guard:

```ts
import { AuthGuard } from '@zambon-dev/shared';

export const routes: Routes = [
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
];
```

Unauthenticated visitors are redirected to `/login` with a `returnUrl` query parameter.

### Layouts and features

`MainLayoutComponent` provides the application shell. Self-contained features ship with their own routes —
for example `externalContentRoutes` for `ExternalContentComponent`.

## Styles

```scss
@use '@zambon-dev/shared/styles' as shared;
```

That entry point resolves to `styles/common.scss`; design tokens are separately reachable at
`@zambon-dev/shared/styles/variables`.

## Translations

```ts
import translations from '@zambon-dev/shared/i18n/en.json';
```

## What's included

**Services** — `AuthenticationService`, `ExternalContentService`, `ExternalUrlResolverService`,
`NotificationsService` (SignalR-backed), `OperationsHistoryService`, `ServicesHistoryService`

**Auth** — `SharedAuthModule`, route guards, HTTP interceptors

**Features** — external content, operations history, services history

**Layouts** — `MainLayoutComponent` and supporting shell components

Components, models and pipes are exported from the package root as well.

## Documentation

Browse the published Storybook at [https://ricardozambon.github.io/ZLibraries/shared/](https://ricardozambon.github.io/ZLibraries/shared/).

To run it locally:

```bash
npm run storybook:shared
```

## Contributing

See the [workspace README](https://github.com/RicardoZambon/ZLibraries#readme) for the development setup,
and [CHANGELOG.md](./CHANGELOG.md) for release history.

## License

MIT © Ricardo Zambon
