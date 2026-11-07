# @zambon-dev/ui

Angular components and an application shell for data-heavy business apps, themed with Tailwind
CSS 4.

[![npm version](https://img.shields.io/npm/v/@zambon-dev/ui)](https://www.npmjs.com/package/@zambon-dev/ui)
[![PR Validation](https://github.com/RicardoZambon/ZLibraries/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/RicardoZambon/ZLibraries/actions/workflows/pr-validation.yml)
[![Release](https://github.com/RicardoZambon/ZLibraries/actions/workflows/release.yml/badge.svg)](https://github.com/RicardoZambon/ZLibraries/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-online-blue)](https://ricardozambon.github.io/ZLibraries/)

## What's in it

One package, split into entry points. Import from the one you need.

| Entry point                | What it contains                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `@zambon-dev/ui/library`   | Form controls, data grid, modal, multi-select and multi-editor, ribbon, sidebar, button |
| `@zambon-dev/ui/framework` | Tabbed navigation, view base classes, ribbon action buttons, confirm and error modals   |
| `@zambon-dev/ui/shared`    | Authentication, main and login layouts, top bar, light and dark theme, audit history    |
| `@zambon-dev/ui/testing`   | A harness that renders a component under an OnPush parent                               |

Selectors carry the entry point's prefix: `lib-`, `framework-` or `shared-`.

## Install

```bash
npm i @zambon-dev/ui
npm i -D tailwindcss @tailwindcss/postcss @tailwindcss/forms
npm i @fortawesome/fontawesome-free
```

npm installs the remaining peer dependencies (Angular, ngx-translate and others) for you.

## Minimal setup

Enable Tailwind's PostCSS plugin in `.postcssrc.json` at the project root:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Add the package's styles to your build in `angular.json`:

```json
"styles": [
  "@fortawesome/fontawesome-free/css/all.css",
  "@zambon-dev/ui/styles/theme.css",
  "@zambon-dev/ui/styles/common.scss",
  "src/styles.css"
]
```

Use a component:

```ts
import { Component } from '@angular/core';
import { ButtonComponent } from '@zambon-dev/ui/library';

@Component({
  selector: 'app-root',
  imports: [ButtonComponent],
  template: `<lib-button intent="primary" icon="fa-solid fa-floppy-disk">Save</lib-button>`,
})
export class AppComponent {}
```

Most other components also need translations, HTTP and routing. The
[getting started guide](docs/guides/getting-started.md) covers the full setup.

## Documentation

- [Documentation site](https://ricardozambon.github.io/ZLibraries/)
- [Storybook](https://ricardozambon.github.io/ZLibraries/storybook/), with every component live

Guides:

| Guide                                                         | What it covers                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| [Getting started](docs/guides/getting-started.md)             | Install, styles, providers and a first screen                   |
| [Internationalization](docs/guides/internationalization.md)   | The shipped translations and how to add your own                |
| [Design tokens and theming](docs/guides/design-tokens.md)     | The tokens, what is safe to override, and the dark theme        |
| [Top bar configuration](docs/guides/top-bar-configuration.md) | Brand, environment badge, notifications, language, user profile |
| [Change detection and zoneless](docs/guides/reactivity.md)    | How the components render under OnPush and zoneless             |
| [Details views](docs/guides/details-views.md)                 | The route data a details tab reads, and views per record        |
| [Tabbed navigation](docs/guides/tabbed-navigation.md)         | Opening, switching and closing tabs                             |
| [Building views](docs/guides/building-views.md)               | List and details views from the view base classes               |
| [Backend contract](docs/guides/backend-contract.md)           | The endpoints and payloads the components expect                |
| [Compatibility](docs/guides/compatibility.md)                 | Supported versions, browsers, versioning and deprecation policy |
| [Migrating to @zambon-dev/ui](docs/guides/migrating-to-ui.md) | Moving from the three former packages                           |

## Compatibility

Angular 22, TypeScript 6.0, Tailwind CSS 4 and current evergreen browsers. Zoneless and zone.js
apps are both supported. See [Compatibility](docs/guides/compatibility.md) for the full list.

`@zambon-dev/library`, `@zambon-dev/framework` and `@zambon-dev/shared` are retired and replaced
by this package. See [the migration guide](docs/guides/migrating-to-ui.md).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Everyone taking part
follows the [Code of Conduct](CODE_OF_CONDUCT.md). Report security problems privately, as the
[security policy](.github/SECURITY.md) explains.

## Changelog

Every release, with migration steps where needed, is in the
[changelog](libs/ui/CHANGELOG.md).

## License

[MIT](LICENSE) © Ricardo Zambon
