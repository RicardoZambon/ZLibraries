# Releasing

Releases are automatic. Every push to `main` runs the **Release** workflow. If the commits since
the last release call for one, it publishes `@zambon-dev/ui` to npm. Nobody types a version.

`main` is the only release branch. Everything published from it targets Angular 22.

## What the workflow does

1. Installs dependencies and the release tooling (semantic-release, semantic-release-monorepo
   and its plugins).
2. Builds the package in production mode into `dist/libs/ui`.
3. Checks the packaged styles. A package that fails this check never reaches npm.
4. Runs semantic-release from `libs/ui`, with semantic-release-monorepo:
   - analyses the commits since the last `ui-v*` tag and picks the version;
   - stamps the changelog inside `dist/libs/ui`, so the published package shows the version;
   - publishes `dist/libs/ui` to npm;
   - pushes the tag `ui-vX.Y.Z`.
5. Stamps `libs/ui/CHANGELOG.md` in the repository and pushes that commit back to `main`. The
   commit message ends in `[skip ci]`, so it does not start another release.
6. Creates the GitHub release for the tag.

If no release is due, steps 5 and 6 are skipped.

## Which commits count

semantic-release-monorepo only looks at commits that change files under `libs/ui`. A commit that
touches nothing there is ignored, whatever its type or footer.

The commit type decides the bump:

| Commit                                                             | Bump       |
| ------------------------------------------------------------------ | ---------- |
| `breaking-changes`, or any commit marked `!` or `BREAKING CHANGE:` | major      |
| `feat`                                                             | minor      |
| `fix`, `bug`, `refactor`, `perf`, reverts                          | patch      |
| anything else (`chore`, `docs`, `test`, `ci`, `style`, `build`)    | no release |
| scope `no-release`, any type                                       | no release |

`perf` and reverts are not in the custom rules. They fall through to the commit analyzer's
defaults, which release them as a patch.

**Nothing links the changelog's Breaking Changes section to the version bump.** Two releases show
the cost:

- **1.1.0** carried breaking changes as a minor. The commit marked breaking only changed the old
  package folders, not `libs/ui`, so it did not count.
- **1.2.0** carried breaking changes as a minor. No commit in it was marked breaking.

A breaking change must be marked (`!` or a `BREAKING CHANGE:` footer) on a commit that changes
`libs/ui`. From now on, breaking changes ship as majors.

## The changelog

Contributors write entries under `## [Unreleased]` in `libs/ui/CHANGELOG.md`. They never write
a version.

`scripts/stamp-changelog.mjs` runs twice per release:

| Run        | When                              | Writes                      |
| ---------- | --------------------------------- | --------------------------- |
| `--dist`   | semantic-release's prepare step   | `dist/libs/ui/CHANGELOG.md` |
| `--source` | after publishing, in its own step | `libs/ui/CHANGELOG.md`      |

Each run turns `[Unreleased]` into `## [X.Y.Z] - <date>`, drops empty subsections and opens a
fresh, empty `[Unreleased]` block.

Every release commit rewrites the changelog on `main`. A branch stacked on an older `main` will
conflict there. Rebase it on the current `main`.

## The GitHub release

The release is created with the GitHub CLI, not by semantic-release. Its title is
`@zambon-dev/ui X.Y.Z`. Its body today is:

- one line, "Published `@zambon-dev/ui@X.Y.Z`.";
- the subject of every commit in the push, merge commits included, each with its short hash.

The curated changelog section and its migration steps are **not** in it. Readers who need them
must open `libs/ui/CHANGELOG.md`.

## Credentials

| Name                    | Kind              | Used for                                                                                                       |
| ----------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| npm trusted publishing  | OIDC, no secret   | Publishing to npm. The job runs in the `npm` environment with `id-token: write`                                |
| `RELEASE_TOKEN`         | Repository secret | A personal access token with bypass on the `main` ruleset. Checkout uses it, so the stamp commit can be pushed |
| `GITHUB_TOKEN`          | Built in          | semantic-release and creating the GitHub release                                                               |
| `NX_CLOUD_ACCESS_TOKEN` | Repository secret | Optional Nx Cloud remote cache                                                                                 |

No npm token is stored. npm trusts this repository's Release workflow directly. Trusted
publishing only works for a package that already exists on npm: a new package name needs a first
manual publish before the workflow can take over. When that is the problem, npm reports an invalid
token, not a missing package.

## Nx Cloud

Remote caching is optional. The access token is deliberately not committed to `nx.json`. In CI it
comes from the `NX_CLOUD_ACCESS_TOKEN` repository secret. Locally, set the same variable in your
environment. Without it, Nx uses the local cache and everything still works.

## The docs site

The **Pages** workflow builds the docs app and Storybook and deploys both to GitHub Pages. It runs
after each successful Release on `main`, so the site documents what was just published. To redeploy
without a release, run it by hand from the Actions tab.

Pages is set to build from GitHub Actions, and the `github-pages` environment only accepts
deployments from `main`.

| Site      | URL                                                   |
| --------- | ----------------------------------------------------- |
| Docs      | https://ricardozambon.github.io/ZLibraries/           |
| Storybook | https://ricardozambon.github.io/ZLibraries/storybook/ |

## Retired packages

`@zambon-dev/library`, `@zambon-dev/framework` and `@zambon-dev/shared` are deprecated on npm and
superseded by `@zambon-dev/ui`. Their released versions stay installable. Their changelogs are
kept under **Package history** in `libs/ui/CHANGELOG.md`. The npm deprecation messages link
`docs/guides/migrating-to-ui.md`, so that file must not move.

## Retired maintenance lines

While `main` moved to Angular 22, three branches kept publishing for applications still on
Angular 19, each under its own npm dist-tag. They are retired: every fix they carried also shipped
on `main`, and their final state is kept in a tag rather than a branch.

| Line           | Package                 | Last release | Tag                          |
| -------------- | ----------------------- | ------------ | ---------------------------- |
| former `1.4.x` | `@zambon-dev/framework` | 1.4.7        | `angular-19/framework-1.4.x` |
| former `1.6.x` | `@zambon-dev/library`   | 1.6.9        | `angular-19/library-1.6.x`   |
| former `2.1.x` | `@zambon-dev/shared`    | 2.1.4        | `angular-19/shared-2.1.x`    |

Those versions stay installable from npm. Nothing further will be published on those lines. To
work on one, check the tag out into a branch of its own:

```bash
git switch -c angular-19-shared angular-19/shared-2.1.x
```

## References

- [Release workflow](https://github.com/RicardoZambon/ZLibraries/blob/main/.github/workflows/release.yml)
- [semantic-release config](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/release.config.cjs)
- [Changelog stamp script](https://github.com/RicardoZambon/ZLibraries/blob/main/scripts/stamp-changelog.mjs)
