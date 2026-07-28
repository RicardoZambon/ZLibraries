# Sidebar navigation rework — Phase 1: adopt patterns

**Date:** 2026-07-27
**Component:** `@library` `lib-sidebar` / `lib-sidebar-item`
**Status:** Approved design → implementation
**Reference:** Figma community "Sidebar Navigation Menu for Dashboard (Dark & Light)"

## 1. Background & goal

We are reworking the app navigation to feel closer to the reference design. The
reference is a floating, translucent "glass" sidebar (dark + light) with a profile
header, grouped sections, pill-style selection, a right-side flyout for a collapsed
rail, tree-connector lines, and a footer call-to-action.

The rework is **planned in full but delivered in reviewed slices**:

| Phase | Scope | Notes |
|-------|-------|-------|
| **1 — Adopt patterns** *(this spec)* | Design tokens, pill selection, collapsed→flyout submenus, footer action slot | Restyle only. Brand colors and current layout stay. |
| 2 — Glass overhaul | Translucent surfaces + blur + rounded floating panel | Layout/backdrop changes land in `main-layout`. Mostly token value swaps. |
| 3 — Dark/light theming | Light/dark token set + theme mechanism | Wired to the top-bar's already-reserved theme-switch slot. |

### Architectural framing

The reference is a **sidebar-only** layout. Our app is **top-bar + sidebar**: the
[top-bar](../../../libs/shared/src/lib/layouts/top-bar/top-bar.component.html) already
owns `shared-brand`, `shared-user-profile`, notifications, and language, and reserves a
(deferred) theme-switch slot. Therefore the sidebar stays focused on **navigation** and
does **not** duplicate identity/brand. Decisions locked with the user:

- **Profile header:** skipped — identity lives in the top-bar.
- **Section grouping (MAIN/MESSAGES headers):** deferred to a later phase.
- **Icons:** app-/data-driven (the library renders whatever icon class the menu supplies);
  swapping FontAwesome-solid for a thinner set is not a library change.

## 2. Phase 1 scope

1. **Design-token layer** — semantic surface/color tokens (forward-compat foundation).
2. **Pill selection** — rounded pill highlight replacing the 4px left bar.
3. **Collapsed flyout** — CDK-overlay popover of a parent's children when the rail is
   collapsed on desktop (flagship interaction).
4. **Footer action slot** — optional projection slot for a persistent primary action.
5. **Tests, Storybook, changelog.**

### Non-goals (Phase 2/3 or deferred)

Glassmorphism/translucency, rounded floating panel, any layout change, dark/light theme,
profile header, section grouping, icon-set swap.

## 3. Detailed design

### 3.1 Design-token layer

Today `--sidebar-*` variables are **dimensional only** (widths, durations, sizes) and
colors are hardcoded Tailwind utilities (`@apply bg-primary-600`, `text-gray-200`, …).
We add a **semantic surface/color token set**, initialized to today's brand values, and
route the sidebar SCSS through them. Result: **no visual change in Phase 1**, but Phases
2–3 become value swaps rather than rewrites.

New tokens (initial Phase-1 values; tunable during Storybook review):

| Token | Meaning | Phase-1 value (current-equivalent) |
|-------|---------|-------------------------------------|
| `--sidebar-bg` | Rail background | `primary-600` |
| `--sidebar-nav-bg` | Nav list background | `primary-700 / 80%` |
| `--sidebar-text` | Item text | `gray-200` |
| `--sidebar-text-muted` | Footer/muted text | `gray-300 / 60%` |
| `--sidebar-item-hover-bg` | Hover fill | `white / 10%` |
| `--sidebar-item-selected-bg` | **Pill** fill (new) | `white / 15%` |
| `--sidebar-item-selected-text` | Selected text | `white` |
| `--sidebar-accent` | Marker/indicator accent | `gray-100` |
| `--sidebar-flyout-bg` | Flyout panel surface | solid `primary-700` |
| `--sidebar-flyout-text` | Flyout text | `gray-100` |
| `--sidebar-flyout-shadow` | Flyout elevation | existing sidebar shadow |
| `--sidebar-item-radius` | Pill/row rounding (new) | `8px` |
| `--sidebar-flyout-radius` | Flyout panel rounding (new) | `10px` |

**File consolidation:** there are currently two byte-identical token files —
`libs/library/src/styles/variables.scss` (tracked) and `libs/library/src/styles/_variables.scss`
(untracked). Consolidate to a **single canonical file**: verify which one the build
actually imports, keep that as the source of truth (extended with the tokens above), and
remove the duplicate. `libs/shared/src/styles/variables.scss` mirrors the same values —
keep it in sync or have it defer to the library file.

### 3.2 Pill selection — `sidebar-item.component.scss`

- Replace the first-level `:before` **4px left accent bar** with a rounded **pill** on the
  item's row container (`> div`): `background: var(--sidebar-item-selected-bg)`,
  `border-radius: var(--sidebar-item-radius)`, inset horizontally (small side margin) so the
  pill floats within the rail, matching the reference.
- Apply to **top-level and child** items (the reference highlights both "Dashboard" and the
  "Statistic" child).
- **Hover** = a lighter pill (`--sidebar-item-hover-bg`) with the same radius/inset.
- **Collapsed rail:** the inset pill becomes a centered rounded highlight behind the icon
  (reference's selected-icon treatment); icon centering must be preserved.
- Keep the expandable-parent chevron marker, restyled to token colors.

### 3.3 Collapsed flyout — `sidebar-item.component.ts` (flagship)

**Behavior.** When the rail is **collapsed on desktop** (`isCollapsed && !isActive`) and the
item **is a parent** (`childCount > 0`), interacting with it opens a **flyout popover**
anchored to its right listing that parent's children — instead of today's behavior of
popping the whole rail open as an overlay. Expanded and mobile-overlay states keep the
existing **inline accordion** untouched.

**Implementation** reuses the established CDK-overlay pattern from
[catalog-select](../../../libs/library/src/lib/components/catalog-select/catalog-select.component.ts):

- `Overlay` + `OverlayPositionBuilder` + `FlexibleConnectedPositionStrategy` +
  `TemplatePortal`, `hasBackdrop: false`, `scrollStrategies.reposition()`.
- Anchor to the item row (`menuContainer` `@ViewChild`). Positions: primary **right**
  (`originX:'end' → overlayX:'start'`, top-aligned), fallback **left**
  (`originX:'start' → overlayX:'end'`); rely on the flexible strategy to flip/push near
  viewport edges.
- **Content:** a panel with the parent label as header + the children rendered via
  `lib-sidebar-item` in a new **flyout display mode** (labels shown; deeper parents use the
  existing inline accordion inside the overlay, which is not clipped). This reuses all
  selection and lazy-load logic.
- **New input:** `@Input() displayMode: 'rail' | 'flyout' = 'rail'` on `SidebarItemComponent`.
  In `'flyout'` mode the host renders expanded-style regardless of `service.isCollapsed`
  (add a `[class.flyout]` host binding that the SCSS treats like `.expanded`).

**Lazy-loading.** Opening a flyout for a not-yet-loaded parent triggers the existing
child-load path (`SidebarService.loadChildren`) and shows the existing loading indicator
inside the flyout.

**Triggers.**
- **Hover:** `mouseenter` on the anchor opens; `mouseleave` starts a ~150 ms close timer;
  entering the overlay panel cancels it; leaving the panel closes. (Close-intent delay so
  moving cursor from icon to panel doesn't dismiss.)
- **Click:** toggles the flyout. Selecting a child navigates (existing `select()` →
  `menuUrlSelected`) and closes the flyout.
- **Keyboard:** anchor focused → `Enter`/`ArrowRight` opens and moves focus to the first
  child; `ArrowUp`/`ArrowDown` move between children; `Escape`/`ArrowLeft` close and return
  focus to the anchor.

**Dismiss & cleanup.** Outside `mousedown`+`mouseup` (per catalog-select), `Escape`, and
route selection all close the flyout. `detach()` + `dispose()` on close and in an overridden
`ngOnDestroy` (calling `super.ngOnDestroy()`).

**ARIA.** Anchor gets `aria-haspopup="menu"` and `aria-expanded`; the flyout panel uses
`role="menu"` with `role="menuitem"` children (or reuse the item's link semantics), and
focus management as above.

### 3.4 Footer action slot — `sidebar.component.html`

- Keep the existing default `<ng-content>` footer (muted version text; hidden when
  collapsed — unchanged).
- Add an optional **named slot** `<ng-content select="[sidebar-action]">` in its own
  container **above** the version footer, for a prominent, persistent primary action (the
  reference's "Add New Task"). It stays visible in **both** collapsed and expanded states;
  the app supplies content that adapts (e.g., full button when expanded, icon button when
  collapsed).
- Styling via tokens; the container collapses (`:empty` → hidden) when no action is
  projected, so this is **backward-compatible** for existing consumers.

## 4. Public API / consumer impact

| Change | Type | Migration |
|--------|------|-----------|
| New `--sidebar-*` surface tokens | Added, defaulted | None — override to re-theme |
| `SidebarItemComponent.displayMode` input | Added (internal default `'rail'`) | None |
| `[sidebar-action]` projection slot | Added, optional | None |
| Pill selection replaces 4px left bar | Changed (visual) | None (visual only) |
| Collapsed parent → flyout (was full-rail expand) | Changed (behavior) | None — improved UX |

No breaking changes expected.

## 5. Testing

- **Unit (`sidebar-item.component.spec.ts`):** flyout opens on hover/click/keyboard when
  collapsed-parent; does **not** open when expanded or for leaf items; closes on
  outside-click, Escape, and child selection; overlay is disposed on close and on destroy;
  lazy-load path invoked when children absent.
- **Unit (`sidebar.component.spec.ts`):** `[sidebar-action]` slot renders and stays visible
  collapsed; selected item carries the pill class.
- **Storybook (`sidebar.component.stories.ts`):** add/extend a story exercising collapsed
  flyout, pill selection, and the action slot (multi-level menu from the existing mock
  service).
- `npx nx test library` and `npx nx lint library` green; `npx nx build library` succeeds.

## 6. Documentation

- **`libs/library/CHANGELOG.md` `[Unreleased]`** (required):
  - *Added* — collapsed-rail flyout submenus; `[sidebar-action]` footer slot; semantic
    `--sidebar-*` surface tokens; `SidebarItemComponent.displayMode`.
  - *Changed* — selected item uses a pill highlight instead of a left accent bar.
  - *⚠ Breaking / Migration* — None.
- Follow Conventional Commits (`feat(sidebar): …`) so semantic-release picks a minor bump.

## 7. Open questions

None blocking. Token values in §3.1 are provisional and will be tuned against Storybook
during implementation before the Phase-1 review.
