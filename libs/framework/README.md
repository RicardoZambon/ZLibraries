# @zambon-dev/framework

Angular framework components and infrastructure for Zambon applications.

This is the application-shell layer of [ZLibraries](https://github.com/RicardoZambon/ZLibraries). It provides
the tabbed navigation model, view scaffolding, confirmation/deletion flows and route-reuse behaviour that
Zambon applications share. It builds on
[`@zambon-dev/library`](https://www.npmjs.com/package/@zambon-dev/library) for presentation.

## Installation

```bash
npm install @zambon-dev/framework
```

### Peer dependencies

All peers must be present in the consuming application:

| Package | Range |
| --- | --- |
| `@angular/common` | `^19.1.0` |
| `@angular/core` | `^19.1.0` |
| `@angular/forms` | `^19.1.0` |
| `@angular/router` | `^19.1.0` |
| `@auth0/angular-jwt` | `^5.2.0` |
| `@ngx-translate/core` | `^16.0.4` |
| `@zambon-dev/library` | `^1.6.0` |
| `ngx-translate-multi-http-loader` | `^19.0.2` |
| `rxjs` | `^7.8.0` |

## Usage

```ts
import { Component } from '@angular/core';
import { ButtonConfirmComponent, TabService } from '@zambon-dev/framework';

@Component({
  selector: 'app-order-detail',
  imports: [ButtonConfirmComponent],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent {
  constructor(private readonly tabs: TabService) {}
}
```

`FrameworkModule` and `FrameworkComponentsModule` are exported for NgModule-based applications.

### Tabbed navigation

`TabService` tracks open tabs and their history; `CustomReuseStrategy` keeps their component state alive
across navigation. Register the reuse strategy once, at the application root:

```ts
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from '@zambon-dev/framework';

providers: [{ provide: RouteReuseStrategy, useClass: CustomReuseStrategy }];
```

## Translations

Translation resources ship with the package and are reachable through the `./i18n/*` export:

```ts
import translations from '@zambon-dev/framework/i18n/en.json';
```

## What's included

**Components** — button flows (`ButtonConfirmComponent`, `ButtonDeleteComponent`), modals
(`ConfirmModalComponent`, `ErrorModalComponent`) and view scaffolding including tab breadcrumbs

**Services** — `AuthService`, `TabService`, `TabViewService`, `CustomReuseStrategy`

**Views** — default list and details tab views, modal view bases

Configuration providers, helpers, models and validators are exported from the package root as well.

## Documentation

Browse the published Storybook at [https://ricardozambon.github.io/ZLibraries/framework/](https://ricardozambon.github.io/ZLibraries/framework/).

To run it locally:

```bash
npm run storybook:framework
```

## Contributing

See the [workspace README](https://github.com/RicardoZambon/ZLibraries#readme) for the development setup,
and [CHANGELOG.md](./CHANGELOG.md) for release history.

## License

MIT © Ricardo Zambon
