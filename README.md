# ZLibraries

An Nx workspace holding three published Angular packages that layer on top of each other.

| Package | Role |
| --- | --- |
| [`@zambon-dev/library`](libs/library) | Presentation layer — UI components, directives, pipes |
| [`@zambon-dev/framework`](libs/framework) | Application shell — tabbed navigation, view scaffolding, modals |
| [`@zambon-dev/shared`](libs/shared) | Cross-cutting — authentication, layouts, history features, services |

The dependency direction is strictly one-way: `shared` → `framework` → `library`. Nothing lower may import
from something higher.

`apps/storybook-host` is a local harness for exercising the packages together; it is not published.

## Requirements

- Node.js 20 or later
- npm 10 or later

## Getting started

```bash
npm ci
```

## Common commands

| Command | What it does |
| --- | --- |
| `npm run build` | Production build of every package into `dist/libs/*` |
| `npm test` | Unit tests (Jest) for every project |
| `npm run lint` | ESLint across every project |
| `npm run format` | Rewrite files with Prettier |
| `npm run format:check` | Fail if anything is unformatted |
| `npm run storybook:library` | Storybook for `@zambon-dev/library` |
| `npm run storybook:framework` | Storybook for `@zambon-dev/framework` |
| `npm run storybook:shared` | Storybook for `@zambon-dev/shared` |

Nx only rebuilds what changed. To scope a command to a single project:

```bash
npx nx test shared
npx nx lint library
```

To see what a change actually affects:

```bash
npx nx affected --target=build --base=main
```

## Nx Cloud

Remote caching is optional. To enable it, set `NX_CLOUD_ACCESS_TOKEN` in your environment — the token is
deliberately **not** committed to `nx.json`. In CI it comes from the `NX_CLOUD_ACCESS_TOKEN` repository
secret. Without it, Nx falls back to the local cache and everything still works.

## Making a change

1. Branch from `main`.
2. Make the change, with tests.
3. Add an entry under `## [Unreleased]` in the `CHANGELOG.md` of every package you touched under `libs/*/src/`.
   CI enforces this. Tooling-only PRs can carry the `no-changelog` label instead.
4. Open a PR. `PR Validation` lints and tests affected projects, builds affected packages and Storybooks,
   and dry-runs the release for each package.

### Commit messages

Releases are driven by [semantic-release](https://semantic-release.gitbook.io/), so the commit type decides
the version bump:

| Type | Bump |
| --- | --- |
| `feat` | minor |
| `fix`, `bug`, `refactor` | patch |
| `breaking-changes`, or any commit with a `BREAKING CHANGE:` footer | major |
| anything else (`chore`, `docs`, `test`, `ci`) | no release |

Scoping a commit `no-release` suppresses a release regardless of type.

## Releasing

Merging to `main` triggers `Release`, which versions and publishes each package independently, stamps the
`[Unreleased]` changelog section with the resolved version, and opens an aggregate GitHub release.

## License

MIT © Ricardo Zambon
