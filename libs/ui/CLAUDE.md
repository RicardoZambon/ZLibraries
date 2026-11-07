# @zambon-dev/ui

One published Angular package with three layers, each its own entry point and its own ng-packagr
bundle. They stack one way: `shared` builds on `framework`, `framework` builds on `library`, and
`library` builds on neither. Consumer documentation lives in `docs/guides/` and on the docs site;
this file holds only what an agent changing the package must know and could break. Contributor
rules in full are in [CONTRIBUTING.md](../../CONTRIBUTING.md).

| Import                     | Source           | What is in it                                      |
| -------------------------- | ---------------- | -------------------------------------------------- |
| `@zambon-dev/ui`           | `src/index.ts`   | Re-exports all three layers                        |
| `@zambon-dev/ui/library`   | `src/library/`   | Form controls, grids, modals, ribbon, sidebar      |
| `@zambon-dev/ui/framework` | `src/framework/` | Tabs, view base classes, ribbon buttons, auth base |
| `@zambon-dev/ui/shared`    | `src/shared/`    | Authentication, layouts, top bar, audit history    |
| `@zambon-dev/ui/testing`   | `src/testing/`   | `renderUnderOnPush` and its inert host             |

Stories and live examples live in `libs/ui-examples`, not here.

## Rules that are easy to break

**Cross a layer by its published subpath, never by a relative path.** Each entry point is a separate
bundle. A relative import compiles a second copy of every class into the importing bundle, and two
copies of a service are two DI tokens. Nothing fails at build time. `libs/ui/eslint.config.mjs`
rejects an upward import in either spelling. It does not catch a relative import downward, such as
framework code importing `../../library/...`; that one is on you.

**Inside a layer, watch for barrel cycles.** The framework buttons barrel re-exports the legacy
buttons, which import the views barrel. `DefaultDetailsTabViewComponent` therefore imports
`ButtonViewsComponent` by its concrete path. Going through the barrel leaves an import undefined at
evaluation time.

**Each layer keeps its selector prefix:** `lib-`, `framework-`, `shared-`. Per-layer ESLint
overrides enforce them. One package does not mean one prefix.

**Layer barrels are not the root barrel.** Code and specs inside a layer import that layer's
`index.ts`. `src/index.ts` is the root and carries all three layers.

**`ButtonComponent` exists twice.** `lib-button` (library) and `framework-button` (framework) share
the class name. The root barrel exports the framework one as `ButtonComponent` and the library one
as `LibButtonComponent`. Keep that alias when touching `src/index.ts`, and import from the layer
subpath to avoid the ambiguity.

**Templates use built-in control flow.** `@if`, `@for`, `@switch`. No template uses `*ngIf`,
`*ngFor` or `ngSwitch`; do not add one. `*ngTemplateOutlet` is still used and fine.

## Reactivity

The contract lives in [docs/guides/reactivity.md](../../docs/guides/reactivity.md). Do not restate
it here. The parts lint or a spec will catch you on:

- **Declare no change-detection strategy.** Angular 22 compiles that to `OnPush`.
  `@angular-eslint/prefer-on-push-component-change-detection` is an error package-wide, and each
  layer's `change-detection-contract.spec.ts` checks its exported components. The only `Eager`
  component is the harness self-test, which disables the rule on that line. A few components still
  declare `OnPush` explicitly; that changes nothing.
- **Never inject `ChangeDetectorRef`.** Nothing forces a pass.
- **`NgZone` only for `runOutsideAngular` around high-frequency listeners** (scroll, wheel,
  resize), as `TabsComponent` and `DataGridComponent` do. The handlers must write a signal or push
  a subject, so the code stays correct under zoneless, where the call is a no-op.

## The reuse-strategy cache key

`CustomReuseStrategy` keys detached views as `{url}-{routeDepth}-{componentId}`. `componentId` is a
per-class counter held in a `WeakMap`, keyed by the component's identity.

**Never key on `component.name`.** A production build mangles class names to one letter, shared
across a chunk. A name-based key collapsed a tab view and its child list into one entry, and the
router overflowed the stack building a state whose node was its own descendant. It reproduced only
in minified builds. The route depth keeps two routes with the same component type under one URL
apart.

The strategy and `RouteHelper.getRouteURL` both rebuild URLs by walking up the route tree and
reversing the segments. A multi-segment route path such as `'a/b'` comes back as `/b/a`. Routes in
stories, examples and docs nest one segment per route.

## Styling

- **`@reference` theme.css in every stylesheet that uses `@apply`.** Tailwind 4 cannot resolve
  utilities without it, for example `@reference '../../../styles/theme.css';`.
- **Tokens, not raw colours.** Use the role tokens (`var(--color-*)`, `--radius-*`, `--shadow-*`)
  or the component's own tokens. See [design-tokens.md](../../docs/guides/design-tokens.md).
- **`host` metadata takes plain class names, never Tailwind utilities.** A utility named there
  would have to be generated by each consumer's Tailwind. Style the marker class in the stylesheet.
- **Anchor `::ng-deep` on `:host`:** `:host ::ng-deep .x`. A bare `::ng-deep` emits a global rule.
- **Container queries use one threshold, the literal `36rem`.** A custom property cannot appear in
  the condition. Name the container when the component can sit inside another.
- **The library layer ships no translation file.** Only `src/i18n/framework` and
  `src/i18n/shared` exist. The few keys library templates use (`CatalogSelect-*`, the multi-editor
  and multi-select confirm labels) live in the framework translations. Do not add new keys for a
  library component.
- **Verify scoped CSS in a consuming app or Storybook, not in `dist/`.** The package builds with
  partial compilation, so `dist/` never contains resolved `[_nghost-*]` selectors.
- **After a build, run `node tools/check-packaged-styles.mjs`.** It fails when `@apply`,
  `@reference` or other Tailwind source syntax reached the bundled component styles, where the
  browser would drop it silently.

## Testing

- **The test environment is zoneless** (`setupZonelessTestEnv` in `src/test-setup.ts`). A view
  renders only when something notifies. Assert after `await fixture.whenStable()`. In new specs do
  not call `fixture.detectChanges()`: under zoneless it refreshes every test view and hides the
  bug. Do not use `fakeAsync`/`tick`; they are zone-based.
- **A component with an async source gets a `*.renders-under-on-push.spec.ts`** using
  `renderUnderOnPush` from `@zambon-dev/ui/testing`. Drive the source after the call returns, use a
  `Subject` rather than `of(...)`, and assert the DOM, never a field.
- **Services:** `TestBed` with `provideHttpClient()` and `provideHttpClientTesting()`, then
  `HttpTestingController`. `HttpClientTestingModule` is deprecated; do not copy it from the one
  older spec that still uses it.
- **`Object.create(X.prototype)` only in existing logic specs.** It runs no field initialiser, so
  every stubbed field that is a signal in the class must be stubbed as a signal and read with
  `()`. A missing `()` passes silently. Do not start new specs this way.
- **A clean Storybook console proves nothing about NG0100 or stale views.** A Jest spec under the
  zoneless environment is the oracle.

## Commands

```bash
npx nx build ui                                   # package into dist/libs/ui
npx nx test ui                                    # Jest, all three layers
npx nx lint ui                                    # ESLint
npx nx format:check                               # Prettier, as CI runs it
npx nx storybook ui-examples                      # Storybook
npx nx build-storybook ui-examples                # the only step that compiles stories
node tools/check-packaged-styles.mjs              # after a build
npx jest --config libs/ui/jest.config.ts --testPathPatterns="my-component"   # one spec
```

PR validation runs, on affected projects: `format:check`, lint, test, production build,
`check-packaged-styles`, and `build-storybook`. It also fails when `src/` changed and
`CHANGELOG.md` did not. A green local run of tests and build does not cover
the stories: a public API rename passes them and then fails `build-storybook`.

- **On Windows, `nx format:write` rewrites files to LF.** Review with `git diff --ignore-cr-at-eol`.
- **After a style or Storybook config change, add `--skip-nx-cache`.** The cache replays results
  from before the change. The [style snapshot](../../tools/style-snapshot/README.md) and the
  [overflow probe](../../tools/overflow-probe/README.md) run against such a fresh build.

## Changelog

Every change under `src/` gets an entry under `## [Unreleased]` in [CHANGELOG.md](./CHANGELOG.md),
written for the consumer:

- What changed, under `Added`, `Changed`, `Deprecated`, `Removed` or `Fixed`.
- Migration steps under `⚠ Breaking Changes / Migration`. When there is nothing to migrate, leave
  that subsection empty. Do not write "None": the release stamp strips empty subsections.
- No version or date. The release pipeline stamps `[Unreleased]` and opens a fresh block.
- A change no consumer can see, such as a spec-only change, may use the `no-changelog` label.

Commit types and the release bump are in [CONTRIBUTING.md](../../CONTRIBUTING.md#commit-messages).

## Further reading

- [CONTRIBUTING.md](../../CONTRIBUTING.md): setup, workspace, all package rules, pull requests
- [Reactivity](../../docs/guides/reactivity.md): the change-detection contract and the test oracle
- [Design tokens](../../docs/guides/design-tokens.md): theming and the token families
- [Tabbed navigation](../../docs/guides/tabbed-navigation.md): the tab model and the reuse strategy
- [Building views](../../docs/guides/building-views.md): routes, view base classes, error handling
- [Details views](../../docs/guides/details-views.md): the Views menu and its conditions
- [Backend contract](../../docs/guides/backend-contract.md): every HTTP call and payload
- [Top bar configuration](../../docs/guides/top-bar-configuration.md): `APP_CONFIG` and notifications
- [Getting started](../../docs/guides/getting-started.md): what a consuming app wires up
