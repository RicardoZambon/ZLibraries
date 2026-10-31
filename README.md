# ZLibraries

An Nx workspace publishing one Angular package, [`@zambon-dev/ui`](libs/ui), which exposes three
layers as entry points.

| Entry point                | Role                                                                |
| -------------------------- | ------------------------------------------------------------------- |
| `@zambon-dev/ui`           | Re-exports all three layers                                         |
| `@zambon-dev/ui/library`   | Presentation — UI components, directives, pipes                     |
| `@zambon-dev/ui/framework` | Application shell — tabbed navigation, view scaffolding, modals     |
| `@zambon-dev/ui/shared`    | Cross-cutting — authentication, layouts, history features, services |
| `@zambon-dev/ui/testing`   | Test harness for rendering under an OnPush ancestor                 |

The dependency direction is strictly one-way: `shared` → `framework` → `library`. Nothing lower
may import from something higher, and `eslint.config.mjs` in the package enforces it.

These were three separate packages until 2026-10-24. They were released in lockstep anyway, while
the `peerDependencies` ranges that held them together could only be checked after the release
that invalidated them. [The migration guide](docs/guides/migrating-to-ui.md) covers the move.

`apps/storybook-host` is a local harness for exercising the package; it is not published.

## Requirements

- Node.js 24 or later (Angular 22 requires >= 22.22.3; CI runs 24)
- npm 10 or later

## Getting started

```bash
npm ci
```

## Common commands

| Command                | What it does                                        |
| ---------------------- | --------------------------------------------------- |
| `npm run build`        | Production build of the package into `dist/libs/ui` |
| `npm test`             | Unit tests (Jest)                                   |
| `npm run lint`         | ESLint                                              |
| `npm run format`       | Rewrite files with Prettier                         |
| `npm run format:check` | Fail if anything is unformatted                     |
| `npm run storybook`    | Storybook on :4400                                  |

Two checks that need a built Storybook rather than the dev server:

| Command                                                 | What it checks                                                            |
| ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `node tools/overflow-probe/probe.mjs dist/storybook/ui` | At 375px, nothing sits past the right edge without a scroller to reach it |
| `node tools/style-snapshot/capture.mjs …`               | Computed styles, so a restyle cannot change the product unreported        |

To scope a command, or to see what a change affects:

```bash
npx nx test ui
npx nx affected --target=build --base=main
```

## Documentation

The Storybook is published from `main` to
[https://ricardozambon.github.io/ZLibraries/](https://ricardozambon.github.io/ZLibraries/). The
three layers are its top-level sections.

Guides for applications that consume these packages:

| Guide                                                         | What it covers                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [Design tokens and theming](docs/guides/design-tokens.md)     | The token families, what is safe to override, and how to turn on the dark theme |
| [Details views](docs/guides/details-views.md)                 | The route data a details tab reads, and views shown or enabled per record       |
| [Top bar configuration](docs/guides/top-bar-configuration.md) | Brand, environment badge, notifications, language and user profile              |
| [Dependency holds](docs/guides/dependency-holds.md)           | Why certain dependencies are pinned                                             |
| [Reactivity](docs/guides/reactivity.md)                       | How these components reach the screen under OnPush                              |

## Nx Cloud

Remote caching is optional. To enable it, set `NX_CLOUD_ACCESS_TOKEN` in your environment — the
token is deliberately **not** committed to `nx.json`. In CI it comes from the
`NX_CLOUD_ACCESS_TOKEN` repository secret. Without it, Nx falls back to the local cache and
everything still works.

## Making a change

1. Branch from `main`.
2. Make the change, with tests.
3. Add an entry under `## [Unreleased]` in `libs/ui/CHANGELOG.md` if you touched `libs/ui/src/`.
   CI enforces this. Tooling-only PRs can carry the `no-changelog` label instead.
4. Open a PR. `PR Validation` lints and tests, builds the package and the Storybook, and dry-runs
   the release.

### Commit messages

Releases are driven by [semantic-release](https://semantic-release.gitbook.io/), so the commit
type decides the version bump:

| Type                                                               | Bump       |
| ------------------------------------------------------------------ | ---------- |
| `feat`                                                             | minor      |
| `fix`, `bug`, `refactor`                                           | patch      |
| `breaking-changes`, or any commit with a `BREAKING CHANGE:` footer | major      |
| anything else (`chore`, `docs`, `test`, `ci`)                      | no release |

Scoping a commit `no-release` suppresses a release regardless of type.

## Releasing

Merging to `main` triggers `Release`, which versions and publishes the package, stamps the
`[Unreleased]` changelog section with the resolved version, and opens a GitHub release.

`main` is the only release branch. Everything published from here targets Angular 22.

### Retired packages

`@zambon-dev/library`, `@zambon-dev/framework` and `@zambon-dev/shared` are deprecated on npm and
superseded by `@zambon-dev/ui`. Their released versions stay installable, and their changelogs are
kept under **Package history** in [the package changelog](libs/ui/CHANGELOG.md).

### Retired maintenance lines

While `main` moved to Angular 22, three branches kept publishing for applications still on
Angular 19, each under its own npm dist-tag. They are retired: every fix they carried also shipped
on `main`, and their final state is kept in a tag rather than a branch.

| Line           | Package                 | Last release | Tag                          |
| -------------- | ----------------------- | ------------ | ---------------------------- |
| former `1.4.x` | `@zambon-dev/framework` | 1.4.7        | `angular-19/framework-1.4.x` |
| former `1.6.x` | `@zambon-dev/library`   | 1.6.9        | `angular-19/library-1.6.x`   |
| former `2.1.x` | `@zambon-dev/shared`    | 2.1.4        | `angular-19/shared-2.1.x`    |

Those versions stay installable from npm; nothing further will be published on those lines. To
work on one, check the tag out into a branch of its own.

## License

MIT © Ricardo Zambon
