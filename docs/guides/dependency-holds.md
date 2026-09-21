# Dependency holds

The workspace is on Angular 22, Nx 23, Storybook 10, Jest 30 and ESLint 10. Four packages are
deliberately held below their latest major. Renovate is configured to route each of them through
dashboard approval rather than opening a PR, so this file is the reason why.

## TypeScript — held at 6.0.x, latest is 7.x

Not a choice. `@angular/compiler-cli@22` declares `typescript: ">=6.0 <6.1"`. TypeScript 7 (the
native compiler) cannot be used until Angular supports it. Revisit when Angular's peer range moves.

## Tailwind CSS — held at 3.4.x, latest is 4.x

Tailwind 4 replaces the JavaScript config with CSS-first configuration and changes how `@apply`
resolves. This workspace has 51 SCSS files built almost entirely on `@apply`, plus
`tailwind.config.js` and a `@mixin button($color)` that generates utility classes in a `@for` loop.

The migration is real work and its result is visual. It needs someone running the Storybooks and
the consuming application side by side, not a version bump and a green test suite — no test here
asserts on computed styles, so a broken upgrade would pass CI.

## @ngx-translate/core — held at 16.x, latest is 18.x

Works fine on Angular 22; the hold is about cost, not compatibility. v17 and v18 reshape the setup
API (`TranslateModule.forRoot()` giving way to `provideTranslateService()`) and the pipe/directive
surface. Both packages publish `i18n/*` entry points that consumers import, so the change reaches
consumers and needs its own migration note.

Take this one together with `ngx-translate-multi-http-loader`, which is on 19.x and pairs with it.

## @fortawesome/fontawesome-free — held at 6.x, latest is 7.x

Icons are referenced as class strings throughout the templates (`fa-solid fa-xmark`,
`fa-regular fa-square`, and more through the `icon` inputs consumers pass in). A major has renamed
and retired glyphs before. Since consumers also pass icon names, a silent rename becomes their
problem, not ours. Check the v7 release notes against every `fa-` string before taking it.

## Not held

Everything else tracks latest through Renovate. Angular, the CLI, ng-packagr and `angular-eslint`
upgrade as one group; every `@nx/*` package moves with the `nx` core; Storybook moves as a set.
`ngx-resize-observer` tracks Angular majors one-to-one (4.x is the Angular 22 line), so it upgrades
alongside the Angular group.
