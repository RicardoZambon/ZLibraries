# @zambon-dev/ui

Angular UI components, an application shell and a shared application layer for Zambon
applications, in one package on one version.

The three layers are separate entry points, and they stack one way: `shared` builds on
`framework`, `framework` builds on `library`, and `library` builds on neither.

| Import                     | What is in it                                                 |
| -------------------------- | ------------------------------------------------------------- |
| `@zambon-dev/ui`           | all three layers                                              |
| `@zambon-dev/ui/library`   | form controls, data grids, modals, the ribbon and the sidebar |
| `@zambon-dev/ui/framework` | tabbed navigation, view base classes, ribbon buttons          |
| `@zambon-dev/ui/shared`    | authentication, layouts, audit-history features               |
| `@zambon-dev/ui/testing`   | a test harness for rendering under an OnPush ancestor         |

Importing a layer directly keeps the dependency honest and the bundle smaller; importing the root
is fine where the layer does not matter.

## Install

```bash
npm i @zambon-dev/ui
```

Peer dependencies are the union of what the three layers need, and all are required:
`@angular/cdk`, `@angular/common`, `@angular/core`, `@angular/forms`, `@angular/platform-browser`,
`@angular/router`, `@auth0/angular-jwt`, `@microsoft/signalr`, `@ngx-translate/core`,
`ngx-resize-observer`, `ngx-translate-multi-http-loader` and `rxjs`. Angular 22 or later.

**Coming from the three separate packages?** See
[the migration guide](../../docs/guides/migrating-to-ui.md).

## Styles

Each stylesheet is named by its own subpath:

```scss
@use '@zambon-dev/ui/styles/variables.scss';
@use '@zambon-dev/ui/styles/common.scss';
```

`@zambon-dev/ui/styles/theme.css` is the Tailwind entry point and carries the design tokens. An
application that uses the components' Tailwind utilities needs it in its own build.

## Translations

The shipped translation files live under `i18n/framework` and `i18n/shared`. Spread the exported
asset patterns into your build rather than writing the paths out:

```typescript
import { ZAMBON_FRAMEWORK_I18N_ASSET, provideZambonFrameworkTranslateService } from '@zambon-dev/ui/framework';
import { ZAMBON_SHARED_I18N_ASSET } from '@zambon-dev/ui/shared';
```

## Selectors

Each layer kept the prefix it published under, so a selector still says which layer it came from:
`<lib-*>` for library, `<framework-*>` for framework, `<shared-*>` for shared.

## Development

```bash
npx nx build ui          # production package into dist/libs/ui
npx nx test ui           # Jest
npx nx lint ui           # ESLint
npx nx storybook ui      # Storybook on :4400
```

Every change under `src/` needs an entry under `## [Unreleased]` in `CHANGELOG.md`; CI enforces
it. The release pipeline stamps the version — do not write it yourself.

## Layering

The one-way rule is enforced by `no-restricted-imports` overrides in `eslint.config.mjs`, which
reject both the published subpath and the equivalent relative path. As three packages the rule
held because npm cannot express a cycle; inside one package only the lint rule holds it.

## License

MIT © Ricardo Zambon
