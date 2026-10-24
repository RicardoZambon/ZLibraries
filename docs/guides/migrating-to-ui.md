# Migrating to `@zambon-dev/ui`

`@zambon-dev/library`, `@zambon-dev/framework` and `@zambon-dev/shared` are now one package,
`@zambon-dev/ui`, which exposes the same three layers as entry points. Nothing about a component's
behaviour or its API changed; what changed is where you import it from.

## Why

Each package carried its own version, and the compatibility between them lived in hand-written
`peerDependencies` ranges. Those ranges could not be checked before the release that invalidated
them: at pull-request time they were still correct, the release raised the versions, and only then
did they go stale. It happened three times, the last on 2026-10-23, when all three majors shipped
from one merge commit and left every range behind — `framework@5.0.0` on npm asked for
`library@^3.0.0` while `library` was at `4.0.0`, so installing the two together failed.

One package has one version. There is no range between layers left to go stale.

## Install

```bash
npm uninstall @zambon-dev/library @zambon-dev/framework @zambon-dev/shared
npm i @zambon-dev/ui
```

## Imports

| Was                           | Now                        |
| ----------------------------- | -------------------------- |
| `@zambon-dev/library`         | `@zambon-dev/ui/library`   |
| `@zambon-dev/framework`       | `@zambon-dev/ui/framework` |
| `@zambon-dev/shared`          | `@zambon-dev/ui/shared`    |
| `@zambon-dev/library/testing` | `@zambon-dev/ui/testing`   |

`@zambon-dev/ui` re-exports all three layers, so where the layer does not matter you can import
from the package root instead.

A find-and-replace across your source does the whole job. Replace the longest specifiers first,
or `@zambon-dev/library/testing` becomes `@zambon-dev/ui/library/testing`, which does not exist:

```bash
grep -rl '@zambon-dev/' src \
  | xargs sed -i \
      -e 's|@zambon-dev/library/testing|@zambon-dev/ui/testing|g' \
      -e 's|@zambon-dev/framework|@zambon-dev/ui/framework|g' \
      -e 's|@zambon-dev/library|@zambon-dev/ui/library|g' \
      -e 's|@zambon-dev/shared|@zambon-dev/ui/shared|g'
```

## Stylesheets

Both `@zambon-dev/library/styles` and `@zambon-dev/shared/styles` existed, and they resolved to
different files. In one package that is ambiguous, so the bare subpath is gone and each stylesheet
is named:

| Was                                   | Now                                    |
| ------------------------------------- | -------------------------------------- |
| `@zambon-dev/library/styles`          | `@zambon-dev/ui/styles/variables.scss` |
| `@zambon-dev/shared/styles`           | `@zambon-dev/ui/styles/common.scss`    |
| `@zambon-dev/shared/styles/theme.css` | `@zambon-dev/ui/styles/theme.css`      |
| `@zambon-dev/shared/styles/variables` | `@zambon-dev/ui/styles/variables.scss` |

The two `variables.scss` files were byte-identical, so both old subpaths now mean the same file.

## Translations

The shipped translation files moved under a folder per layer, to `@zambon-dev/ui/i18n/framework`
and `@zambon-dev/ui/i18n/shared`.

If your build spreads the exported constants, nothing changes — they carry the new paths:

```typescript
import { ZAMBON_FRAMEWORK_I18N_ASSET } from '@zambon-dev/ui/framework';
import { ZAMBON_SHARED_I18N_ASSET } from '@zambon-dev/ui/shared';

// angular.json / project.json
"assets": [ZAMBON_FRAMEWORK_I18N_ASSET, ZAMBON_SHARED_I18N_ASSET]
```

If you wrote the asset entry by hand, point `input` at
`node_modules/@zambon-dev/ui/i18n/framework` or `.../i18n/shared`. The `output` path is unchanged,
so nothing in your application's runtime translation lookup moves.

## Peer dependencies

The peer set is the union of what the three packages asked for, and all of it is required:

```
@angular/cdk  @angular/common  @angular/core  @angular/forms  @angular/platform-browser
@angular/router  @auth0/angular-jwt  @microsoft/signalr  @ngx-translate/core
ngx-resize-observer  ngx-translate-multi-http-loader  rxjs
```

Any application that used all three packages already has all of them installed.

## One renamed export

`AngularAssetPattern` was declared twice — once in each i18n helper — and is now exported once,
from the library layer. Import it from `@zambon-dev/ui` or `@zambon-dev/ui/library`. The framework
and shared layers no longer export it.

## The old packages

They are deprecated on npm and nothing further will be published on them. Their released versions
stay installable, and their changelogs are kept under **Package history** in
[the package changelog](../../libs/ui/CHANGELOG.md).

The retired Angular 19 lines (`framework@1.4.7`, `library@1.6.9`, `shared@2.1.4`) are unaffected.
They were already frozen in tags before this change, and applications still on Angular 19 should
stay on them.
