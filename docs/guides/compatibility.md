# Compatibility

What `@zambon-dev/ui` runs on, and how its versions change.

## Supported versions

| Dependency                        | Supported                            | Notes                                                         |
| --------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| Angular                           | 22.x                                 | Peers are `^22.0.0`. Angular 23 is not supported yet          |
| TypeScript                        | 6.0.x                                | Angular 22's compiler requires `>=6.0 <6.1`                   |
| Node.js (to build your app)       | `^22.22.3`, `^24.15.0` or `>=26.0.0` | Angular 22's range. The package itself is tested on Node 24   |
| RxJS                              | `^7.8.0`                             |                                                               |
| `@ngx-translate/core`             | `^16.0.4`                            | Capped at 16. Versions 17 and later are not supported yet     |
| `ngx-translate-multi-http-loader` | `^19.0.2`                            |                                                               |
| `ngx-resize-observer`             | `^4.0.0`                             | The Angular 22 line                                           |
| `@auth0/angular-jwt`              | `^5.2.0`                             |                                                               |
| `@microsoft/signalr`              | `^10.0.0`                            |                                                               |
| Tailwind CSS                      | 4.x                                  | With `@tailwindcss/postcss` and `@tailwindcss/forms`          |
| Font Awesome                      | 6 or later                           | Version 7 is tested. Templates use Font Awesome 6 class names |

Tailwind CSS and Font Awesome are not peers. Your application installs them. See
[Getting started](./getting-started.md) for the setup.

## Change detection

Both setups are supported:

- zoneless, with `provideZonelessChangeDetection()`;
- zone.js, with `provideZoneChangeDetection()`.

The components render correctly under either, and under any change-detection strategy your own
components use. See [Change detection and zoneless](./reactivity.md).

## Browsers

The package supports current evergreen browsers: Chrome, Edge, Firefox and Safari. It sets no
browserslist of its own.

The styles rely on these CSS features, so older browsers will render parts of the UI wrongly:

| Feature                   | Used for                                     |
| ------------------------- | -------------------------------------------- |
| `color-mix()`             | Shades and tints derived from theme tokens   |
| Container queries         | Components that adapt to their own width     |
| Cascade layers (`@layer`) | Tailwind's layers and the theme's base rules |
| `backdrop-filter`         | The blurred glass surface behind the tabs    |

## Versioning

Releases are made by semantic-release from the commit history. The version follows
[Semantic Versioning](https://semver.org/):

| Release | Contains                           |
| ------- | ---------------------------------- |
| Major   | Breaking changes                   |
| Minor   | New features, backwards compatible |
| Patch   | Fixes, backwards compatible        |

**Two minors broke this rule.** 1.1.0 and 1.2.0 were released as minors but carried breaking
changes. Both are listed in the changelog with their migration steps. From now on, breaking
changes ship only in a major.

## Upgrade notes

Every release has a section in the
[changelog](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/CHANGELOG.md). When a
release needs action from you, its **⚠ Breaking Changes / Migration** subsection lists the steps.
Read it for every version you skip over, not only the one you land on.

Coming from `@zambon-dev/library`, `@zambon-dev/framework` or `@zambon-dev/shared`? See
[Migrating to @zambon-dev/ui](./migrating-to-ui.md).

## Deprecation policy

- A deprecated API is marked `@deprecated` in its documentation comment. Your editor shows it
  struck through, and the comment names the replacement.
- Each deprecation is listed under **Deprecated** in the changelog of the release that made it.
- A deprecated API is removed only in a major release.
