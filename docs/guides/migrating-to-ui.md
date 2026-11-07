# Migrating to `@zambon-dev/ui`

`@zambon-dev/library`, `@zambon-dev/framework` and `@zambon-dev/shared` are now one package,
`@zambon-dev/ui`. It exposes the same three layers as entry points. Component behaviour and APIs
did not change. Only the import paths did.

One package has one version, so the layers can no longer fall out of step with each other.

## Install

```bash
npm uninstall @zambon-dev/library @zambon-dev/framework @zambon-dev/shared
npm i @zambon-dev/ui
```

## TypeScript imports

| Was                           | Now                        |
| ----------------------------- | -------------------------- |
| `@zambon-dev/library`         | `@zambon-dev/ui/library`   |
| `@zambon-dev/framework`       | `@zambon-dev/ui/framework` |
| `@zambon-dev/shared`          | `@zambon-dev/ui/shared`    |
| `@zambon-dev/library/testing` | `@zambon-dev/ui/testing`   |

A find-and-replace over your `.ts` files does this step. Limit it to `.ts`: stylesheet paths need
the different mapping in the next section, and this script would turn them into paths that do not
exist. The longest specifier comes first, or `@zambon-dev/library/testing` would become
`@zambon-dev/ui/library/testing`. The script uses GNU `sed`.

```bash
grep -rl --include='*.ts' '@zambon-dev/' src \
  | xargs sed -i \
      -e 's|@zambon-dev/library/testing|@zambon-dev/ui/testing|g' \
      -e 's|@zambon-dev/framework|@zambon-dev/ui/framework|g' \
      -e 's|@zambon-dev/library|@zambon-dev/ui/library|g' \
      -e 's|@zambon-dev/shared|@zambon-dev/ui/shared|g'
```

You can also import from the package root, `@zambon-dev/ui`, which re-exports all three layers.
One name exists in two layers: at the root, `ButtonComponent` is the framework button
(`framework-button`). The library button (`lib-button`) is `LibButtonComponent` at the root, or
`ButtonComponent` from `@zambon-dev/ui/library`.

## Stylesheets

Each old stylesheet subpath maps to a named file:

| Was                                         | Now                                    |
| ------------------------------------------- | -------------------------------------- |
| `@zambon-dev/library/styles`                | `@zambon-dev/ui/styles/variables.scss` |
| `@zambon-dev/library/styles/variables`      | `@zambon-dev/ui/styles/variables.scss` |
| `@zambon-dev/library/styles/variables.scss` | `@zambon-dev/ui/styles/variables.scss` |
| `@zambon-dev/shared/styles`                 | `@zambon-dev/ui/styles/common.scss`    |
| `@zambon-dev/shared/styles/common`          | `@zambon-dev/ui/styles/common.scss`    |
| `@zambon-dev/shared/styles/common.scss`     | `@zambon-dev/ui/styles/common.scss`    |
| `@zambon-dev/shared/styles/theme`           | `@zambon-dev/ui/styles/theme.css`      |
| `@zambon-dev/shared/styles/theme.css`       | `@zambon-dev/ui/styles/theme.css`      |
| `@zambon-dev/shared/styles/variables`       | `@zambon-dev/ui/styles/variables.scss` |
| `@zambon-dev/shared/styles/variables.scss`  | `@zambon-dev/ui/styles/variables.scss` |

The bare `/styles` subpath is gone, because the two old packages resolved it to different files.
The old library and shared `variables.scss` files were identical, so both map to the same file.

Apply this table in your stylesheets (`@import`, `@use`, `@reference`). This command lists the
lines still to change:

```bash
grep -rn --include='*.scss' --include='*.css' '@zambon-dev/\(library\|framework\|shared\)' src
```

## `angular.json` or `project.json`

Global stylesheets and translation assets usually live in the build options of `angular.json` or
`project.json`. Update both.

### `styles`

Replace each old path with its new one from the table above. For example:

```json
"styles": [
  "node_modules/@zambon-dev/ui/styles/theme.css",
  "node_modules/@zambon-dev/ui/styles/common.scss",
  "src/styles.scss"
]
```

### `assets`

The translation files moved to one folder per layer. The output paths did not change, so your
application looks translations up where it did before. Replace the two old asset entries with:

```json
"assets": [
  {
    "glob": "**/*.json",
    "input": "node_modules/@zambon-dev/ui/i18n/framework",
    "output": "assets/i18n/zambon-dev/framework"
  },
  {
    "glob": "**/*.json",
    "input": "node_modules/@zambon-dev/ui/i18n/shared",
    "output": "assets/i18n/zambon-dev/shared"
  }
]
```

The old inputs were `node_modules/@zambon-dev/framework/i18n` and
`node_modules/@zambon-dev/shared/i18n`.

If a build script spreads the exported constants instead, it needs no change.
`ZAMBON_FRAMEWORK_I18N_ASSET` (from `@zambon-dev/ui/framework`) and `ZAMBON_SHARED_I18N_ASSET`
(from `@zambon-dev/ui/shared`) already hold the new paths. JSON files cannot import them.

Then search the two files for leftovers:

```bash
grep -n '@zambon-dev/\(library\|framework\|shared\)' angular.json project.json
```

## Peer dependencies

The peer set is the union of what the three packages asked for. All of it is required:

```text
@angular/cdk  @angular/common  @angular/core  @angular/forms  @angular/platform-browser
@angular/router  @auth0/angular-jwt  @microsoft/signalr  @ngx-translate/core
ngx-resize-observer  ngx-translate-multi-http-loader  rxjs
```

An application that used all three packages already has all of them.

## One moved export

`AngularAssetPattern` was declared in both the framework and the shared i18n helpers. It is now
declared once, in the library layer. Import it from `@zambon-dev/ui` or `@zambon-dev/ui/library`.
The framework and shared layers no longer export it.

## The old packages

The old packages are deprecated on npm and get no new releases. Their released versions stay
installable. Their changelogs are kept under **Package history** in the
[package changelog](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/CHANGELOG.md).

Applications still on Angular 19 should stay on the last Angular 19 releases: `framework@1.4.7`,
`library@1.6.9` and `shared@2.1.4`. This change does not affect them.
