# Unifying the three packages — design

## Intent

Replace `@zambon-dev/library`, `@zambon-dev/framework` and `@zambon-dev/shared` with a single
package, `@zambon-dev/ui`, that exposes the same three layers as entry points.

## Why

The split existed so an application could take the framework without the shared layer. No consumer
does that; every one of them installs all three.

What the split costs is real. Compatibility between the packages lives in hand-written
`peerDependencies` ranges, and those ranges cannot be validated before the release that invalidates
them. At PR time they are still correct; the release bumps the versions; only then are they stale.
`tools/check-peer-ranges.mjs` exists to catch this, but it runs on pull requests — so it reports the
damage after publication, in someone else's PR.

That is the state today. The three majors of 2026-10-23 came out of one merge commit and left all
three ranges behind: `framework@5.0.0` and `shared@6.0.0` are on npm declaring peers no application
can satisfy alongside `library@4.0.0`.

With one package there is no range between layers to go stale. The whole class of failure is gone,
not managed.

## Goals

- One package, one version, one changelog, one release.
- The three layers stay visible and separately importable.
- The one-way dependency rule (`shared` → `framework` → `library`) stays enforced.

## Non-goals

- Changing any component's behaviour or public API beyond its import path.
- Keeping the three old packages alive as wrappers. The cut is clean; they are deprecated on npm.

## Anti-goals

- Shipping a root barrel that compiles a second copy of each class. Two copies of an Angular
  service are two DI tokens, and the failure is silent at runtime.
- Losing the layer rule. Inside one Nx project `@nx/enforce-module-boundaries` no longer reaches it;
  if nothing replaces it the layering stops being architecture and becomes habit.

## Approaches considered

**One package, entry points per layer (chosen).** Deletes the compatibility problem outright. Costs
every consumer a one-time import rewrite, and widens the peer set to the union of the three.

**Three packages locked to one version.** Peer ranges generated at publish rather than hand-written;
no consumer changes at all. Solves compatibility but keeps three changelogs, three release configs
and three of everything else. The complexity moves out of the contract and stays in maintenance.

**Keep the split, automate the range widening.** Treats the symptom only.

Rejected outright: making the upper layers depend on the lower through `dependencies` instead of
`peerDependencies`. That permits two copies in one build, which is the anti-goal above.

## Shape

One package `@zambon-dev/ui`, one Nx project, five entry points: the root (re-exports all three
layers), `/library`, `/framework`, `/shared`, `/testing`.

ng-packagr supports a primary entry point depending on its own secondaries. Its source analysis
registers a dependency when an entry point imports `<primary>/...` and rejects only cycles; this
graph is acyclic. The root must re-export through the package subpath, never a relative path, so
that one compiled copy of each symbol exists.

## Constraints

- Angular 22, Nx 23, ng-packagr 22.1.1, TypeScript 6.0.x, Node 24.
- `main` is the only release branch; semantic-release drives versions from conventional commits.
- Peer dependencies are the union of the three, all required. Every consumer uses all three layers,
  so marking the upper-layer peers optional would only turn a missing install into a late failure.
  `peerDependenciesMeta` is the lever if a single-layer consumer ever appears.
- First release is `1.0.0` — a new npm name with no tags, which is what semantic-release does.

## Known collisions

Comparing the three public surfaces turned up three repeated names; one is real.

- `AngularAssetPattern` is declared and exported identically in both i18n helpers. With the root
  re-exporting both, the build fails with TS2308. It moves to the library layer.
- `library/src/styles/variables.scss` and `shared/src/styles/variables.scss` are byte-identical.
  They collapse into one file, with both export subpaths kept.
- `Primary` and `ListView` repeat only across `.stories.ts` files, which no public barrel reaches.
  Not collisions.
