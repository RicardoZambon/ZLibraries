# @zambon-dev/ui

[![npm version](https://img.shields.io/npm/v/@zambon-dev/ui)](https://www.npmjs.com/package/@zambon-dev/ui)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/LICENSE)
[![docs](https://img.shields.io/badge/docs-ricardozambon.github.io-blue)](https://ricardozambon.github.io/ZLibraries/)

Angular 22 components and a complete application shell, in one package. Use the form controls, data grid, modals and ribbon on their own, or take the whole shell: sidebar, top bar, tabbed navigation, sign-in and audit history. Everything is themed with Tailwind CSS 4 design tokens, has a dark theme, and renders under OnPush and zoneless change detection.

## Entry points

| Import                     | What is in it                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `@zambon-dev/ui/library`   | Form controls, data grid, modal, multi-select and multi-editor, ribbon, sidebar, button. |
| `@zambon-dev/ui/framework` | Tabbed navigation, view base classes, ribbon action buttons, confirm and error modals.   |
| `@zambon-dev/ui/shared`    | Authentication, main and login layouts, top bar, theme, audit history.                   |
| `@zambon-dev/ui/testing`   | A harness that renders a component under an OnPush ancestor, for your tests.             |
| `@zambon-dev/ui`           | All of `library`, `framework` and `shared`.                                              |

Selectors keep their layer's prefix: `lib-` for library, `framework-` for framework, `shared-` for shared.

The library and the framework both export a `ButtonComponent`. From the root import, `ButtonComponent` is the framework button, and the library button is `LibButtonComponent`. Import from `@zambon-dev/ui/library` to get the library button under its own name.

## Quick start

Install the package. npm 7 and later install the peer dependencies too.

```bash
npm i @zambon-dev/ui
npm i -D tailwindcss @tailwindcss/postcss @tailwindcss/forms
npm i @fortawesome/fontawesome-free
```

Add a `.postcssrc.json` at the workspace root:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Add the global styles to `angular.json`, in this order:

```json
"styles": [
  "@fortawesome/fontawesome-free/css/all.css",
  "@zambon-dev/ui/styles/theme.css",
  "@zambon-dev/ui/styles/common.scss",
  "src/styles.css"
]
```

Render a component:

```ts
import { Component } from '@angular/core';
import { ButtonComponent } from '@zambon-dev/ui/library';

@Component({
  selector: 'app-root',
  imports: [ButtonComponent],
  template: `<lib-button intent="primary" icon="fa-solid fa-floppy-disk">Save</lib-button>`,
})
export class App {}
```

The [getting started guide](https://github.com/RicardoZambon/ZLibraries/blob/main/docs/guides/getting-started.md) covers the providers for the data grid and forms, and the full application shell.

## Documentation

- [Documentation site](https://ricardozambon.github.io/ZLibraries/)
- [Getting started](https://github.com/RicardoZambon/ZLibraries/blob/main/docs/guides/getting-started.md)
- [Theming and design tokens](https://github.com/RicardoZambon/ZLibraries/blob/main/docs/guides/design-tokens.md)
- [Internationalization](https://github.com/RicardoZambon/ZLibraries/blob/main/docs/guides/internationalization.md)
- [Changelog](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/CHANGELOG.md)
- [Migrating from the separate packages](https://github.com/RicardoZambon/ZLibraries/blob/main/docs/guides/migrating-to-ui.md)
- [Issues](https://github.com/RicardoZambon/ZLibraries/issues)

## Compatibility

Angular 22. The Angular peer range is `^22.0.0`.

## License

[MIT](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/LICENSE) © Ricardo Zambon
