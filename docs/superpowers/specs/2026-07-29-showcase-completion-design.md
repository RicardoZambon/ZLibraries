# Showcase completion + two library fixes

- **Date:** 2026-07-29
- **Status:** Approved (design)
- **Libraries affected:** `@library` and `@framework` (shipped code), `@shared` (story only), `tools/storybook`
- **Branch:** `feat/sidebar-rework`
- **Predecessor:** [2026-07-28-storybook-app-showcase-design.md](2026-07-28-storybook-app-showcase-design.md)

## 1. Context

The `Shared/App Showcase` story now renders five navigable screens (Dashboard, Users list + detail,
Customers list + detail, Units list) through the real framework hosts. Reviewing it in the browser
surfaced five gaps. Investigation established that **two of them are genuine bugs in shipped library
code that also affect the real consuming app (Panthor)** — not story artifacts.

## 2. Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| **Scope** | One spec, library fixes sequenced first | Stops the showcase papering over real bugs; one coherent review |
| **Checkbox fix** | Strip the stray attribute (`[attr.type]: null`) | Non-breaking, ~2 lines, fixes every affected type, fixes Panthor's ~19 call sites on upgrade with no edits |
| **Grid height** | Key off `TabViewList` via a host marker class | Automatic for all list views with zero consumer changes; leaves non-grid routed screens untouched |
| **Translations** | Full keys with `en` + `pt` | Makes the language selector visibly switch the entire showcase, demonstrating i18n as a first-class feature |
| **Sequencing** | Proceed now, reconciling with in-flight `@framework` work if needed | User directive; two background sessions are editing `DefaultTabViewComponent` and `libs/framework/eslint.config.mjs` |

## 3. Root causes (established by investigation — do not re-derive)

### 3.1 The checkbox black box

Three things combine:

1. **Angular writes static attributes to the DOM even when a directive consumes them as an `@Input()`.**
   `setUpAttributes` calls `renderer.setAttribute` for every static attribute; `setInputsFromAttrs`
   separately copies matching ones into the directive instance and never removes the attribute. So
   `type="checkbox"` on `<lib-form-input-group>` leaves a real `type="checkbox"` attribute on the host.
2. **`@tailwindcss/forms` emits tag-agnostic attribute selectors.** With the default
   `strategy: ['base','class']` it compiles to, verbatim:
   `[type="checkbox"],[type="radio"] { appearance:none; padding:0; height:1rem; width:1rem; color:rgb(37,99,235); background-color:#fff; border-color:rgb(107,114,128); border-width:1px }`
   These reach the page via `@tailwind base` in `libs/shared/src/styles/common.scss` and
   `apps/storybook-host/src/styles.scss`.
3. **`:host` only overrides some of it.** `form-input-group.component.scss`'s
   `:host { @apply grid grid-cols-subgrid col-span-2 gap-3 }` has the same specificity (0,1,0) and wins
   only for `display`/`grid-*`. `border-width`, `border-color`, `background-color`, `height`, `padding`
   and `color` all survive. Because the inline axis is subgridded but the block axis is not, `width:1rem`
   is overridden while `height:1rem` is not.

Measured live on `/general/customers/2`: the `isActive` host is a **278×16px, 1px `#6b7280`, white-filled
rectangle** whose bottom edge cuts through the ~24px row. The blue tick is the same bug — the plugin's
`color:rgb(37,99,235)` is inherited by the Font Awesome glyph. The border is square-cornered; the pill
shape in the screenshot is the switch itself.

**The attribute-vs-binding hypothesis is confirmed**, though not for the reason implied: `type` is a plain
`@Input() type: string` with no setter, transform, or attribute read, so the *class property* is identical
either way. The operative difference is purely the DOM side effect. `form-input-group.component.html`
passes `type` down with a binding, so the nested `lib-form-input` correctly has no `type` attribute.

**Scope:** a genuine `@library` API footgun, not story-only. It affects
`type="text|number|date|datetime-local|email|password|tel|url|month|week|time|search"` too
(`textarea` is safe — that's a tag selector). Affected: 3 sites in the showcase, 5 in
`form-input-group.component.stories.ts`, 5 in `multi-editor.component.stories.ts`, and ~19 in Panthor.
Tellingly, **all five of Panthor's checkbox usages already use `[type]=`** — the case where the artifact
is unmissable — while its number/date/password sites use the attribute form and carry an invisible box.

### 3.2 The grid height chain

Grid height today is a floor, not a fill: `data-grid.component.ts`'s `bodyMinHeight` returns
`min(loadedRows, rowsToDisplay) × rowHeight`, bound as `[style.min-height.px]`. With defaults
`rowHeight: 41.6`, `rowsToDisplay: 6` and 5 seed rows that is `5 × 41.6 = 208px` + ~48px header ≈ **256px**
inside a 640px canvas — exactly the reported symptom.

The height chain from viewport to grid is intact through five elements
(`.main-container` → `.content`/`framework-tabs` → tabs host → `.tab-content` →
`framework-default-tab-view` host) and then **breaks in two places**:

- **the routed list component's host** — inserted as a sibling after `<router-outlet>`, a direct flex child
  of the `framework-default-tab-view` host, but nothing styles it;
- **`lib-data-grid`'s host** — `flex flex-col overflow-hidden`, with no `flex-grow`.

Panthor works around this by duplicating an identical 7-line stylesheet in **all 17** of its list
components (`:host-context { @apply flex flex-col flex-grow overflow-hidden gap-2 } lib-data-grid { @apply flex-grow }`).
Both rules are needed — `align-items: stretch` only stretches the cross axis.

**The detail path already solves this automatically.** `DefaultDetailsTabViewComponent` wraps its outlet in
`lib-group-container`, whose `.content-container ::ng-deep > * { @apply flex-grow overflow-hidden }` reaches
the routed form's host. That is why Panthor's *form* components need no SCSS while all its list components
do. **The asymmetry is an accident of `DefaultTabViewComponent` having no equivalent rule.**

Two mechanical notes: the bare `:host-context` (no parentheses) used throughout these libraries is
functionally identical to `:host`; and styling a routed host **requires `::ng-deep`**, because dynamically
created component hosts do not carry the parent's `_ngcontent-*` attribute.

## 4. Part 1 — Library fixes (land first)

### 4.1 `@library`: strip the stray `type` attribute

Add `'[attr.type]': 'null'` to the existing `host` blocks of `FormInputGroupComponent` and
`FormInputComponent`, with a comment naming the cause. Host bindings are applied after static attributes,
so this strips the attribute regardless of which syntax the consumer wrote, for every type.

`libs/library/CHANGELOG.md` → `Fixed`; Breaking Changes: None.

**Risk, to be retired first:** it was not verified live that an Angular host binding clears a
*statically-set* attribute. Angular applies host bindings after creation and `[attr.x]="null"` calls
`removeAttribute`, so it should hold — but the plan verifies this **before** anything depends on it.
Fallback if it does not: targeted `:host` resets in the two component stylesheets (still non-breaking).

Rejected alternatives: renaming the input to `fieldType` (breaking, ~19 Panthor edits); enumerating
`:host` resets as the primary fix (brittle whack-a-mole against plugin changes); switching the plugin to
`strategy: 'class'` (**would break every real `<input>` in the library**, since `form-input.component.scss`
relies on the plugin's base styles for border-width and padding, and those inputs carry no `.form-input`
class — it also wouldn't fix Panthor, which has its own Tailwind config).

### 4.2 `@framework`: automatic full-height list views

- `TabViewList` gains `host: { class: 'framework-view-list' }`. Angular merges `hostAttrs` from a base
  component definition into subclasses via `ɵɵInheritDefinitionFeature`, so every list view in every
  consuming app inherits it with zero changes.
- `default-tab-view.component.scss` gains two `::ng-deep` rules: the marker class becomes a growing flex
  column (`display:flex; flex-direction:column; flex-grow:1; min-height:0; overflow:hidden`), and a
  **descendant** selector gives `lib-data-grid` `flex-grow: 1`.

Use a **plain class name, not Tailwind utilities**, in `host`: library SCSS resolves `@apply` at
library-build time and is self-contained, whereas classes named in `host` metadata would have to be
generated by each *consumer's* Tailwind — a consumer that doesn't scan `node_modules/@zambon-dev/**`
would silently get no styling.

Use a **descendant** selector, not `> lib-data-grid`, so a list screen that nests its grid inside a
wrapper (e.g. filters above the grid) still works.

`libs/framework/CHANGELOG.md` → `Fixed`, noting consumers may now delete their per-list-component SCSS.
Breaking Changes: None.

Non-grid routed screens are untouched by construction: the showcase `DashboardComponent` extends
`TabViewBase`, not `TabViewList`, so it keeps auto-height and `.tab-content`'s `overflow-y: auto`
scrolling. A blanket rule on every routed child would clip it.

## 5. Part 2 — Showcase enhancements

### 5.1 Top bar branding, notifications, version footer

Everything is driven by `APP_CONFIG` — no top-bar component has a single `@Input()`.

| UI element | `AppConfig` field | Consumer |
|---|---|---|
| Logo | `logoUrl?` | `BrandComponent`, `@if (logoUrl)` |
| App name | `appName` | `BrandComponent`, always rendered |
| Subtitle | `companyName` | `BrandComponent`, `@if (companyName)` |
| Environment badge | `environment` | visible when non-empty and `!== 'PROD'` |
| Version | `version` | `MainLayoutComponent` → projected into the sidebar footer slot |
| Notifications bell | `notificationsEnabled` + `notificationsUrl` | `NotificationsService.isEnabled` |

Provide in the story: `APP_CONFIG` with `appName`, `companyName`, `environment: 'QA'` (so the badge
shows), `logoUrl`, `version: '1.0.0'`; a `NotificationsService` mock; and an `AuthenticationService` mock
returning `position`/`pictureUrl` (the global mock omits them). The `TopBar` story in `layouts.stories.ts`
already provides all of this and is the reusable reference.

`NotificationsService` mock surface — `getNotifications()` and `getUnreadCount()` are read in **field
initializers**, so they run at construction: `isEnabled`, `getNotifications(): Observable<INotification[]>`,
`getUnreadCount(): Observable<number>`, `start()`, plus `stop()`, `markAsRead()`, `markAllAsRead()` for
completeness. `INotification` is `{ title, description, icon, callToActionUrl?, isRead }`; `icon` is a Font
Awesome class applied verbatim.

The version reaches the footer by **content projection**, not an input:
`AppConfig.version` → `MainLayoutComponent.appVersion` → `<span>v{{ appVersion }}</span>` →
`lib-sidebar`'s `.sidebar-footer` `<ng-content>`. Pass `'1.0.0'`, not `'v1.0.0'` — the template adds the `v`.
The footer is visible by default (`isCollapsed` defaults false) and hides itself when empty (`&:empty`).

The logo must be an **inline SVG data URI** — the story must stay self-contained with no external requests.

### 5.2 Translations

These components translate their own inputs, so pass **keys**: `lib-data-grid` (`column.headerName`),
`lib-form-input-group` (`label`, `validations` values), `lib-form-group` (`label`), `lib-sidebar-item`
(`menu.label`), `lib-sidebar` (`region.name`), `TabsComponent`/`TabBreadcrumbs` (`tab.title`).

These do **not** self-translate and need an explicit `| translate` in the story template:
**`lib-group-accordion`** and **`lib-ribbon-group`**.

Naming follows Panthor's `{PascalCaseEntity}-{Category}-{Field}[-{Rule}]` convention, prefixed
`Showcase-`: e.g. `Showcase-Users-Column-Name`, `Showcase-Users-Field-Name`,
`Showcase-Users-Validations-Name-Required`, `Showcase-Menus-Dashboard`, `Showcase-Region-Administration`.
Ribbon-group labels reuse the framework's existing non-prefixed `RibbonGroup-Entity` / `RibbonGroup-General`.

Values go in `storybookTranslations` in `tools/storybook/storybook.providers.ts` under both `en` and `pt` —
the established home; no story anywhere adds its own translations.

Also add these genuinely-missing framework keys, which are currently broken or echoing:
`Format-Date`, `Format-DateTime` (without it `services-history-child-list` passes the literal string
`'Format-DateTime'` to `DatePipe` as a format pattern and renders mangled output), `Grid-Loading`,
`Grid-Message-Empty`, `Grid-Message-Failed`, `Grid-Message-LazyLoad`, `Button-Views-Details`,
`Button-Views-History`.

### 5.3 History / audit view

`ButtonViewsComponent` builds its options from the details route's **static `routeConfig.children`**,
reading `data.title`, `data.icon`, `data.allowedActions`, and excluding children with `data.ignoreRoute === true`
or no `data` object at all. `DefaultDetailsTabViewComponent` renders the button itself — Panthor never
writes `<framework-button-views>` anywhere.

Add to **both** the Users and Customers `:id` routes' `children`:

```ts
{ path: 'audit', component: ServicesHistoryViewComponent,
  data: { controllerName: 'Users', icon: 'fa-history', title: 'Button-Views-History' } },
```

`controllerName` lives in **route data**, not as a template binding, and is **per entity** — `'Users'` on
the Users route, `'Customers'` on the Customers route. The mock services key their canned rows off it, so
the two audit views show distinguishable data rather than the same rows twice. The path is a single segment, so it is
safe with respect to `RouteHelper.getRouteURL`'s segment reversal.

`ServicesHistoryViewComponent` wires its two child lists together internally and already declares its own
flex rules, so it is full-height without help and needs no glue code. Mock the two services duck-typed,
as `history.stories.ts` already does:

```ts
{ provide: ServicesHistoryService, useClass: ShowcaseServicesHistoryService },
{ provide: OperationsHistoryService, useClass: ShowcaseOperationsHistoryService },
```

**Row-key mismatch to handle:** `IServicesHistoryList` declares `ID` (uppercase), but `GridDataset.compareProperty`
defaults to `'id'` and `getRowID()` reads `row[compareProperty]`. So `selectedServiceID` is never set, the
operations dataset never refreshes, and **clicking a service row does nothing** — a latent bug the existing
history story already has. The showcase mock will emit **both** `ID` and `id` with a comment, rather than
guessing which side is wrong; the underlying `@shared` mismatch is filed separately (§8).

## 6. Files touched

| File | Change |
|---|---|
| `libs/library/src/lib/components/form-input-group/form-input-group.component.ts` | `[attr.type]: null` host binding |
| `libs/library/src/lib/components/form-input/form-input.component.ts` | `[attr.type]: null` host binding |
| `libs/framework/src/lib/views/tabview-list.ts` | `host: { class: 'framework-view-list' }` |
| `libs/framework/src/lib/components/views/default-tab-view/default-tab-view.component.scss` | two `::ng-deep` rules |
| `tools/storybook/storybook.providers.ts` | showcase + missing framework translation keys |
| `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts` | keys, top-bar providers, audit routes, history mocks |
| `libs/library/CHANGELOG.md`, `libs/framework/CHANGELOG.md`, `libs/shared/CHANGELOG.md` | entries |

## 7. Verification

Part 1 touches shipped code, so `nx build` must succeed and `nx test` must show **no new failures** for all
three libraries, measured against their documented baselines (`nx test shared` ~28 red, `nx test framework`
5 red suites / 3 red tests, `nx test library` 1 red suite — all pre-existing).

Lint baselines in **this** checkout: `nx lint shared` 17 errors / 76 warnings, `nx lint framework` 155 / 253,
`nx lint library` 193 / 399. Note the `@framework` selector-prefix fix is being done in a **separate
worktree** and is NOT in this branch — `libs/framework/eslint.config.mjs` here still reads `prefix: 'lib'`.
Do not expect the reduced 132-error figure until that work is merged. Nothing in this spec depends on it:
`host: { class: 'framework-view-list' }` is a host *class*, not a selector, so the prefix rules never apply
to it.

Browser click-through per area:
- **Checkbox** — the `ACTIVE` row's bordered box is gone in both view and edit mode, on Users and
  Customers; the view-mode tick is no longer forced blue. Confirm via `getComputedStyle` that the host's
  `border-width` is `0px` and `height` is no longer `16px`.
- **Grid height** — all three list grids fill the canvas; the Dashboard (non-grid) is NOT clipped and still
  scrolls; detail forms unchanged.
- **Translations** — switching the top bar's language selector to Portuguese visibly changes sidebar menu
  items, grid headers, and form labels; no raw keys remain visible.
- **History** — Views → History loads audit rows, and selecting a service row loads its operations
  (the row-key fix); dates render as real dates, not mangled patterns.
- **Top bar** — logo, app name, subtitle and `QA` badge render; the bell appears with an unread count and
  opens a populated dropdown; `v1.0.0` shows in the sidebar footer.

## 8. Out of scope — filed separately

- The `IServicesHistoryList.ID` vs `GridDataset.compareProperty = 'id'` mismatch in `@shared` (real bug;
  the showcase works around it in its mock).
- Storybook providing `@library`'s `DataGridConfigsProvider` (hardcoded English messages) instead of
  `@framework`'s key-based `FrameworkGridConfigsProvider`.
- Deleting Panthor's now-redundant 17 per-list-component stylesheets (different repo).
- Renaming `type` → `fieldType` as a future breaking change.
- The `NG0100` fix in `DefaultTabViewComponent` and the `@framework` eslint selector prefix — both already
  running in separate sessions.
