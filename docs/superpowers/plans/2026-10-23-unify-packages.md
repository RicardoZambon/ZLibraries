# Unify the three packages into `@zambon-dev/ui` — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace three published packages with one, `@zambon-dev/ui`, exposing the same three
layers as entry points on a single version.

**Architecture:** One Nx project at `libs/ui` built by ng-packagr with a primary entry point that
re-exports three secondary entry points — `/library`, `/framework`, `/shared` — plus the existing
`/testing`. Layer direction is enforced by `no-restricted-imports` overrides, since
`@nx/enforce-module-boundaries` only reaches across projects.

**Tech Stack:** Angular 22, Nx 23, ng-packagr 22.1.1, TypeScript 6.0.x, Jest 30, Storybook 10,
semantic-release.

**Spec:** `docs/superpowers/specs/2026-10-23-unify-packages-design.md`

## Global Constraints

- Node 24, npm 10. Angular peer range stays `^22.0.0`.
- `main` is the only release branch. Conventional commits drive the bump.
- Published peers are the union of the three packages', all required.
- The root entry point re-exports through the package subpath (`@zambon-dev/ui/library`), never a
  relative path.
- A secondary entry point's `ng-package.json` folder must not contain an `index.ts`; ng-packagr
  rejects it.
- Existing tests are the regression oracle. Every task ends with the suite green.

## Review Focus

Failure modes the migration can introduce that no single task's tests naturally exercise:

1. **Two copies of a class in one build.** A relative re-export in the root barrel yields duplicate
   DI tokens and fails only at runtime. Task 2 pins this by checking the root bundle re-exports
   rather than redefines.
2. **A stale `exports` map.** A subpath missing from the built `package.json` fails only when a
   consumer imports it, never inside the workspace, where everything resolves through path mappings
   to `src`. Task 10 installs the tarball and imports from all five.
3. **Component-scoped CSS.** A library `dist` never contains resolved `[_nghost-*]` selectors, so
   broken styles survive every in-repo check. Task 10 runs the real consumer.
4. **Stories compiling only under `build-storybook`.** A rename to the published surface passes
   tests, lint and build, then fails PR validation. Task 8 builds the Storybook.
5. **The layer rule silently gone.** A lint rule that never failed is not proven. Task 6 asserts it
   rejects a forbidden import.

---

### Task 1: Unblock `main`

The three sibling peer ranges exclude the versions already on npm, so `check-peer-ranges` fails on
every new PR. Fix first — the rest of the work must not run over a red baseline.

**Files:**
- Modify: `libs/framework/package.json`, `libs/shared/package.json`

- [ ] **Step 1: Run the checker to see it fail**

Run: `node tools/check-peer-ranges.mjs`
Expected: exit 1, three lines naming framework→library, shared→framework, shared→library.

- [ ] **Step 2: Widen the three ranges**

`framework` peers `"@zambon-dev/library": "^4.0.0"`. `shared` peers
`"@zambon-dev/framework": "^5.0.0"` and `"@zambon-dev/library": "^4.0.0"`.

- [ ] **Step 3: Run the checker to see it pass**

Run: `node tools/check-peer-ranges.mjs`
Expected: exit 0, "3 @zambon-dev peer range(s) admit their sibling's released version."

- [ ] **Step 4: Commit**

`fix(no-release): widen sibling peer ranges to the published majors`

---

### Task 2: Prove the entry-point shape

Build the five entry points with placeholder content, before any real code moves. If the shape does
not hold, it surfaces here with the tree intact.

**Files:**
- Create: `libs/ui/{package.json,ng-package.json,project.json,tsconfig.json,tsconfig.lib.json,tsconfig.lib.prod.json,tsconfig.spec.json,jest.config.ts,eslint.config.mjs}`
- Create: `libs/ui/src/index.ts`, `libs/ui/src/{library,framework,shared}/index.ts`
- Create: `libs/ui/{library,framework,shared}/ng-package.json`
- Modify: `tsconfig.base.json`

**Interfaces:**
- Produces: package name `@zambon-dev/ui`; subpaths `/library`, `/framework`, `/shared`, `/testing`.
  Project json copied from `libs/library/project.json` with paths retargeted and `prefix: "lib"`.

- [ ] **Step 1: Scaffold the project and the five entry points**

Each layer's `src/<layer>/index.ts` exports one placeholder const (`export const __libraryProbe = 1;`
and siblings). `src/index.ts` re-exports the three by subpath. Each secondary folder holds only
`{ "lib": { "entryFile": "../src/<layer>/index.ts" } }`.

- [ ] **Step 2: Add the path mappings**

In `tsconfig.base.json`, alongside the existing four: `@zambon-dev/ui`, `@zambon-dev/ui/library`,
`@zambon-dev/ui/framework`, `@zambon-dev/ui/shared` pointing at their `src` index files.

- [ ] **Step 3: Build**

Run: `npx nx build ui --configuration=production`
Expected: PASS.

- [ ] **Step 4: Verify the artifact, not the build**

Run: `cat dist/libs/ui/package.json` and `ls dist/libs/ui/fesm2022`
Expected: `exports` carries `.`, `./library`, `./framework`, `./shared`; `fesm2022` holds one bundle
per layer plus the root. Confirm the root bundle imports from the layer bundles rather than
redefining the probes — this is Review Focus 1.

- [ ] **Step 5: Commit**

`feat(no-release): scaffold the unified @zambon-dev/ui package shell`

---

### Task 3: Move the library layer

**Files:**
- Move: `libs/library/src/lib/**` → `libs/ui/src/library/`, `libs/library/src/testing/**` →
  `libs/ui/src/testing/`, `libs/library/src/styles/variables.scss` → `libs/ui/src/styles/`
- Create: `libs/ui/testing/ng-package.json`
- Delete: `libs/library/`

- [ ] **Step 1: `git mv` the sources, preserving history**

- [ ] **Step 2: Move `AngularAssetPattern` here**

Create `libs/ui/src/library/models/angular-asset-pattern.ts` exporting the interface
(`glob: string; input: string; output: string`) and export it from the library barrel. This is the
one real collision; the two i18n helpers import it in Tasks 4 and 5.

- [ ] **Step 3: Prefix the library story titles**

`Data Grid`, `Form Components`, `Modals`, `Ribbon`, `Sidebar` become `Library/<name>`, so the three
layers sit side by side in one Storybook.

- [ ] **Step 4: Point the assets at the new layout**

`libs/ui/ng-package.json` assets: `src/styles/**/*.scss` and `**/*.css` → `styles/`;
`src/i18n/framework/**` → `i18n/framework/`; `src/i18n/shared/**` → `i18n/shared/`.

- [ ] **Step 5: Test and build**

Run: `npx nx test ui && npx nx build ui --configuration=production`
Expected: PASS, with the library suite's own test count.

- [ ] **Step 6: Commit**

`refactor(no-release): move the library layer into @zambon-dev/ui`

---

### Task 4: Move the framework layer

**Files:**
- Move: `libs/framework/src/lib/**` → `libs/ui/src/framework/`, `libs/framework/src/i18n/**` →
  `libs/ui/src/i18n/framework/`
- Delete: `libs/framework/`

- [ ] **Step 1: `git mv` the sources**

- [ ] **Step 2: Rewrite the 41 sibling imports**

`@zambon-dev/library` → `@zambon-dev/ui/library`.

- [ ] **Step 3: Drop the duplicated interface and fix the asset constant**

`framework-i18n.ts` imports `AngularAssetPattern` from the library layer instead of declaring it.
`ZAMBON_FRAMEWORK_I18N_ASSET.input` becomes `node_modules/@zambon-dev/ui/i18n/framework`.

- [ ] **Step 4: Test and build**

Run: `npx nx test ui && npx nx build ui --configuration=production`
Expected: PASS.

- [ ] **Step 5: Commit**

`refactor(no-release): move the framework layer into @zambon-dev/ui`

---

### Task 5: Move the shared layer

**Files:**
- Move: `libs/shared/src/lib/**` → `libs/ui/src/shared/`, `libs/shared/src/i18n/**` →
  `libs/ui/src/i18n/shared/`, `libs/shared/src/styles/**` → `libs/ui/src/styles/`
- Delete: `libs/shared/`, `libs/helper/` (empty)

- [ ] **Step 1: `git mv` the sources**

`shared/src/styles/variables.scss` is byte-identical to the library's and is dropped, not moved.

- [ ] **Step 2: Rewrite the 52 sibling imports**

29 `@zambon-dev/framework` → `@zambon-dev/ui/framework`; 23 `@zambon-dev/library` →
`@zambon-dev/ui/library`. The four specs that mock `@zambon-dev/framework` take the new specifier
too.

- [ ] **Step 3: Drop the duplicated interface and fix the asset constant**

As Task 4, with `node_modules/@zambon-dev/ui/i18n/shared`.

- [ ] **Step 4: Full suite, lint, build**

Run: `npx nx test ui && npx nx lint ui && npx nx build ui --configuration=production`
Expected: PASS. Combined test count equals the three old suites' sum.

- [ ] **Step 5: Commit**

`refactor(no-release): move the shared layer into @zambon-dev/ui`

---

### Task 6: Re-establish the layer rule

The one guarantee the merge would otherwise drop.

**Files:**
- Modify: `libs/ui/eslint.config.mjs`

- [ ] **Step 1: Add the two overrides**

For files under `src/library/`, forbid importing `@zambon-dev/ui/framework`, `@zambon-dev/ui/shared`
and the relative `**/framework/**`, `**/shared/**`. For files under `src/framework/`, forbid the
shared pair. Blocking only the subpath leaves `../../shared/` open, so both patterns are needed.

- [ ] **Step 2: Prove the rule fails**

Add a forbidden shared import to a file under `src/library/`, run `npx nx lint ui`, confirm it
errors, then revert. Repeat with a relative path. A rule that never failed is not proven.

- [ ] **Step 3: Lint clean**

Run: `npx nx lint ui`
Expected: PASS.

- [ ] **Step 4: Commit**

`feat(no-release): enforce the layer direction inside the unified package`

---

### Task 7: Unify release and CI

**Files:**
- Create: `libs/ui/release.config.cjs`
- Modify: `.github/workflows/release.yml`, `.github/workflows/pr-validation.yml`,
  `tools/check-packaged-styles.mjs`
- Delete: `tools/check-peer-ranges.mjs`

- [ ] **Step 1: One release config**

Copied from `libs/shared/release.config.cjs` with the ui tag format, `pkgRoot: '../../dist/libs/ui'`,
and the stamp command naming `ui`.

- [ ] **Step 2: Collapse the release workflow**

The three-way matrix becomes one job; the `github-release` job stops aggregating and names the one
package.

- [ ] **Step 3: Collapse PR validation**

Three dry runs become one. The `changelog-check` loop reads one `CHANGELOG.md`. The peer-range step
goes, with the tool — there is no range left to check. That deletion is the point of the whole
change.

- [ ] **Step 4: Retarget the packaged-styles check**

Its package list becomes `@zambon-dev/ui`. Its directory read over `dist/libs/ui/fesm2022` already
sees the secondary bundles, which land in that same folder.

- [ ] **Step 5: Verify**

Run: `node tools/check-packaged-styles.mjs` against a fresh production build. Expected: PASS. Then a
semantic-release dry run in `libs/ui` with validation mode on; expected: resolves `1.0.0`.

- [ ] **Step 6: Commit**

`ci(no-release): release the single @zambon-dev/ui package`

---

### Task 8: One Storybook

**Files:**
- Move: `libs/library/.storybook/**` → `libs/ui/.storybook/`
- Modify: `libs/ui/project.json`, `.github/workflows/storybook.yml`, root `package.json` scripts

- [ ] **Step 1: Single config and target**

One `.storybook` whose stories glob covers all three layers. Port 4400. `build-storybook` outputs to
`dist/storybook/ui`.

- [ ] **Step 2: Replace the three npm scripts**

`storybook:library|framework|shared` become `storybook`.

- [ ] **Step 3: Simplify the Pages workflow**

The hand-written three-link landing page goes; the site is the single Storybook at the root.

- [ ] **Step 4: Build and look**

Run: `npx nx build-storybook ui`
Expected: PASS, and the sidebar shows `Library/`, `Framework/`, `Shared/` with nothing orphaned.
This is also the only gate that compiles the stories — Review Focus 4.

- [ ] **Step 5: Commit**

`ci(no-release): serve one Storybook for the unified package`

---

### Task 9: Documentation

**Files:**
- Create: `libs/ui/{CHANGELOG.md,README.md,CLAUDE.md}`, `docs/guides/migrating-to-ui.md`
- Modify: root `README.md`
- Delete: the three old `CHANGELOG.md`, `README.md`, `CLAUDE.md`

- [ ] **Step 1: Merge the changelogs**

One `CHANGELOG.md`, the three histories kept under identifiable per-layer headings, with an open
`## [Unreleased]` carrying the migration as a breaking change.

- [ ] **Step 2: Merge README and CLAUDE.md**

One of each. The new `CLAUDE.md` drops the `@library` / `@framework` / `@shared` path aliases the
three current files claim — they are not in `tsconfig.base.json` and nothing imports them.

- [ ] **Step 3: Write the migration guide**

The import table, the `/testing` subpath, the two i18n asset constants and their new
`node_modules/@zambon-dev/ui/i18n/<layer>` paths, and the widened peer set.

- [ ] **Step 4: Commit**

`docs(no-release): document the unified package and the migration`

---

### Task 10: End-to-end verification

Nothing inside the workspace can catch an `exports`, peer-resolution or scoped-CSS fault, because
everything here resolves through path mappings to `src`.

- [ ] **Step 1: Full local gate**

Run: `npm run format:check && npx nx lint ui && npx nx test ui && npx nx build ui --configuration=production`
Expected: all PASS.

- [ ] **Step 2: Install as a consumer installs**

Pack the dist into a clean directory, install it in a scratch Angular app, import from all five
entry points and build. Expected: resolves and compiles — Review Focus 2.

- [ ] **Step 3: Run SecurityHub against the tarball**

The real consumer. Expected: renders with styles intact — Review Focus 3.

- [ ] **Step 4: Commit and open the PR**
