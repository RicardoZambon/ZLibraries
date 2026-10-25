# Library-wide layout review

- **Date:** 2026-10-24
- **Status:** Approved (design) → implementation
- **Libraries affected:** `@library`, `@framework`, `@shared`, plus `tools/`
- **Predecessor:** [sidebar rework, phase 1](2026-07-27-sidebar-rework-phase1-design.md)

## 1. Context

The sidebar rework was planned in three phases. Phase 1 landed: semantic surface tokens, pill
selection, rounded restyle. Phase 2 landed only partly — the sidebar and the tabs became
translucent cards over a tokenized backdrop, and the top bar did not follow. Phase 3, light and
dark theming, never started.

The result is a product that speaks two visual languages on one screen. The tab panel is a 20px
rounded glass card; the toolbar directly above it is an opaque white rectangle with a hairline
border. Forty-odd other components were never touched at all. The login screen has had no design
decision since May 2025 and uses the brand colour nowhere: an amber frame around the logo,
slate-grey field icons, a generic blue border.

Two things on the login screen are broken rather than dated, and were confirmed rather than
assumed:

- `Login-Title` and `Login-Copyright` are used in the template and exist in neither translation
  file, so the card's heading and footer render the raw key in any consuming application.
- The logo and the background image are fixed absolute paths with no configuration and no asset
  anywhere in the repository. The top bar already reads its logo from `AppConfig`.

**Intended outcome:** all 57 components speaking one visual language, light and dark themes
working, and one button component in place of the global classes.

## 2. Decisions locked with the user

| Decision       | Choice                                                                  |
| -------------- | ----------------------------------------------------------------------- |
| Ambition       | Refine what exists and build the token layer; keep the current identity |
| Reference      | Extend the vocabulary of the sidebar rework to everything else          |
| Dark theme     | Ship it, not just prepare for it                                        |
| `.btn` classes | Remove them; replace with a single button component                     |
| Delivery       | One pull request                                                        |

One pull request of this size produces a large diff. The mitigation is the commit sequence: each
commit closes a phase that can be reviewed, and reverted, on its own.

## 3. Approaches considered

**Keep extending per-component tokens.** Rejected. Naming `--modal-*`, `--ribbon-*`, `--grid-*`
and so on for the remaining components would reach roughly 200 variables, and a theme switch would
have to restate every one of them.

**Replace the per-component tokens with a core.** Rejected. `--sidebar-*` and `--tabs-*` are
documented as public API and consuming applications override them; removing them is a breaking
change for no gain.

**Derive the per-component tokens from a core.** Chosen. The published names stay and keep their
meaning; their values become a role in a semantic core. A theme then moves ~35 core tokens instead
of every component. Custom property resolution makes this safe: an application's override competes
with our declaration of the same name, and what that declaration contains is irrelevant.

## 4. The core

59 tokens. 48 in `@theme`, which makes each one a Tailwind utility as well; 11 in a plain `:root`,
for the families Tailwind has no namespace for (`--state-*`, `--duration-*`, `--opacity-disabled`,
`--focus-ring-*`). Families, counts and values are in
[the design tokens guide](../../guides/design-tokens.md), which is also what consumers read.

Deliberately absent: breakpoints, because a custom property cannot be used in a media query
condition and Tailwind already publishes `--breakpoint-md` at the 768px these libraries use; and a
spacing scale, because `@apply p-2/p-3/gap-2` already is one.

Every value was read out of the components that already look right, not invented. That is what
makes the derivation step provable.

## 5. The theme switch

An attribute on `<html>`, with system detection resolved in TypeScript.

`prefers-color-scheme` alone was rejected: a consuming application could not opt out of a dark
theme, and a user could not choose light on a dark machine. Media query as default plus attribute
as override is the behaviour we want, but in plain CSS it duplicates the block of dark values —
and `theme.css` is CSS, not SCSS, so there is no mixin to include it twice. Resolving "system" in
`ThemeService` gives the same behaviour from one block.

The attribute must exist before the first paint, so an inline snippet in `index.html` writes it and
the service picks up from there. An application that never adds the snippet never has a dark theme.

## 6. What the work uncovered

Two defects in the verification tooling, both fixed before any visual change, both of the kind that
reports nothing:

- **A second `@theme` block is pruned.** `theme(static)` on the `@import` covers the theme Tailwind
  imports, not a block declared afterwards. Built without `@theme static`, all 48 core tokens were
  dropped while the dark block — plain CSS — survived, so the light theme would have resolved to
  nothing and only the dark theme would have worked. Caught by grepping the generated CSS, which is
  now part of the verification routine.
- **The style snapshot had a noise floor of 122 elements.** Two captures of one build of the shared
  Storybook disagreed on 122 of 1331 elements: sub-pixel widths and an opacity flipping between 1
  and 0.6. The cause was a flat 350ms wait racing the data grid's 150ms ResizeObserver debounce and
  a ribbon button's access check. It now waits for box sizes and opacity to hold still. The floor
  is 0, which is what makes an empty-diff acceptance criterion mean anything.

A third, worth knowing but not a defect: Nx replays a Storybook build from cache when only
`shared/styles/theme.css` changed, because the component stylesheets reference it by relative path
and the dependency graph cannot see that. Stylesheet work needs `--skip-nx-cache`.

## 7. Sequence

Phases, each a commit: instrumentation and baseline; the core; derivation (empty diff required);
the theme mechanism; the glass family; the surfaces inside the glass; the overlays; the forms and
focus; the button; the frame and the remaining globals; the login; documentation.

Ordering rationale, verification routine and risks are in the implementation plan.

## 8. Public API and consumer impact

| Change                                             | Type                          | Migration                                                                     |
| -------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| Semantic core tokens                               | Added                         | None                                                                          |
| `--sidebar-*` / `--tabs-*` derive from the core    | Changed, same computed values | None                                                                          |
| Component tokens move into `@layer tokens`         | Changed                       | None; overrides now win regardless of import order. Override without a layer. |
| `data-theme` attribute and `ThemeService`          | Added                         | Optional; add the snippet to get a dark theme                                 |
| `.btn` and its 154 colour variants removed         | **Breaking**                  | Replace with the button component                                             |
| Focus ring moves from `:focus` to `:focus-visible` | Changed, behavioural          | None; the ring stops appearing on mouse click                                 |
