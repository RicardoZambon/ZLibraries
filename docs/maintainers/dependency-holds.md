# Dependency holds

Renovate keeps most dependencies current. Some updates wait for approval on the Renovate
dependency dashboard instead of opening a PR. This page records why.

**Renovate is not installed on the repository yet.** The configuration in `.github/renovate.json`
does nothing until the owner installs the Renovate GitHub app. Until then, every update is manual,
and the rules below are the ones to follow by hand.

## What waits for approval

| Update                            | Rule                                                       |
| --------------------------------- | ---------------------------------------------------------- |
| Any major of a runtime dependency | Dashboard approval. Angular, Tailwind and Font Awesome too |
| `typescript` major                | Dashboard approval, and held at 6.0.x (see below)          |
| `@ngx-translate/core` major       | Dashboard approval, and held at 16.x (see below)           |
| `@types/node`                     | Capped below 25, to match the Node version CI runs (24)    |

"Runtime dependency" means the `dependencies` block of the root `package.json`. A major there
changes what consumers must install, so it is never automatic.

## TypeScript: held at 6.0.x

Not a choice. `@angular/compiler-cli@22` requires `typescript >=6.0 <6.1`. TypeScript 7 cannot be
used until Angular supports it. Revisit when Angular's peer range moves.

## @ngx-translate/core: held at 16.x

The package works on Angular 22. The hold is about what a major would cost consumers.

- The package declares `@ngx-translate/core: ^16.0.4` as a peer. Raising it forces every consumer
  to upgrade ngx-translate in the same step, so it is a breaking change for this package.
- `provideZambonFrameworkTranslateService()` and `provideZambonSharedTranslateService()` wrap
  ngx-translate's `provideTranslateService()`. Their config types,
  `ZambonFrameworkTranslateConfig` and `ZambonSharedTranslateConfig`, forward `defaultLanguage`
  to it. If a later major renames or reshapes that option, these exported types change with it.

Take this update together with `ngx-translate-multi-http-loader` (on 19.x), which the framework's
translate loader uses. Ship it with a migration note in the changelog.

## Overrides

`smol-toml` is overridden to `^1.9.0`. Nx depends on an older version that carries a
high-severity denial-of-service advisory
([GHSA-7w5x-hrqm-74c2](https://github.com/advisories/GHSA-7w5x-hrqm-74c2)). `npm audit fix`
proposes downgrading Nx instead, which is the wrong direction. The override stays within the same
major. Remove it when Nx depends on 1.9.0 or newer itself.

## Moved together

These are not held, but they must move as a set:

- **Angular group:** `@angular/*`, `@angular-devkit/*`, `@schematics/angular`, `angular-eslint`,
  `ng-packagr` and `zone.js`. A split upgrade does not build.
- **Nx group:** every `@nx/*` package on the same version as `nx`.
- **Storybook group:** `storybook` and `@storybook/*`.
- **Jest group:** `jest`, `jest-*`, `ts-jest` and `@types/jest`.

`ngx-resize-observer` is **not** in the Angular group. Its majors track Angular majors one to one
(4.x is the Angular 22 line), so bump it by hand with each Angular major, together with its peer
range in the package.

## Tailwind CSS 4

Two rules from the move to Tailwind 4 still hold:

- **A stylesheet that uses `@apply` must declare `@reference` to `theme.css`.** Tailwind 4 does
  not carry the theme to every file. Without the line, `@apply` fails.
- **`theme.css` restores two Tailwind 3 defaults:** a `gray-200` border colour (Tailwind 4 uses
  `currentColor`) and the pointer cursor on buttons. Removing either is a visual change across the
  whole package. Run the style snapshot before you do.

A Tailwind upgrade changes how things look, and no unit test checks computed styles. Compare two
style snapshots, before and after, as the
[style snapshot README](../../tools/style-snapshot/README.md) describes.

## Font Awesome 7

Font Awesome is not a peer. Each application brings its own, so this version only decides what
the Storybook and the docs site render with.

Component templates use Font Awesome 6 class names (`fa-solid`, `fa-regular`), so consumers need
version 6 or later. Version 7 is the one tested. Every `fa-` name the package emits exists in
version 7, including the older aliases it still uses (`fa-edit`, `fa-times`, `fa-save` and
others). A consumer that passes its own icon names into `icon` inputs should check those names
against its Font Awesome version.
