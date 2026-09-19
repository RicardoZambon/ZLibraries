# @zambon-dev/library

Angular UI components and shared presentation utilities for Zambon applications.

This is the presentation layer of [ZLibraries](https://github.com/RicardoZambon/ZLibraries). It has no
knowledge of authentication, routing shells or backend contracts — those live in
[`@zambon-dev/framework`](https://www.npmjs.com/package/@zambon-dev/framework) and
[`@zambon-dev/shared`](https://www.npmjs.com/package/@zambon-dev/shared), both of which build on this package.

## Installation

```bash
npm install @zambon-dev/library
```

### Peer dependencies

All peers must be present in the consuming application:

| Package               | Range     |
| --------------------- | --------- |
| `@angular/cdk`        | `^19.1.5` |
| `@angular/common`     | `^19.1.0` |
| `@angular/core`       | `^19.1.0` |
| `@angular/forms`      | `^19.1.0` |
| `@angular/router`     | `^19.1.0` |
| `@ngx-translate/core` | `^16.0.4` |
| `ngx-resize-observer` | `^3.0.0`  |
| `rxjs`                | `^7.8.0`  |

## Usage

Every component is standalone, so import only what a given component needs:

```ts
import { Component } from '@angular/core';
import { DataGridComponent, FormInputComponent } from '@zambon-dev/library';

@Component({
  selector: 'app-customers',
  imports: [DataGridComponent, FormInputComponent],
  templateUrl: './customers.component.html',
})
export class CustomersComponent {}
```

`LibraryModule` is also exported for applications that are still NgModule-based, and re-exports every
component, directive and pipe listed below.

## Styles

The package ships SCSS that the components expect. Import it once, at the application root:

```scss
@use '@zambon-dev/library/styles' as library;
```

That entry point resolves to `styles/variables.scss` and is also reachable as
`@zambon-dev/library/styles/variables`.

## What's included

**Components** — `BaseComponent`, `CatalogSelectComponent`, `DataGridComponent`, `DataGridRowComponent`,
`FormInputComponent`, `FormInputGroupComponent`, `FormGroupComponent`, `GroupAccordionComponent`,
`GroupContainerComponent`, `GroupScrollSpyComponent`, `ModalComponent`, `MultiEditorComponent`,
`MultiSelectComponent`, `MultiSelectResultGridComponent`, `SidebarComponent`, `RibbonComponent`,
`RibbonButtonComponent`, `RibbonGroupComponent`

**Directives** — `ScrollSpyDirective`

**Pipes** — `EnumTranslatePipe`, `ReplacePipe`, `ReplaceManyPipe`

Helpers, models, configuration providers, services and validators are exported from the package root as well.

## Documentation

Browse the published Storybook at [https://ricardozambon.github.io/ZLibraries/library/](https://ricardozambon.github.io/ZLibraries/library/).

Component behaviour and variants are documented as stories alongside the source. To run it locally:

```bash
npm run storybook:library
```

## Contributing

See the [workspace README](https://github.com/RicardoZambon/ZLibraries#readme) for the development setup,
and [CHANGELOG.md](./CHANGELOG.md) for release history.

## License

MIT © Ricardo Zambon
