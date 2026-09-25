# Dependency holds

The workspace is on Angular 22, Nx 23, Storybook 10, Jest 30 and ESLint 10. Two packages are
deliberately held below their latest major. Renovate is configured to route each of them through
dashboard approval rather than opening a PR, so this file is the reason why.

## TypeScript — held at 6.0.x, latest is 7.x

Not a choice. `@angular/compiler-cli@22` declares `typescript: ">=6.0 <6.1"`. TypeScript 7 (the
native compiler) cannot be used until Angular supports it. Revisit when Angular's peer range moves.

## @ngx-translate/core — held at 16.x, latest is 18.x

Works fine on Angular 22; the hold is about cost, not compatibility. v17 and v18 reshape the setup
API (`TranslateModule.forRoot()` giving way to `provideTranslateService()`) and the pipe/directive
surface. Both packages publish `i18n/*` entry points that consumers import, so the change reaches
consumers and needs its own migration note.

Take this one together with `ngx-translate-multi-http-loader`, which is on 19.x and pairs with it.

## Overrides

`smol-toml` is pinned forward to 1.9.0. Nx depends on 1.6.1 and everything up to 1.7.0 carries a
high-severity denial-of-service advisory ([GHSA-7w5x-hrqm-74c2](https://github.com/advisories/GHSA-7w5x-hrqm-74c2));
`npm audit fix` proposes going back to nx 22.6.4 instead, which is the wrong direction. The override
stays within the same major and clears all eleven high-severity findings. Remove it when nx depends
on 1.9.0 or newer itself.

Five moderate findings remain, all under `@storybook/test-runner`, whose only offered fix is a
downgrade to 0.23.0. One of them is `uuid@8.3.2`, reached through `jest-junit` and `nyc`: the
advisory is a bounds check in v3/v5/v6 generation with a caller-supplied buffer, and neither uses
that path. Forcing uuid to 11.x would be a three-major jump across a package that changed its module
shape, for a test-only tool. Left alone deliberately.

## Not held

Everything else tracks latest through Renovate. Angular, the CLI, ng-packagr and `angular-eslint`
upgrade as one group; every `@nx/*` package moves with the `nx` core; Storybook moves as a set.
`ngx-resize-observer` tracks Angular majors one-to-one (4.x is the Angular 22 line), so it upgrades
alongside the Angular group.

### Tailwind CSS — taken to 4.x

The hold said the migration's result is visual, and that no test here asserts on computed styles so
a broken upgrade would pass CI. Both were true, so `tools/style-snapshot` was written first and the
migration was driven by its diff. It earned that: it caught 615 elements whose borders turned black
(v4's default border colour is `currentColor`), 41 buttons that lost their pointer cursor, and a
sidebar rendering collapsed because `@screen md` is a v3 directive that v4 leaves as an unknown
at-rule for the browser to drop. None of the three failed a build.

What the migration involved, beyond the version: the JS config is gone and the theme lives in
`libs/shared/src/styles/theme.css`, which is also the Tailwind entry point and is now published;
47 renamed utilities and 7 `@apply … !important` sites converted; 26 `theme()` calls rewritten to
`var(--color-*)`; and `@reference` added to the 39 component stylesheets that use `@apply`, because
v4 does not carry the config to every file the way the v3 PostCSS plugin did.

**138 differing computed values in 20 distinct changes remain, triaged and none obviously wrong** —
the documented `divide-*` selector change, rings and shadows composing their transparent layers
differently, and three elements 8px shorter. They want an eye before release. Colour differences
across the board are the same colours in OKLCH, which is what v4's palette is.

One trap worth knowing: Nx does not treat `theme.css` as an input to `build-storybook`, so a change
to the theme serves a cached Storybook. Two of the three regressions above looked unfixable for a
while for exactly that reason. Use `--skip-nx-cache` when changing the theme.

### @fortawesome/fontawesome-free — taken to 7.x

Previously held on the grounds that a major has renamed and retired glyphs before, and that
consumers also pass icon names through the `icon` inputs, so a silent rename becomes their problem.

Released after checking that, rather than after reading the release notes: every one of the 64
distinct `fa-` strings in this workspace, and the 72 the SecurityHub application and these compiled
bundles use between them, exists in v7's stylesheet — including the FA5-era aliases still emitted
here (`fa-edit`, `fa-times`, `fa-save`, `fa-sign-in-alt`, `fa-sync-alt`, `fa-trash-alt`,
`fa-file-archive`, `fa-exclamation-triangle`). SecurityHub renders all 72 under v7 with a non-zero
glyph.

That covers the names this workspace and that application control. **It does not cover an icon name
a consumer passes in that neither uses**, so a consumer upgrading should run the same check over its
own `fa-` strings. FontAwesome is not a peer of any of the three packages — each application brings
its own — so this bump only changes what the Storybooks render with, which now matches SecurityHub.
