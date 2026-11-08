# Getting started

This guide takes an empty Angular 22 application to one rendered `lib-button`, and then to the full application shell: sidebar, top bar, tabs and sign-in.

The package works under any change-detection strategy. Zone-based and zoneless applications both render it correctly, so you do not need `zone.js` for it.

## Install the package

```bash
npm i @zambon-dev/ui
```

npm 7 and later install the peer dependencies for you. They are:

| Peer dependency                   | Range     |
| --------------------------------- | --------- |
| `@angular/cdk`                    | `^22.0.0` |
| `@angular/common`                 | `^22.0.0` |
| `@angular/core`                   | `^22.0.0` |
| `@angular/forms`                  | `^22.0.0` |
| `@angular/platform-browser`       | `^22.0.0` |
| `@angular/router`                 | `^22.0.0` |
| `@auth0/angular-jwt`              | `^5.2.0`  |
| `@microsoft/signalr`              | `^10.0.0` |
| `@ngx-translate/core`             | `^16.0.4` |
| `ngx-resize-observer`             | `^4.0.0`  |
| `ngx-translate-multi-http-loader` | `^19.0.2` |
| `rxjs`                            | `^7.8.0`  |

## Add the build requirements

The styles need Tailwind CSS 4 and Font Awesome. These are not peer dependencies, so install them yourself:

```bash
npm i -D tailwindcss @tailwindcss/postcss @tailwindcss/forms
npm i @fortawesome/fontawesome-free
```

| Package                         | Why                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| `tailwindcss` 4                 | The theme stylesheet is a Tailwind 4 entry point.                                    |
| `@tailwindcss/postcss`          | Runs Tailwind inside the Angular build.                                              |
| `@tailwindcss/forms`            | The theme loads it as a plugin.                                                      |
| `@fortawesome/fontawesome-free` | Icons. The templates use Font Awesome 6 class names (`fa-solid`), so use 6 or later. |

Tell the Angular build to run Tailwind. Create `.postcssrc.json` at the workspace root:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

The theme stylesheet tells Tailwind to scan the package's own templates. You do not configure any source paths for the package.

## Load the global styles

Three stylesheets, in this order:

1. Font Awesome.
2. `@zambon-dev/ui/styles/theme.css`: Tailwind and the design tokens.
3. `@zambon-dev/ui/styles/common.scss`: the shared component styles. It builds on the theme, so it comes after it.

The simplest form lists them in `angular.json`, under the build target's `options.styles`:

```json
"styles": [
  "@fortawesome/fontawesome-free/css/all.css",
  "@zambon-dev/ui/styles/theme.css",
  "@zambon-dev/ui/styles/common.scss",
  "src/styles.css"
]
```

If you prefer to import from your own stylesheet, put Font Awesome and the theme in a plain CSS file:

```css
/* src/styles.css */
@import '@fortawesome/fontawesome-free/css/all.css';
@import '@zambon-dev/ui/styles/theme.css';
```

Then keep `common.scss` as its own entry, after that file:

```json
"styles": ["src/styles.css", "@zambon-dev/ui/styles/common.scss"]
```

`common.scss` must stay a separate entry. It finds the theme by a path relative to itself, so pulling it into your own Sass file with `@use` fails the build.

### Optional: dark theme without a flash

The theme is light unless the `data-theme` attribute on `<html>` says otherwise. The main layout's theme switch sets it, so the dark theme is always available there. A short script in `index.html` sets the attribute before the first paint, so a user who chose dark never sees a flash of light. See [Theming](./design-tokens.md) for the snippet and the other theming options.

## Render one component

A presentation component from `@zambon-dev/ui/library` needs no providers. `lib-button` only needs the styles above:

```ts
import { Component } from '@angular/core';
import { ButtonComponent } from '@zambon-dev/ui/library';

@Component({
  selector: 'app-root',
  imports: [ButtonComponent],
  template: ` <lib-button intent="primary" icon="fa-solid fa-floppy-disk" (click)="save()">Save</lib-button> `,
})
export class App {
  protected save(): void {
    console.log('saved');
  }
}
```

`intent` is `primary`, `secondary` (the default), `danger` or `ghost`. The inner element is a real `<button>`, so `(click)` and `type="submit"` work as usual.

## Providers for library components

Components in `@zambon-dev/ui/library` ask only for what they use. Most need nothing. A few need a form, a dataset, translations or the router.

| Component        | What it needs                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `lib-button`     | Nothing.                                                                                                                          |
| `lib-modal`      | Nothing.                                                                                                                          |
| `lib-form-input` | A parent `[formGroup]` and a `FormService` provided by the host component.                                                        |
| `lib-data-grid`  | A `DataGridDataset` subclass, a `GridConfigsProvider`, translations (`provideTranslateService`) and the router (`provideRouter`). |
| `lib-sidebar`    | A `SidebarService` subclass. `SIDEBAR_CONFIGS` is optional.                                                                       |

A form field. The field is editable while the form is enabled:

```ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormInputComponent, FormService } from '@zambon-dev/ui/library';

@Component({
  selector: 'app-name-form',
  imports: [ReactiveFormsModule, FormInputComponent],
  providers: [FormService],
  template: `
    <form [formGroup]="form">
      <lib-form-input controlName="name"></lib-form-input>
    </form>
  `,
})
export class NameForm {
  protected readonly form = new FormGroup({ name: new FormControl('Ada') });
}
```

A data grid. The dataset supplies the columns and the rows:

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { DataGridConfigsProvider, GridConfigsProvider } from '@zambon-dev/ui/library';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    provideTranslateService({ defaultLanguage: 'en' }),
    { provide: GridConfigsProvider, useClass: DataGridConfigsProvider },
  ],
};
```

```ts
// people-grid.ts
import { Component, Injectable } from '@angular/core';
import { DataGridComponent, DataGridDataset, IGridColumn } from '@zambon-dev/ui/library';
import { Observable, of } from 'rxjs';

@Injectable()
class PeopleDataset extends DataGridDataset {
  public override columns: IGridColumn[] = [
    { field: 'id', headerName: 'ID', size: '5rem' },
    { field: 'name', headerName: 'Name', size: 'minmax(12rem, 1fr)' },
  ];

  public getData(): Observable<any[]> {
    return of([
      { id: 1, name: 'Ada Lovelace' },
      { id: 2, name: 'Alan Turing' },
    ]);
  }
}

@Component({
  selector: 'app-people-grid',
  imports: [DataGridComponent],
  providers: [{ provide: DataGridDataset, useClass: PeopleDataset }],
  template: `<lib-data-grid></lib-data-grid>`,
})
export class PeopleGrid {}
```

Column headers and grid messages go through the `translate` pipe. Without loaded translations they show as written.

## The full application shell

`MainLayoutComponent` from `@zambon-dev/ui/shared` is the whole shell: sidebar, top bar, tabbed content and the sign-out flow. `SharedAuthModule` adds the sign-in screen. Together they need the providers below.

| Provider                                                    | Why                                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `APP_CONFIG` with an `AppConfig`                            | The API base URL, plus the brand, environment, version and notification options.            |
| `provideHttpClient(withInterceptorsFromDi())`               | The services call your API. Class-based interceptors need `withInterceptorsFromDi()`.       |
| `JwtModule.forRoot(...)` and `JwtInterceptor`               | `JwtHelperService` reads token expiry. `AuthInterceptor` injects `JwtInterceptor` by class. |
| `AuthInterceptor` in `HTTP_INTERCEPTORS`                    | Refreshes an expired token before a request to your API is sent.                            |
| `AuthService` aliased to `AuthenticationService`            | Ribbon buttons and notifications ask for `AuthService` to check permissions.                |
| `RouteReuseStrategy` set to `CustomReuseStrategy`           | Keeps each tab's view alive when you switch tabs.                                           |
| `SidebarService` set to your subclass                       | Supplies the menu tree.                                                                     |
| `SIDEBAR_CONFIGS` (optional)                                | Sidebar texts and options.                                                                  |
| `GridConfigsProvider` set to `FrameworkGridConfigsProvider` | Grid messages as translation keys, which the shipped translations resolve.                  |
| A translate service with the package's translation files    | Every label. See [Internationalization](./internationalization.md).                         |
| `provideRouter(routes)`                                     | The main and login layouts as routes. `AuthGuard` protects the main layout.                 |

`AuthenticationService`, `AuthGuard`, `TabService`, `ThemeService` and the history services are `providedIn: 'root'`. You do not list them.

### The sidebar service

Subclass `SidebarService` and implement its three abstract members:

```ts
import { Injectable } from '@angular/core';
import { ISidebarProfile, SidebarMenu, SidebarService } from '@zambon-dev/ui/library';
import { Observable, of } from 'rxjs';

@Injectable()
export class AppSidebarService extends SidebarService {
  public getMenuFromUrl(url: string): Observable<SidebarMenu> {
    return of(new SidebarMenu({ id: 1, label: 'Menu-Dashboard', icon: 'fa-chart-line', url }));
  }

  public getUserProfile(): ISidebarProfile | undefined {
    return undefined;
  }

  protected loadMenus(parentMenu: SidebarMenu | null): Observable<SidebarMenu[]> {
    if (parentMenu) {
      return of([]);
    }
    return of([new SidebarMenu({ id: 1, label: 'Menu-Dashboard', icon: 'fa-chart-line', url: '/dashboard' })]);
  }
}
```

`loadMenus(null)` returns the root menus. `loadMenus(menu)` returns that menu's children. `getMenuFromUrl` gives an open tab its title. In a real application these call your API.

### Routes

The main layout hosts your screens as child routes. The sign-in screen comes from `SharedAuthModule`, which serves `/login`. Keep the main layout first: both routes start at the empty path.

```ts
// app.routes.ts
import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { DefaultTabViewComponent, FRAMEWORK_VIEW_TYPE, FrameworkViewType } from '@zambon-dev/ui/framework';
import { AuthGuard, externalContentRoutes, MainLayoutComponent, SharedAuthModule } from '@zambon-dev/ui/shared';

@Component({ selector: 'app-dashboard', template: `<p>Dashboard</p>` })
class Dashboard {}

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // Only needed when sidebar menus open external content inside a tab.
      ...externalContentRoutes,
      {
        path: 'dashboard',
        component: DefaultTabViewComponent,
        data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
        children: [{ path: '', component: Dashboard }],
      },
    ],
  },
  { path: '', loadChildren: () => SharedAuthModule },
];
```

Every route a tab can open needs a `FRAMEWORK_VIEW_TYPE` in its data. Use one path segment per route and nest them. [Tabbed navigation](./tabbed-navigation.md) explains both rules, and [Building views](./building-views.md) covers list and details screens.

### The application config

```ts
// app.config.ts
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { JwtInterceptor, JwtModule } from '@auth0/angular-jwt';
import {
  APP_CONFIG,
  AppConfig,
  AuthService,
  CustomReuseStrategy,
  FrameworkGridConfigsProvider,
  ZAMBON_FRAMEWORK_I18N_RESOURCES,
} from '@zambon-dev/ui/framework';
import { GridConfigsProvider, SIDEBAR_CONFIGS, SidebarConfigs, SidebarService } from '@zambon-dev/ui/library';
import { AuthenticationService, AuthInterceptor, provideZambonSharedTranslateService } from '@zambon-dev/ui/shared';
import { AppSidebarService } from './app-sidebar.service';
import { routes } from './app.routes';

const apiBaseUrl = 'https://api.example.com';

function tokenGetter(): string | null {
  return localStorage.getItem('token') ?? sessionStorage.getItem('token');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter,
          allowedDomains: ['api.example.com'],
          disallowedRoutes: [`${apiBaseUrl}/Authentication/SignIn`, `${apiBaseUrl}/Authentication/RefreshToken`],
        },
      }),
    ),
    JwtInterceptor,

    { provide: APP_CONFIG, useValue: new AppConfig(apiBaseUrl, { appName: 'My App', version: '1.0.0' }) },
    { provide: AuthService, useExisting: AuthenticationService },
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    { provide: SidebarService, useClass: AppSidebarService },
    { provide: SIDEBAR_CONFIGS, useValue: new SidebarConfigs({ loadingText: 'Loading' }) },
    { provide: GridConfigsProvider, useClass: FrameworkGridConfigsProvider },

    provideZambonSharedTranslateService({
      defaultLanguage: 'en',
      appResources: [...ZAMBON_FRAMEWORK_I18N_RESOURCES, { prefix: '/assets/i18n/', suffix: '.json' }],
    }),
  ],
};
```

Some details matter:

- `AuthenticationService` stores the token under the `token` key, in local or session storage. The `tokenGetter` reads the same key.
- Put the sign-in and refresh endpoints in `disallowedRoutes`. Otherwise the refresh request would try to refresh itself.
- The translation provider loads the files from your build output. Add the asset entries from [Internationalization](./internationalization.md), and call `addLangs` and `use` on `TranslateService` at startup.
- `AuthenticationService` calls `{BASE_URL}/Authentication/SignIn`, `/RefreshToken` and `/GetActions`. [Backend contract](./backend-contract.md) lists the endpoints and payloads your API must provide.

The top bar's brand, environment badge and notifications are `AppConfig` options. See [Top bar configuration](./top-bar-configuration.md).

## Next steps

- [Theming](./design-tokens.md): theme colours, dark mode and overrides.
- [Internationalization](./internationalization.md): shipped languages and your own translations.
- [Tabbed navigation](./tabbed-navigation.md): how tabs map to routes.
- [Building views](./building-views.md): list and details screens on the view base classes.
- [Details views](./details-views.md): sub-views, audit history and conditional views.
- [Top bar configuration](./top-bar-configuration.md): brand, environment badge, notifications.
- [Backend contract](./backend-contract.md): what your API must expose.
- [Change detection and zoneless](./reactivity.md): why the package renders under any change-detection strategy.
- [Compatibility](./compatibility.md): supported Angular and dependency versions.
