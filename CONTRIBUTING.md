# Contributing to ZLibraries

Thanks for helping. This guide covers setup, the rules the code follows, and how a change gets
released.

Everything in this repository is written in **English**: code, comments, docs, commit messages,
PR descriptions and test fixtures. The only exception is the Portuguese translation files
(`pt.json`) and the strings that mirror them.

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Report security problems
privately, as the [security policy](.github/SECURITY.md) explains.

## Setup

You need Node.js 24 (see `.nvmrc`) and npm 10 or later.

```bash
npm ci
```

## Workspace

| Path                  | What it is                                                    |
| --------------------- | ------------------------------------------------------------- |
| `libs/ui`             | `@zambon-dev/ui`, the only published package                  |
| `libs/ui-examples`    | Live examples and their stories, shared by Storybook and docs |
| `apps/docs`           | The documentation site, published to GitHub Pages             |
| `apps/storybook-host` | Host app that Storybook builds against; not published         |
| `docs/guides`         | Consumer guides; the docs site renders them                   |
| `docs/maintainers`    | Releasing, retired lines and dependency holds                 |
| `tools`               | Checks: style snapshot, overflow probe, packaged styles       |

## Commands

| Command                                | What it does                                          |
| -------------------------------------- | ----------------------------------------------------- |
| `npx nx build ui`                      | Builds the package into `dist/libs/ui`                |
| `npx nx test ui`                       | Runs the unit tests (Jest)                            |
| `npx nx lint ui`                       | Runs ESLint                                           |
| `npx nx format:write`                  | Formats files with Prettier                           |
| `npx nx storybook ui-examples`         | Starts Storybook                                      |
| `npx nx build-storybook ui-examples`   | Builds Storybook; the only step that compiles stories |
| `npx nx build docs`                    | Builds and prerenders the docs site                   |
| `node tools/check-packaged-styles.mjs` | Fails if Tailwind syntax reached the built package    |

Run a single spec with:

```bash
npx jest --config libs/ui/jest.config.ts --testPathPatterns="button"
```

On Windows, `nx format:write` rewrites every file to LF line endings. To see your real changes,
use `git diff --ignore-cr-at-eol`.

Nx Cloud remote caching is optional. Set `NX_CLOUD_ACCESS_TOKEN` in your environment to use it;
without it, Nx uses the local cache.

The [style snapshot](tools/style-snapshot/README.md) and the
[overflow probe](tools/overflow-probe/README.md) are manual checks. Their READMEs explain how to
run them.

## Package rules

These rules hold the package together. Most are enforced by lint or by a spec. The full list, with
the reasons, is in [libs/ui/CLAUDE.md](libs/ui/CLAUDE.md).

### Layers

The package has three layers, each its own entry point:

- `@zambon-dev/ui/library`: presentation components, directives and pipes.
- `@zambon-dev/ui/framework`: the application shell, with tabs, views and ribbon buttons.
- `@zambon-dev/ui/shared`: authentication, layouts and audit-history features.

Dependencies go one way: `shared` uses `framework`, and `framework` uses `library`. A lower layer
never imports a higher one.

One layer reaches another through its public subpath, such as `@zambon-dev/ui/library`. Never use
a relative path across layers. Each entry point is a separate bundle, so a relative import would
compile a second copy of a class, and two copies of a service are two different DI tokens.

Lint rejects an upward import in either spelling. It does not catch a relative import downward,
such as framework code importing `../../library/...`, so watch for that in review.

Inside a layer, import by concrete path where a barrel would form a cycle. For example, the
framework buttons barrel re-exports the legacy buttons, which import the views barrel.

### Selector prefixes

Each layer has its own prefix: `lib-` for library, `framework-` for framework, `shared-` for
shared. ESLint enforces them.

### Reactivity

A component must render correctly under any change-detection strategy, including zoneless. So:

- Every value a template reads is a signal, a `computed`, an `input()` or `model()`, a query
  signal such as `viewChild()`, a getter built only from those, or a constant.
- No template reads a mutable field or a value assigned inside `.subscribe()`.
- Do not declare a change-detection strategy in a new component. Angular 22 defaults to OnPush.
  `changeDetection` is not inherited, so base classes declare nothing either.
- Never inject `ChangeDetectorRef` to force a pass.
- Use `NgZone` only for `runOutsideAngular` around scroll, wheel or resize listeners. The handler
  must still write a signal, because under zoneless the call does nothing.
- When you convert a field to a signal, rename it (`loading` becomes `isLoading`). The compiler
  catches `{{ loading }}` but not `@if (loading)`, which is always true for a signal.

The [change detection guide](docs/guides/reactivity.md) explains the guarantee consumers get.

### Styling

- Styles use Tailwind CSS 4 and the design tokens in `libs/ui/src/styles/theme.css`. A component
  stylesheet that uses `@apply` starts with `@reference` to that file. Tailwind 4 cannot resolve
  utilities without it.
- Use role tokens (`--color-surface-*`, `--color-content-*`, `--color-line-*`, `--radius-*`) or a
  component's own tokens. Do not use raw palette utilities in new code, and do not borrow another
  component's tokens. The [design tokens guide](docs/guides/design-tokens.md) lists them.
- In `host` metadata, add a plain marker class and style it from the stylesheet. Never put Tailwind
  utilities in `host`: they would have to be generated by each consumer's Tailwind.
- To style a routed or projected child, write `:host ::ng-deep .x`. A bare `::ng-deep` emits a
  global selector.
- An input that is also an HTML attribute name, such as `type`, clears the attribute with a host
  binding `'[attr.type]': 'null'`. Otherwise `@tailwindcss/forms` styles the host element.
- Both themes must work. Check light and dark.
- The package builds in partial compilation mode, so `dist/` never contains resolved scoped
  selectors. Check scoped CSS in Storybook or in a consuming app, not by reading `dist/`.

### Small screens

- At 375px wide, nothing may sit past the edge unless an ancestor can scroll it into view. Overflow
  scrolls; it never clips.
- Narrow layouts react to the component's own width with container queries, not media queries.
  Decide the layout in CSS. Do not add `ResizeObserver` or `matchMedia` to pick one.
- Every container query uses the same threshold, the literal `36rem`. A custom property cannot
  appear in a container-query condition.
- Name the container (`@container ribbon`) when the component can render inside another container.
  A bare `@container` matches the nearest container of any name.
- `lib-ribbon` needs a width from its parent. In a content-sized parent it collapses.

### Accessibility

- Every icon-only button has an accessible name.
- Bind `aria-labelledby` to `null` when its target would be empty. Pointing at an empty element
  names the control nothing.
- Template accessibility rules are part of lint and must pass.

### Public API

- Every public input, output and model has a JSDoc comment. The docs site builds its API tables
  from them, and the docs build fails when one is missing.
- A new component gets an example in `libs/ui-examples` and a page on the docs site.

## Testing

- Add or update a unit spec for every behavior change.
- Tests run zoneless. A view renders only when something notifies it. Assert after
  `await fixture.whenStable()`. Do not call `fixture.detectChanges()` in new specs, and do not use
  `fakeAsync`: both hide the bugs these tests exist to catch.
- A component with an asynchronous source gets a `*.renders-under-on-push.spec.ts`, using
  `renderUnderOnPush` from `@zambon-dev/ui/testing`. Drive the source after the render and assert
  the DOM.
- Service specs use `provideHttpClient()` and `provideHttpClientTesting()`, not the deprecated
  `HttpClientTestingModule`.
- A clean Storybook console proves nothing about stale views. A Jest spec is the oracle.
- Changes to stories or examples must pass `npx nx build-storybook ui-examples`. Unit tests and the
  package build do not compile stories.
- For a visual change, compare the style snapshot before and after. For a layout change, run the
  overflow probe. Both run against a built Storybook:

```bash
node tools/style-snapshot/capture.mjs dist/storybook/ui-examples before.json
node tools/style-snapshot/diff.mjs before.json after.json
node tools/overflow-probe/probe.mjs dist/storybook/ui-examples
```

- Nx caches results. After changing styles or Storybook config, rerun with `--skip-nx-cache`.
- Jest runs in jsdom, which cannot evaluate container queries or layout. Unit-test template and
  ARIA logic; check layout in Storybook and with the overflow probe.
- If you rename or remove a story the overflow probe lists, update the probe's story list.
- Some problems only appear for an installed consumer: the `exports` map, peer resolution and
  scoped CSS. Inside the workspace, imports resolve to source. For changes in that area, run
  `npm pack` on `dist/libs/ui` and install the tarball in a scratch app.

### Stories and examples

- Story titles start with the layer: `Library/…`, `Framework/…` or `Shared/…`.
- Each example is a standalone component in `libs/ui-examples`. Its story is a thin wrapper, and
  the docs site shows the same component, so write it as code you would want a reader to copy.
- New translation keys used by examples go into both the English and Portuguese tables of the
  example providers.
- `lib-group-accordion` and `lib-ribbon-group` do not translate their `label` input. Pipe it
  yourself.
- In routed examples, nest routes one path segment per route. The framework rebuilds URLs from the
  route tree, and a route path like `'a/b'` comes back reversed.

### Lint rules

- When you change the layer rule in `libs/ui/eslint.config.mjs`, prove it: add a forbidden import,
  watch lint fail, then remove it. It blocks an upward import both by subpath and by relative path.

## Docs site

The site in `apps/docs` renders the Markdown in `docs/guides` and `docs/components`, the API from
the package's JSDoc, and the examples in `libs/ui-examples`.

- **Add a page:** write the Markdown file and list it in `docs/site.yml`. The build fails for a page
  that is not listed.
- **Place a live example:** put `<!-- example: <id> -->` on its own line. The id comes from
  `libs/ui-examples/src/registry.ts`, where every example is registered with its source files.
- **Link** between pages with relative Markdown links (`../guides/getting-started.md`), so they work
  on GitHub too. The build turns them into site links and fails on any that point nowhere.
- **Component API tables:** list the classes in the page's `api:` front matter. Write
  `framework:ButtonComponent` when two entry points export the same name.

To preview the built site, build it and serve it under `/ZLibraries/`, the path GitHub Pages uses:

```bash
npx nx run docs:site
```

```bash
node tools/docs-content/serve.mjs
```

The site is then at http://localhost:4300/ZLibraries/.

Add `?examples=eager` to a page URL to start every example at once instead of when it scrolls into
view. Automated checks need it, because a page the browser treats as hidden never scrolls.

## Changelog

Every change under `libs/ui/src` needs an entry under `## [Unreleased]` in
[libs/ui/CHANGELOG.md](libs/ui/CHANGELOG.md). CI checks this.

- Write for the consumer: what changed, under `Added`, `Changed`, `Fixed`, `Deprecated` or
  `Removed`.
- A breaking change lists the concrete migration steps under `⚠ Breaking Changes / Migration`.
- Do not set a version or date. The release pipeline does that.
- A change under `libs/ui/src` that no consumer can see, such as a spec-only change, can use the
  `no-changelog` label instead.

## Commit messages

Releases are automated with [semantic-release](https://semantic-release.gitbook.io/), so the commit
type decides the version bump.

| Commit                                                             | Release |
| ------------------------------------------------------------------ | ------- |
| `breaking-changes`, or any commit with a `BREAKING CHANGE:` footer | major   |
| `feat`                                                             | minor   |
| `fix`, `bug`, `refactor`, `perf`, `revert`                         | patch   |
| `chore`, `docs`, `test`, `ci`, `build`, `style`                    | none    |
| any type with the scope `no-release`                               | none    |

Two things to know:

- **Only commits that change files under `libs/ui` count.** A breaking change described in a commit
  that touches only docs or tooling does not trigger a major release. Mark the breaking commit
  inside `libs/ui` itself.
- **Use the footer for breaking changes.** A `!` after the type, as in `feat!:`, is not recognized.
  Write a `BREAKING CHANGE:` footer, or use the `breaking-changes` type.

## Pull requests

1. Branch from `main`.
2. Make the change, with tests, docs and a changelog entry.
3. Open a PR and fill in the template.

PR validation checks formatting, lint, tests, the package build, the packaged styles, the Storybook
build, the docs build and a dry run of the release. All of them must pass.

## Releasing

Merging to `main` publishes the package. See [docs/maintainers/releasing.md](docs/maintainers/releasing.md).
