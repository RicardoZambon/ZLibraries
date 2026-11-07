# Agent instructions

This repository publishes one Angular package, `@zambon-dev/ui`, from `libs/ui`. Read
[CONTRIBUTING.md](CONTRIBUTING.md) first. It holds the rules for humans and agents alike.

## Rules

- **English only.** Code, comments, docs, commit messages, PR text and test fixtures are written in
  English. The one exception is the `pt.json` translation files and the Portuguese strings that
  mirror them.
- **Package rules live next to the package.** Before you change `libs/ui`, read
  [libs/ui/CLAUDE.md](libs/ui/CLAUDE.md). It lists the rules that are easy to break.
- **CI really gates.** PR validation runs format check, lint, tests, the package build, the
  packaged-styles check, the Storybook build and the docs build. A red check on your branch is your
  change, not a flaky baseline.
- **Changelog.** Every change under `libs/ui/src` adds an entry under `## [Unreleased]` in
  `libs/ui/CHANGELOG.md`, written for the consumer.
- **Commit types drive releases.** See the commit table in CONTRIBUTING. Only commits that touch
  `libs/ui` count, so mark a breaking change on a commit inside `libs/ui`.
- **`docs/superpowers` is history.** It holds design notes for finished work. Do not treat it as
  current guidance, and do not add new plans there.

## Where things are

| Path                  | What it is                                                  |
| --------------------- | ----------------------------------------------------------- |
| `libs/ui`             | The published package                                       |
| `libs/ui-examples`    | Live examples and stories, shared by Storybook and the docs |
| `apps/docs`           | The documentation site                                      |
| `apps/storybook-host` | Local host app for Storybook; not published                 |
| `docs/guides`         | Guides for consumers; the docs site renders them            |
| `docs/maintainers`    | Releasing, retired lines and dependency holds               |
| `tools`               | Checks: style snapshot, overflow probe, packaged styles     |
