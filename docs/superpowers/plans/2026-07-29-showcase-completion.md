# Showcase Completion + Library Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two shipped-library bugs the showcase exposed (a leaked `type` attribute that Tailwind styles, and list grids that don't fill their container), then finish the showcase with real translations, an audit view, and a branded top bar.

**Architecture:** Part 1 changes `@library` (two host bindings) and `@framework` (a host marker class on `TabViewList` plus two `::ng-deep` rules), both non-breaking and both benefiting the real consuming app. Part 2 is confined to `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts` and the shared Storybook translation table.

**Tech Stack:** Angular 19, Storybook 8 (`@storybook/angular`), RxJS, Nx, Tailwind + `@tailwindcss/forms`, `@ngx-translate/core`.

**Spec:** [2026-07-29-showcase-completion-design.md](../specs/2026-07-29-showcase-completion-design.md)

---

## Verified facts (do not re-derive)

1. **The checkbox bug** — `type="checkbox"` as a *static attribute* stays on the `<lib-form-input-group>` host. `@tailwindcss/forms` (default `strategy: ['base','class']`) emits tag-agnostic `[type="checkbox"] { border-width:1px; border-color:rgb(107,114,128); background-color:#fff; height:1rem; padding:0; color:rgb(37,99,235) }`, which matches the host. `:host`'s `@apply grid grid-cols-subgrid …` has equal specificity and only wins for `display`/`grid-*`. Measured: a 278×16px bordered white box. The blue tick is the same rule's `color`, inherited by the Font Awesome glyph.
2. **`type` is a plain `@Input() type: string`** on both components — no setter, transform, or attribute read — so attribute vs. property binding sets the *class property* identically. Only the DOM side effect differs. `form-input-group.component.html` already passes `type` down with a binding, so `lib-form-input` has no stray attribute when used normally.
3. **Both components already have a `host` block** — `host: { '[class.full-height]': 'isFullHeight' }` — so the new binding slots into existing metadata. (`form-input-group.component.ts:23-25`, `form-input.component.ts:21-23`.)
4. **Grid height is a floor, not a fill.** `data-grid.component.ts`'s `bodyMinHeight` = `min(loadedRows, rowsToDisplay) × rowHeight`, bound as `[style.min-height.px]`. Defaults `rowHeight: 41.6`, `rowsToDisplay: 6`.
5. **The flex chain breaks in exactly two places:** the routed list component's host (a direct flex child of the `framework-default-tab-view` host, styled by nothing) and `lib-data-grid`'s host (`flex flex-col overflow-hidden`, no `flex-grow`). Both rules are required — `align-items: stretch` only stretches the cross axis.
6. **`::ng-deep` is mandatory** for styling a routed host: dynamically created component hosts do not carry the parent's `_ngcontent-*` attribute. Precedent: `lib-group-container`'s `.content-container ::ng-deep > *`. **Anchor it on `:host`** (`:host ::ng-deep .x`) — a bare `::ng-deep .x` emits a fully *global*, unscoped class selector, which in a shipped library reaches far more than intended (it would also catch `ListView` subclasses inside detail views, since `ListView extends TabViewList`).
   - **Do NOT try to verify that scoping by grepping the library's `dist/` bundle.** Publishable Angular libraries build in **Ivy partial compilation mode**, so the linker that rewrites `:host`/`::ng-deep` into `[_nghost-*]`/`[_ngcontent-*]` runs in the *consuming application's* build, not the library's — `_nghost` appears zero times anywhere in `dist/libs/framework`, for every component. Verify in the consuming app's **live DOM** instead, by reading `document.styleSheets` for the emitted `selectorText`. Confirmed working: `[_nghost-ng-c3984974818] .framework-view-list`.
7. **Angular merges `hostAttrs` from a base component into subclasses** via `ɵɵInheritDefinitionFeature`, so a static host class on `TabViewList` is inherited by every list view with zero consumer changes.
8. **Use a plain class name in `host`, never Tailwind utilities.** Library SCSS resolves `@apply` at library-build time and is self-contained; a class named in `host` metadata would need each *consumer's* Tailwind to generate it.
9. **`bare :host-context` (no parentheses) is functionally identical to `:host`** and is the house idiom in these libraries. Keep it for consistency in existing blocks.
10. **`DashboardComponent` extends `TabViewBase`, not `TabViewList`** — so keying the height fix off `TabViewList` leaves it untouched. A blanket rule on every routed child would clip it.
11. **These components translate their own inputs** (pass keys): `lib-data-grid` `column.headerName`; `lib-form-input-group` `label` + `validations` values; `lib-form-group` `label`; `lib-sidebar-item` `menu.label`; `lib-sidebar` `region.name`; `TabsComponent`/`TabBreadcrumbs` `tab.title`.
12. **These do NOT self-translate** and need an explicit `| translate` in the template: **`lib-group-accordion`** and **`lib-ribbon-group`**.
13. **`AppConfig` constructor is `new AppConfig(baseUrl, options?)`** with `AppConfigOptions { appName?, companyName?, environment?, logoUrl?, notificationsEnabled?, notificationsUrl?, version? }`.
14. **The bell's gate is `NotificationsService.isEnabled`**, which in the real service is `notificationsEnabled && notificationsUrl.length > 0`. We provide a **mock**, so the mock's `isEnabled` is what's read — but set both AppConfig fields anyway so the config documents intent and the real service would also be satisfied.
15. **`getNotifications()` and `getUnreadCount()` are read in field initializers** of `NotificationsComponent`, so they run at construction and must exist on the mock.
16. **The version reaches the footer by content projection**: `AppConfig.version` → `MainLayoutComponent.appVersion` → `<span>v{{ appVersion }}</span>` → `lib-sidebar`'s `.sidebar-footer` `<ng-content>`. Pass `'1.0.0'` — the template adds the `v`.
17. **`ButtonViewsComponent` builds options from the details route's static `routeConfig.children`**, reading `data.title`, `data.icon`, `data.allowedActions`, skipping children whose `data` is absent or `data.ignoreRoute === true`. `DefaultDetailsTabViewComponent` renders the button itself.
18. **`ServicesHistoryViewComponent`** (`shared-services-history-view`) takes `controllerName` (required) and `entityID?`, falls back to `route.snapshot.data['controllerName']`, wires its two child lists internally, and already declares its own flex rules — so it needs no height help and no glue code.
19. **Row-key mismatch:** `IServicesHistoryList` declares `ID` (uppercase) but `GridDataset.compareProperty` defaults to `'id'`, so `getRowID()` returns `undefined`, `selectedServiceID` never changes, and clicking a service row never loads operations. The existing `history.stories.ts` has this bug. Emit **both** keys in showcase mocks.
20. **The two in-flight background sessions are in SEPARATE worktrees.** `libs/framework/eslint.config.mjs` in this checkout still reads `prefix: 'lib'`, and `DefaultTabViewComponent` is unmodified. Nothing here depends on that work; `host: { class: 'framework-view-list' }` is a host *class*, so selector-prefix rules never apply.

## Baselines (compare against these; do not "fix" them)

| Command | Baseline in this checkout |
|---|---|
| `nx test shared` | ~28 failed tests / 11 failed suites |
| `nx test framework` | 5 failed suites / 3 failed tests |
| `nx test library` | 1 failed suite (ribbon-group) |
| `nx lint shared` | 17 errors / 76 warnings |
| `nx lint framework` | 155 errors / 253 warnings |
| `nx lint library` | 193 errors / 399 warnings |

## Commands

Type-check the story (the only tsconfig that includes `*.stories.ts`):
```bash
npx tsc -p libs/shared/.storybook/tsconfig.json --noEmit
```

Storybook for `shared` runs on port **4402**. It may already be running — check before starting one:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4402
```

The showcase story URL:
```
http://localhost:4402/iframe.html?id=shared-app-showcase--navigable-app&viewMode=story
```

Note: synthesized coordinate clicks do not reach the page when the browser pane isn't compositing. Drive the UI by dispatching real DOM events, e.g. `el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))`. Ribbon buttons are anchors: click `lib-ribbon-button .button-container a`. Sidebar items: click `lib-sidebar-item div.parent` (parents) or `lib-sidebar-item div` (leaves).

---

## Task 1: `@library` — stop the `type` attribute leaking to the DOM

**Files:**
- Modify: `libs/library/src/lib/components/form-input-group/form-input-group.component.ts`
- Modify: `libs/library/src/lib/components/form-input/form-input.component.ts`

- [ ] **Step 1: Retire the risk first — prove a host binding clears a static attribute**

This whole task rests on one unverified assumption. Prove it before building on it.

Apply ONLY the `form-input-group` change (Step 2), then load the showcase story and check the DOM:

```js
(() => {
  const el = document.querySelector('lib-form-input-group[controlname="isActive"]');
  const cs = getComputedStyle(el);
  return JSON.stringify({
    typeAttr: el.getAttribute('type'),
    borderWidth: cs.borderWidth,
    height: cs.height,
    backgroundColor: cs.backgroundColor
  }, null, 2);
})()
```

Expected AFTER the fix: `typeAttr: null`, `borderWidth: "0px"`, and `height` no longer `16px`.

If `typeAttr` is still `"checkbox"`, the assumption is WRONG — stop and report BLOCKED with that output. The fallback (defensive `:host` resets in the two component stylesheets) is a different change and needs its own instruction.

- [ ] **Step 2: Add the host binding to `FormInputGroupComponent`**

Replace the existing `host` block:

```ts
  host: {
    '[class.full-height]': 'isFullHeight'
  }
```

with:

```ts
  host: {
    '[class.full-height]': 'isFullHeight',
    // Angular keeps static attributes in the DOM even when a directive consumes them as an
    // @Input(), so `type="checkbox"` would linger on this host element — where
    // @tailwindcss/forms' tag-agnostic `[type="checkbox"]` base rules style the host itself as
    // a checkbox (1px border, white fill, height:1rem). Clearing the attribute removes the
    // stray box for every type while leaving the `type` @Input() untouched.
    '[attr.type]': 'null'
  }
```

- [ ] **Step 3: Add the same binding to `FormInputComponent`**

Same replacement in `form-input.component.ts`. Use a shorter comment there, pointing at the other component so the rationale isn't duplicated in full:

```ts
  host: {
    '[class.full-height]': 'isFullHeight',
    // Clears a stray `type` attribute for the same reason as FormInputGroupComponent — see the
    // comment there. Applies when a consumer sets `type` on `lib-form-input` directly.
    '[attr.type]': 'null'
  }
```

- [ ] **Step 4: Verify the library still builds and tests at baseline**

```bash
npx nx build library
```
Expected: success.

```bash
npx nx test library 2>&1 | tail -n 8
```
Expected: 1 failed suite (ribbon-group) — the documented baseline, no new failures.

- [ ] **Step 5: Verify in the browser**

Re-run the Step 1 probe on **both** a Users detail and a Customers detail (`ACTIVE` and `MUST CHANGE PASSWORD` rows), in **view and edit mode**. All must report `typeAttr: null` and `borderWidth: "0px"`.

Also confirm the view-mode tick is no longer forced blue:
```js
(() => {
  const icons = Array.from(document.querySelectorAll('lib-form-input-group i'))
    .map(i => getComputedStyle(i).color);
  return JSON.stringify({ iconColors: icons }, null, 2);
})()
```
Expected: no `rgb(37, 99, 235)` among them.

- [ ] **Step 6: Commit**

```bash
git add libs/library/src/lib/components/form-input-group/form-input-group.component.ts libs/library/src/lib/components/form-input/form-input.component.ts && git commit -m "fix(library): clear the stray type attribute on form input hosts"
```

---

## Task 2: `@framework` — automatic full-height list views

**Files:**
- Modify: `libs/framework/src/lib/views/tabview-list.ts`
- Modify: `libs/framework/src/lib/components/views/default-tab-view/default-tab-view.component.scss`

- [ ] **Step 1: Add the host marker class to `TabViewList`**

Change the decorator from:

```ts
@Component({ template: '' })
export abstract class TabViewList<TListModel> extends TabViewBase implements OnInit {
```

to:

```ts
// The host class is inherited by every subclass (Angular merges hostAttrs from a base component
// definition), which is what lets DefaultTabViewComponent give routed list screens a full-height
// layout without each one declaring its own stylesheet. Plain class name, NOT Tailwind utilities:
// library SCSS resolves @apply at library-build time, whereas a utility class named here would
// have to be generated by each consumer's own Tailwind build.
@Component({ host: { class: 'framework-view-list' }, template: '' })
export abstract class TabViewList<TListModel> extends TabViewBase implements OnInit {
```

- [ ] **Step 2: Add the layout rules to `default-tab-view.component.scss`**

The file currently contains only the `:host-context` block. Append:

```scss
/* Routed list screens (anything extending TabViewList) get a full-height layout here rather than
   in each consuming component. ::ng-deep is required: a component created through router-outlet
   does not carry this component's _ngcontent-* attribute. Mirrors what lib-group-container
   already does for routed detail views. */
::ng-deep .framework-view-list {
    @apply flex flex-col flex-grow overflow-hidden;

    /* min-height:0 lets the flex child shrink below its content height so the grid's own
       scroll container takes over instead of overflowing the tab. */
    min-height: 0;

    /* Descendant, not child: a list screen may nest its grid inside a wrapper (e.g. filters
       above the grid) and must still stretch. */
    lib-data-grid {
        @apply flex-grow;
    }
}
```

- [ ] **Step 3: Verify the framework builds and tests at baseline**

```bash
npx nx build framework
```
Expected: success.

```bash
npx nx test framework 2>&1 | tail -n 8
```
Expected: 5 failed suites / 3 failed tests — the documented baseline, no new failures.

- [ ] **Step 4: Verify in the browser — grids fill, Dashboard is NOT clipped**

Navigate to each list screen and measure:

```js
(() => {
  const grid = document.querySelector('lib-data-grid');
  const host = document.querySelector('.framework-view-list');
  const tabContent = document.querySelector('.tab-content');
  return JSON.stringify({
    hasMarkerClass: !!host,
    gridHeight: grid ? Math.round(grid.getBoundingClientRect().height) : 'ABSENT',
    hostHeight: host ? Math.round(host.getBoundingClientRect().height) : 'ABSENT',
    tabContentHeight: tabContent ? Math.round(tabContent.getBoundingClientRect().height) : 'ABSENT'
  }, null, 2);
})()
```

Expected on Users / Customers / Units: `hasMarkerClass: true`, and `gridHeight` close to `tabContentHeight` (within ~60px for the ribbon/breadcrumbs) — NOT the old ~256px.

Then open the **Dashboard** and confirm the regression case:
```js
(() => {
  const dash = document.querySelector('shared-showcase-dashboard');
  return JSON.stringify({
    markerPresent: !!document.querySelector('.framework-view-list'),
    dashboardScrollHeight: dash ? dash.scrollHeight : 'ABSENT',
    dashboardClientHeight: dash ? dash.clientHeight : 'ABSENT',
    contentVisible: (dash?.innerText || '').includes('Recent activity')
  }, null, 2);
})()
```
Expected: `markerPresent: false` (Dashboard extends `TabViewBase`, so it must NOT carry the class) and its content fully present, not clipped.

Finally open a **detail** view and confirm the form still lays out correctly (it goes through `lib-group-container`, a different path).

- [ ] **Step 5: Commit**

```bash
git add libs/framework/src/lib/views/tabview-list.ts libs/framework/src/lib/components/views/default-tab-view/default-tab-view.component.scss && git commit -m "fix(framework): give routed list views a full-height layout automatically"
```

---

## Task 2b: Showcase — mocked latency so loading states are visible

Every mock currently returns `of(…)` synchronously, so the grid spinner, the Refresh button's
spinner, the form's loading state and the Save button's spinner/success tick all complete within one
change-detection pass and are never seen. Real backends are never instant; a small delay makes those
states observable, which is part of showing "the full picture".

**Files:**
- Modify: `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts`

- [ ] **Step 1: Add the latency constants**

Add `delay` to the existing `rxjs` import (keeping `defer`, `Observable`, `of`).

Insert directly **above** the `Mock backend — in-memory seed data` banner:

```ts
// ---------------------------------------------------------------------------
// Mock backend — latency
// ---------------------------------------------------------------------------

// Without a delay every mock resolves inside one change-detection pass, so the grid's loading
// spinner, the Refresh button's spinner and the form's loading state are never actually seen.
const SHOWCASE_LATENCY_MS: number = 400;

// Longer for writes so ButtonSave's spinner and its one-second success tick, and the delete
// confirmation modal's loading state, are comfortably visible.
const SHOWCASE_WRITE_LATENCY_MS: number = 800;
```

- [ ] **Step 2: Delay the reads**

- `ShowcaseDataset.getData()` — append `.pipe(delay(SHOWCASE_LATENCY_MS))` to the returned observable. This is what makes the grid spinner and the Refresh button's spinner visible on every list and on refresh.
- `ShowcaseSidebarService.loadMenus()` — append the same to **every** returned observable (root and both child branches). The sidebar shows its own loading state while a parent's children load (`lib-sidebar-item` renders a spinner for parents), so this demonstrates that too.
- `UsersDataProvider.loadModel()` and `CustomersDataProvider.loadModel()` — append the same. This makes `FormView`'s `formService.loading` state visible when opening a detail.

- [ ] **Step 3: Delay the writes**

- `UsersDataProvider.saveModel()` and `CustomersDataProvider.saveModel()` — append `.pipe(delay(SHOWCASE_WRITE_LATENCY_MS))`.
  **Order matters:** the upsert must still run when the observable is subscribed, not when `saveModel` is called. `of(saveUser(...))` evaluates `saveUser` eagerly at call time, which is fine here because `saveModel` is only ever invoked from a click handler — but wrap it as `defer(() => of(saveUser(...))).pipe(delay(SHOWCASE_WRITE_LATENCY_MS))` so the write happens on subscribe, consistent with `deleteById`, and cannot fire twice if the observable is ever re-subscribed.
- `deleteById()` — append `.pipe(delay(SHOWCASE_WRITE_LATENCY_MS))` to the `defer(...)`. Keep the mutation inside the `defer` callback so it still only runs on subscribe.

- [ ] **Step 4: Type-check and lint**

```bash
npx tsc -p libs/shared/.storybook/tsconfig.json --noEmit
npx eslint libs/shared/src/lib/stories/showcase/app-showcase.stories.ts
```
Expected: `tsc` exit 0; eslint 0 errors.

- [ ] **Step 5: Commit**

```bash
git add libs/shared/src/lib/stories/showcase/app-showcase.stories.ts && git commit -m "feat(storybook): add mocked latency so showcase loading states are visible"
```

**Consequence for all later verification:** the showcase is no longer synchronous. Browser checks must
wait for content rather than probing immediately after a click — poll for the expected element/text
with a short timeout instead of reading straight after dispatching the event.

---

## Task 3: Showcase — branded top bar, notifications, version footer

**Files:**
- Modify: `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts`

- [ ] **Step 1: Add imports**

Add to the `@zambon-dev/framework` import (keeping alphabetical order and all existing symbols): `APP_CONFIG`, `AppConfig`.

Add this import. All three symbols are re-exported from the root barrel (`libs/shared/src/index.ts` → `./lib/models`, `./lib/services`, `./lib/auth`), and this is exactly how the sibling `layouts.stories.ts:5` imports them — even though the story lives inside `libs/shared`:

```ts
import { AuthenticationService, INotification, NotificationsService } from '@zambon-dev/shared';
```

- [ ] **Step 2: Add the brand assets and notification seed**

Insert a new section directly **above** the `// Story shell` banner:

```ts
// ---------------------------------------------------------------------------
// Story shell — brand, notifications and user identity
// ---------------------------------------------------------------------------

// Inline data URI, not a URL: the story must stay self-contained with no external requests.
const SHOWCASE_LOGO: string =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<rect width="32" height="32" rx="7" fill="#006bb6"/>' +
      '<path d="M9 22.5 17.5 9.5h5.5L14.5 22.5z" fill="#ffffff"/>' +
      '<circle cx="11" cy="11" r="2.5" fill="#ffffff"/>' +
    '</svg>'
  );

// Plain text, NOT translation keys: NotificationsComponent renders `{{ item.title }}` and
// `{{ item.description }}` raw (notifications.component.html) — only its own chrome is piped.
// That is correct by design: real notifications arrive from the backend already localized.
const SHOWCASE_NOTIFICATIONS: INotification[] = [
  {
    title: 'Customer updated',
    description: 'Acme Industries was updated by Ada Lovelace.',
    icon: 'fa-solid fa-circle-info',
    callToActionUrl: '/general/customers/1',
    isRead: false,
  },
  {
    title: 'Unit needs review',
    description: 'Assembly Plant has no active supervisor.',
    icon: 'fa-solid fa-triangle-exclamation',
    isRead: false,
  },
  {
    title: 'Export finished',
    description: 'The customers list export is ready to download.',
    icon: 'fa-solid fa-envelope',
    isRead: true,
  },
];

// Mocked so the bell renders without the real service opening a SignalR connection.
// getNotifications()/getUnreadCount() are read in NotificationsComponent field initializers,
// so they must exist and return immediately.
const notificationsServiceMock = {
  isEnabled: true,
  getNotifications: () => of(SHOWCASE_NOTIFICATIONS),
  getUnreadCount: () => of(SHOWCASE_NOTIFICATIONS.filter((n: INotification) => !n.isRead).length),
  markAllAsRead: () => undefined,
  markAsRead: () => undefined,
  start: () => undefined,
  stop: () => Promise.resolve(),
};

// The globally provided auth mock has no position/pictureUrl, so the user block renders bare.
const authenticationServiceMock = {
  getUserInfo: () => ({
    costCenterName: 'IT',
    name: 'Ada Lovelace',
    position: 'System Administrator',
  }),
  isAuthenticated: true,
  signOut: () => undefined,
};
```

Note `pictureUrl` is deliberately omitted so the initials fallback renders — one fewer inline asset.

- [ ] **Step 3: Provide the config and mocks in the story**

In `meta.decorators`, inside the existing `applicationConfig({ providers: [...] })` array, add:

```ts
        {
          provide: APP_CONFIG,
          useValue: new AppConfig('', {
            // Plain text, NOT translation keys: BrandComponent renders `{{ appName }}` and
            // `{{ companyName }}` raw, with no translate pipe (brand.component.html), so a key
            // would be displayed literally.
            appName: 'ZLibraries Showcase',
            companyName: 'Zambon Dev',
            environment: 'QA',
            logoUrl: SHOWCASE_LOGO,
            notificationsEnabled: true,
            // Non-empty so the real service's isEnabled getter would also pass; the mock below
            // is what actually answers, so no connection is attempted.
            notificationsUrl: 'https://showcase.invalid/notifications',
            version: '1.0.0',
          }),
        },
        { provide: AuthenticationService, useValue: authenticationServiceMock },
        { provide: NotificationsService, useValue: notificationsServiceMock },
```

**Which strings are keys and which are plain text is not arbitrary — it follows what each component actually pipes.** Verified: `BrandComponent` renders `{{ appName }}`/`{{ companyName }}` raw, and `NotificationsComponent` renders `{{ item.title }}`/`{{ item.description }}` raw (only its own chrome is piped). So all four are **plain text**. Everything listed in Task 4's table IS piped by its component and must be a key. Do not "harmonise" these.

- [ ] **Step 4: Type-check**

```bash
npx tsc -p libs/shared/.storybook/tsconfig.json --noEmit
```
Expected: exit 0.

- [ ] **Step 5: Verify in the browser**

```js
(() => {
  const brand = document.querySelector('shared-top-bar');
  return JSON.stringify({
    topBarText: (brand?.innerText || 'ABSENT').replace(/\s+/g, ' ').slice(0, 120),
    hasLogoImg: !!document.querySelector('shared-top-bar img'),
    badge: (document.querySelector('shared-environment-badge')?.innerText || 'NONE').trim(),
    bellPresent: !!document.querySelector('shared-notifications'),
    sidebarFooter: (document.querySelector('.sidebar-footer')?.innerText || 'EMPTY').trim()
  }, null, 2);
})()
```

Expected: the logo `<img>` present, app name and company visible, badge `QA`, bell present, and `sidebarFooter` exactly `v1.0.0`.

Then click the bell and confirm the dropdown lists three notifications with an unread count of 2.

- [ ] **Step 6: Commit**

```bash
git add libs/shared/src/lib/stories/showcase/app-showcase.stories.ts && git commit -m "feat(storybook): brand the showcase top bar and sidebar footer"
```

---

## Task 4: Showcase — full translations (en + pt)

**Files:**
- Modify: `tools/storybook/storybook.providers.ts`
- Modify: `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts`

- [ ] **Step 1: Add every key to `storybookTranslations`**

In `tools/storybook/storybook.providers.ts`, add the following to **both** the `en` and `pt` blocks, as a coherent block matching the file's existing formatting. English first, Portuguese second.

**Framework keys currently missing (these fix real breakage — `Format-DateTime`'s absence makes `DatePipe` receive the literal key as a format pattern):**

| Key | en | pt |
|---|---|---|
| `Format-Date` | `MM/dd/yyyy` | `dd/MM/yyyy` |
| `Format-DateTime` | `MM/dd/yyyy hh:mm a` | `dd/MM/yyyy HH:mm` |
| `Grid-Loading` | `Loading...` | `Carregando...` |
| `Grid-Message-Empty` | `No results` | `Nenhum resultado` |
| `Grid-Message-Failed` | `Failed to load the data` | `Falha ao carregar os dados` |
| `Grid-Message-LazyLoad` | `Loading more records...` | `Carregando mais registros...` |
| `RibbonGroup-Entity` | `Entity` | `Entidade` |
| `RibbonGroup-General` | `General` | `Geral` |
| `Button-Views-Details` | `Details` | `Detalhes` |
| `Button-Views-History` | `History` | `Histórico` |
| `OperationsHistory-Modal-Title` | `Operation details` | `Detalhes da operação` |

**Showcase keys:**

| Key | en | pt |
|---|---|---|
| `Showcase-Region-Main` | `MAIN` | `PRINCIPAL` |
| `Showcase-Region-Administration` | `ADMINISTRATION` | `ADMINISTRAÇÃO` |
| `Showcase-Menus-Dashboard` | `Dashboard` | `Painel` |
| `Showcase-Menus-General` | `General` | `Geral` |
| `Showcase-Menus-Security` | `Security` | `Segurança` |
| `Showcase-Menus-Customers` | `Customers` | `Clientes` |
| `Showcase-Menus-Units` | `Units` | `Unidades` |
| `Showcase-Menus-Users` | `Users` | `Usuários` |
| `Showcase-Dashboard-Card-Users` | `Users` | `Usuários` |
| `Showcase-Dashboard-Card-Customers` | `Customers` | `Clientes` |
| `Showcase-Dashboard-Card-Units` | `Units` | `Unidades` |
| `Showcase-Dashboard-RecentActivity` | `Recent activity` | `Atividade recente` |
| `Showcase-Dashboard-Activity-1` | `Ada Lovelace updated customer Acme Industries` | `Ada Lovelace atualizou o cliente Acme Industries` |
| `Showcase-Dashboard-Activity-2` | `Alan Turing created unit BR-05 Downtown Branch` | `Alan Turing criou a unidade BR-05 Downtown Branch` |
| `Showcase-Dashboard-Activity-3` | `Grace Hopper deactivated user Edsger Dijkstra` | `Grace Hopper desativou o usuário Edsger Dijkstra` |
| `Showcase-Dashboard-Activity-4` | `Barbara Liskov exported the customers list` | `Barbara Liskov exportou a lista de clientes` |
| `Showcase-Users-Column-Name` | `Name` | `Nome` |
| `Showcase-Users-Column-Username` | `Username` | `Usuário` |
| `Showcase-Users-Column-Email` | `Email` | `E-mail` |
| `Showcase-Users-Field-Name` | `Name` | `Nome` |
| `Showcase-Users-Field-Username` | `Username` | `Usuário` |
| `Showcase-Users-Field-Email` | `Email` | `E-mail` |
| `Showcase-Users-Field-IsActive` | `Active` | `Ativo` |
| `Showcase-Users-Field-MustChangePassword` | `Must change password` | `Deve alterar a senha` |
| `Showcase-Users-Validations-Name-Required` | `Name is required` | `O nome é obrigatório` |
| `Showcase-Users-Validations-Username-Required` | `Username is required` | `O usuário é obrigatório` |
| `Showcase-Users-FormGroup-User` | `User` | `Usuário` |
| `Showcase-Users-Details-Title-New` | `New user` | `Novo usuário` |
| `Showcase-Customers-Column-Name` | `Name` | `Nome` |
| `Showcase-Customers-Column-City` | `City` | `Cidade` |
| `Showcase-Customers-Column-Email` | `Email` | `E-mail` |
| `Showcase-Customers-Column-IsActive` | `Active` | `Ativo` |
| `Showcase-Customers-Field-Name` | `Name` | `Nome` |
| `Showcase-Customers-Field-Email` | `Email` | `E-mail` |
| `Showcase-Customers-Field-Phone` | `Phone` | `Telefone` |
| `Showcase-Customers-Field-IsActive` | `Active` | `Ativo` |
| `Showcase-Customers-Field-City` | `City` | `Cidade` |
| `Showcase-Customers-Validations-Name-Required` | `Name is required` | `O nome é obrigatório` |
| `Showcase-Customers-FormGroup-Customer` | `Customer` | `Cliente` |
| `Showcase-Customers-FormGroup-Location` | `Location` | `Localização` |
| `Showcase-Customers-Details-Title-New` | `New customer` | `Novo cliente` |
| `Showcase-Units-Column-Code` | `Code` | `Código` |
| `Showcase-Units-Column-Name` | `Name` | `Nome` |
| `Showcase-Units-Column-Description` | `Description` | `Descrição` |
| `Showcase-EditSection-Details` | `Details` | `Detalhes` |
| `Showcase-EditSection-Address` | `Address` | `Endereço` |

Deliberately **not** in this table: the app name, company name, and notification titles/descriptions. Those four surfaces are rendered raw by `BrandComponent` and `NotificationsComponent`, so they stay plain text in Task 3 (see the note there). A consequence to expect during verification: switching to Portuguese will **not** change the brand block or the notification list — that is correct behaviour, not a missed key.

- [ ] **Step 2: Replace the showcase's literals with keys**

In `app-showcase.stories.ts`, swap every literal for its key from the table above:

- **Sidebar** (`ShowcaseSidebarService.loadMenus`): `label: 'Dashboard'` → `'Showcase-Menus-Dashboard'`, and likewise General / Security / Customers / Units / Users. `region: 'MAIN'` → `'Showcase-Region-Main'`, `region: 'ADMINISTRATION'` → `'Showcase-Region-Administration'`. Also update `getMenuFromUrl`'s returned label to `'Showcase-Menus-Dashboard'`.
- **Dashboard** (`DashboardComponent`): the three `cards` labels and the four `activity` strings become keys. The template's literal `Recent activity` heading becomes `{{ 'Showcase-Dashboard-RecentActivity' | translate }}`. Add `TranslatePipe` from `@ngx-translate/core` to the component's `imports` array, and pipe the card labels and activity entries too: `{{ card.label | translate }}`, `{{ entry | translate }}`.
- **Datasets**: every `headerName` becomes its `Showcase-*-Column-*` key.
- **Form components**: every `lib-form-input-group` `label` becomes its `Showcase-*-Field-*` key, and each `validations` value becomes its `Showcase-*-Validations-*` key. `lib-form-group` `label` becomes its `Showcase-*-FormGroup-*` key.
- **Accordions and ribbon groups need an explicit pipe** (they do NOT self-translate — verified fact #12):
  - `<lib-group-accordion label="Details">` → `<lib-group-accordion [label]="'Showcase-EditSection-Details' | translate">`
  - `<lib-group-accordion label="Address">` → `[label]="'Showcase-EditSection-Address' | translate"`
  - `<lib-ribbon-group label="Entity">` → `[label]="'RibbonGroup-Entity' | translate"`
  - `<lib-ribbon-group label="General">` → `[label]="'RibbonGroup-General' | translate"`
  - Every component containing these must import `TranslatePipe`.
- **Route data**: `defaultTitle: 'New user'` → `'Showcase-Users-Details-Title-New'`; `'New customer'` → `'Showcase-Customers-Details-Title-New'`; each child route's `title: 'Details'` → `'Button-Views-Details'`.
- **`ShowcaseRootComponent`'s seeded tab title**: `title: 'Dashboard'` → `'Showcase-Menus-Dashboard'` (`TabsComponent` pipes `tab.title` through `translate`, so a key is correct here).

- [ ] **Step 3: Type-check and lint**

```bash
npx tsc -p libs/shared/.storybook/tsconfig.json --noEmit
npx eslint libs/shared/src/lib/stories/showcase/app-showcase.stories.ts tools/storybook/storybook.providers.ts
```
Expected: `tsc` exit 0; eslint 0 errors (pre-existing `no-explicit-any` warnings in `storybook.providers.ts` are fine).

- [ ] **Step 4: Verify in the browser — English, then Portuguese**

With the story loaded in English, confirm no raw keys leak:
```js
(() => {
  const body = document.body.innerText;
  const leaked = (body.match(/(Showcase|RibbonGroup|Button-Views|Grid-Message|Format)-[A-Za-z0-9-]+/g) || []);
  return JSON.stringify({ leakedKeys: Array.from(new Set(leaked)) }, null, 2);
})()
```
Expected: `leakedKeys: []`.

Then switch language via the top bar's language selector to Portuguese and confirm the whole UI changes:
```js
(() => {
  const body = document.body.innerText;
  return JSON.stringify({
    sidebar: (document.querySelector('lib-sidebar')?.innerText || '').replace(/\s+/g, ' ').slice(0, 120),
    hasPainel: body.includes('Painel'),
    hasUsuarios: body.includes('Usuários'),
    stillEnglishDashboard: body.includes('Dashboard')
  }, null, 2);
})()
```
Expected: `hasPainel: true`, `hasUsuarios: true`, `stillEnglishDashboard: false`.

Expect the brand block (`ZLibraries Showcase` / `Zambon Dev`) and the notification list to stay in English — those components render their text raw by design, so that is correct, not a gap.

Also open a list and a detail in Portuguese and confirm grid headers (`Nome`, `Usuário`, `E-mail`) and field labels are translated.

- [ ] **Step 5: Commit**

```bash
git add tools/storybook/storybook.providers.ts libs/shared/src/lib/stories/showcase/app-showcase.stories.ts && git commit -m "feat(storybook): translate the app showcase (en + pt)"
```

---

## Task 5: Showcase — history / audit view

**Files:**
- Modify: `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts`

- [ ] **Step 1: Add imports**

Extend the existing `@zambon-dev/shared` import (added in Task 3) so it reads — all five symbols are re-exported from the root barrel, verified in `libs/shared/src/index.ts`:

```ts
import {
  AuthenticationService,
  INotification,
  IOperationsHistoryList,
  IServicesHistoryList,
  NotificationsService,
  OperationsHistoryService,
  ServicesHistoryService,
  ServicesHistoryViewComponent,
} from '@zambon-dev/shared';
```

Also add `IListParameters` to the existing `@zambon-dev/library` import — the mock `list()` signatures use it.

- [ ] **Step 2: Add the audit mock services**

Insert a new section directly **below** the `Mock backend — grid datasets, data providers and shared write helpers` block:

```ts
// ---------------------------------------------------------------------------
// Mock backend — audit history
// ---------------------------------------------------------------------------

// Rows carry BOTH `ID` and `id`. The models declare `ID`, but GridDataset.compareProperty
// defaults to 'id', so getRowID() reads the lowercase key — without it, selecting a service row
// never propagates and the operations grid stays empty. Emitting both keeps the declared model
// satisfied and the grid working; the underlying @shared mismatch is filed separately.
interface IShowcaseServiceHistoryRow extends IServicesHistoryList {
  id: number;
}

interface IShowcaseOperationHistoryRow extends IOperationsHistoryList {
  id: number;
}

function showcaseServiceHistory(controllerName: string): IShowcaseServiceHistoryRow[] {
  const entity: string = controllerName === 'Customers' ? 'Customer' : 'User';
  return [
    { ID: 1, id: 1, name: `${entity} created`, changedByName: 'Ada Lovelace', changedOn: SHOWCASE_AUDIT_DATES[0] },
    { ID: 2, id: 2, name: `${entity} updated`, changedByName: 'Grace Hopper', changedOn: SHOWCASE_AUDIT_DATES[1] },
    { ID: 3, id: 3, name: `${entity} deactivated`, changedByName: 'Alan Turing', changedOn: SHOWCASE_AUDIT_DATES[2] },
  ];
}

@Injectable()
class ShowcaseServicesHistoryService {
  public list(controllerName: string, _entityID: number, _parameters: IListParameters): Observable<IServicesHistoryList[]> {
    return of(showcaseServiceHistory(controllerName)).pipe(delay(SHOWCASE_LATENCY_MS));
  }
}

@Injectable()
class ShowcaseOperationsHistoryService {
  public list(_controllerName: string, _entityID: number, serviceHistoryID: number, _parameters: IListParameters): Observable<IOperationsHistoryList[]> {
    const rows: IShowcaseOperationHistoryRow[] = [
      {
        ID: 1, id: 1, entityName: 'Record', operationType: 'Modified',
        oldValues: JSON.stringify({ isActive: true, name: 'Globex Corporation' }, null, 2),
        newValues: JSON.stringify({ isActive: false, name: 'Globex Corporation Ltd' }, null, 2),
      },
      {
        ID: 2, id: 2, entityName: 'Contact', operationType: 'Added',
        oldValues: JSON.stringify({}, null, 2),
        newValues: JSON.stringify({ phone: '+1 514 555 0102' }, null, 2),
      },
    ];
    // Vary by selected service row so drilling into different entries shows different operations.
    return of(serviceHistoryID === 1 ? rows.slice(1) : rows).pipe(delay(SHOWCASE_LATENCY_MS));
  }
}
```

Add a fixed date seed next to the other seed data (fixed, not `new Date()`, so the story renders identically on every load):

```ts
const SHOWCASE_AUDIT_DATES: Date[] = [
  new Date('2026-07-20T14:05:00Z'),
  new Date('2026-07-24T09:30:00Z'),
  new Date('2026-07-28T16:45:00Z'),
];
```

- [ ] **Step 3: Provide the mocks**

Add to the `applicationConfig` providers array:

```ts
        { provide: OperationsHistoryService, useClass: ShowcaseOperationsHistoryService },
        { provide: ServicesHistoryService, useClass: ShowcaseServicesHistoryService },
```

`useClass` (not `useValue: new …`) matches `history.stories.ts` and lets Angular own construction, which is why the two mocks carry `@Injectable()`.

- [ ] **Step 4: Register the audit child routes**

In `showcaseRoutes`, add a second child to the Users `:id` route, after the existing `path: ''` child:

```ts
                  { path: 'audit', component: ServicesHistoryViewComponent,
                    data: { controllerName: 'Users', icon: 'fa-history', title: 'Button-Views-History' } },
```

And the same for the Customers `:id` route, with `controllerName: 'Customers'`:

```ts
                  { path: 'audit', component: ServicesHistoryViewComponent,
                    data: { controllerName: 'Customers', icon: 'fa-history', title: 'Button-Views-History' } },
```

`controllerName` must be in route `data` — `ServicesHistoryViewComponent` reads it from `route.snapshot.data`, not from a binding. Keep `audit` a single path segment.

- [ ] **Step 5: Type-check and lint**

```bash
npx tsc -p libs/shared/.storybook/tsconfig.json --noEmit
npx eslint libs/shared/src/lib/stories/showcase/app-showcase.stories.ts
```
Expected: `tsc` exit 0, eslint 0 errors.

- [ ] **Step 6: Verify in the browser**

Open a Users detail, then click the **Views** ribbon button and confirm it now offers two options (Details, History). Select History and check:

```js
(() => {
  const view = document.querySelector('shared-services-history-view');
  const grids = Array.from(document.querySelectorAll('shared-services-history-view lib-data-grid'));
  return JSON.stringify({
    href: location.href,
    viewPresent: !!view,
    gridCount: grids.length,
    text: (view?.innerText || 'ABSENT').replace(/\s+/g, ' ').slice(0, 300)
  }, null, 2);
})()
```
Expected: URL ends `/audit`, the view present, and audit rows listing `User created` / `User updated` / `User deactivated` with author names and **properly formatted dates** (not the literal string `Format-DateTime`).

Then click a service row and confirm the operations grid populates — this is the row-key fix:
```js
(() => {
  const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  const rows = Array.from(document.querySelectorAll('shared-services-history-view lib-data-grid-row'));
  click(rows[0].querySelector('div'));
  return JSON.stringify({ serviceRowCount: rows.length }, null, 2);
})()
```
Then re-query and confirm operation rows appeared. Also confirm the Customers audit view shows `Customer …` rows, proving `controllerName` is wired per entity.

- [ ] **Step 7: Commit**

```bash
git add libs/shared/src/lib/stories/showcase/app-showcase.stories.ts && git commit -m "feat(storybook): add a mocked audit history view to the app showcase"
```

---

## Task 6: Changelogs and final verification

**Files:**
- Modify: `libs/library/CHANGELOG.md`
- Modify: `libs/framework/CHANGELOG.md`
- Modify: `libs/shared/CHANGELOG.md`

- [ ] **Step 1: `@library` changelog**

Under `## [Unreleased]` → `### Fixed` (create the subsection if absent, matching the file's style):

```markdown
- **Form inputs no longer render a stray bordered box when `type` is set as a static attribute.**
  Angular keeps static attributes in the DOM even when a directive consumes them as an `@Input()`,
  so `<lib-form-input-group type="checkbox">` left a `type="checkbox"` attribute on the host — where
  `@tailwindcss/forms`' tag-agnostic `[type="checkbox"]` base rules styled the host itself as a
  checkbox (1px border, white fill, `height: 1rem`), drawing an empty-input box around the field and
  tinting its icon. `FormInputGroupComponent` and `FormInputComponent` now clear the attribute via a
  host binding. Affects every value of `type` (`checkbox`, `date`, `number`, `password`, …); both the
  attribute form (`type="checkbox"`) and the binding form (`[type]="'checkbox'"`) now render
  identically, so existing call sites are fixed with no changes.
```

Ensure `⚠ Breaking Changes / Migration` for `[Unreleased]` says `None`.

- [ ] **Step 2: `@framework` changelog**

Under `## [Unreleased]` → `### Fixed`:

```markdown
- **Routed list views now fill the available height automatically.** `DefaultTabViewComponent` gave its
  routed child no layout, and `lib-data-grid` has no `flex-grow`, so a grid collapsed to its
  `rowsToDisplay × rowHeight` minimum with empty space beneath it. Every consuming list component had to
  repeat the same `:host { flex; flex-grow; overflow: hidden }` + `lib-data-grid { flex-grow }` stylesheet
  to compensate. `TabViewList` now carries a `framework-view-list` host class — inherited by every
  subclass — which `DefaultTabViewComponent` styles, so **consumers can delete those per-component
  stylesheets**. Routed screens that do not extend `TabViewList` (forms, dashboards) are unaffected.
```

Ensure `⚠ Breaking Changes / Migration` says `None`.

- [ ] **Step 3: `@shared` changelog**

Under `## [Unreleased]` → `### Added`, extend the existing App Showcase entry (do not add a second one) with a sentence covering the new capabilities:

```markdown
  The story now also demonstrates a branded top bar (logo, app name, subtitle, environment badge,
  working notifications bell), a versioned sidebar footer, a mocked audit/history view reachable from
  the detail views' Views button, and full `en`/`pt` translation so the language selector switches the
  entire showcase.
```

- [ ] **Step 4: Full verification sweep**

```bash
npx nx build library && npx nx build framework && npx nx build shared
```
Expected: all three succeed.

```bash
grep -rl "showcase" dist/libs/shared || echo "NOT PRESENT (expected)"
```
Expected: `NOT PRESENT (expected)`.

```bash
npx nx test library 2>&1 | tail -n 6
npx nx test framework 2>&1 | tail -n 6
npx nx test shared 2>&1 | tail -n 6
```
Expected: exactly the documented baselines (library 1 failed suite; framework 5 failed suites / 3 failed tests; shared ~28 failed tests / 11 failed suites). **Any increase is a regression — stop and report it.**

```bash
npx nx lint shared --skip-nx-cache 2>&1 | tail -n 4
npx nx lint framework --skip-nx-cache 2>&1 | tail -n 4
npx nx lint library --skip-nx-cache 2>&1 | tail -n 4
```
Expected: shared 17 errors, framework 155, library 193 — no increases.

- [ ] **Step 5: Final browser walk**

One pass through the whole showcase confirming all five items together: branded top bar with `QA` badge and working bell; `v1.0.0` in the sidebar footer; all three grids full height; Dashboard not clipped; no bordered box on any checkbox row; language selector switching everything to Portuguese and back; Views → History loading audit rows with real dates and drill-down into operations.

- [ ] **Step 6: Commit**

```bash
git add libs/library/CHANGELOG.md libs/framework/CHANGELOG.md libs/shared/CHANGELOG.md && git commit -m "docs(changelog): record the form input type fix, list view height fix, and showcase additions"
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `type` attribute still present after Task 1 | Host binding does not clear statically-set attributes | Report BLOCKED with the probe output; the fallback is `:host` resets, a different change |
| Grids still ~256px | Marker class missing from the host, or `::ng-deep` omitted | Check `document.querySelector('.framework-view-list')`; `::ng-deep` is mandatory for routed hosts (fact #6) |
| Dashboard content clipped | The height rules reached a non-`TabViewList` screen | The selector must be `.framework-view-list`, never a bare child selector |
| Raw keys visible in the UI | Key missing from `storybookTranslations`, or the component doesn't self-translate | Add the key; for `lib-group-accordion` / `lib-ribbon-group` add an explicit `| translate` (fact #12) |
| Dates render as `Format-DateTime` | That key is missing | Add `Format-Date` / `Format-DateTime` (Task 4 Step 1) |
| Clicking a service row loads no operations | Rows lack a lowercase `id` | Emit both `ID` and `id` (fact #19) |
| Bell missing | Mock's `isEnabled` falsy, or `NotificationsService` not provided | Provide the mock with `isEnabled: true` |
| Sidebar footer empty | `AppConfig.version` empty | Pass `version: '1.0.0'` (no `v` prefix) |

## Out of scope

- Renaming `type` → `fieldType` as a future breaking change.
- The `IServicesHistoryList.ID` vs `compareProperty: 'id'` mismatch in `@shared` (worked around in the mock).
- Switching Storybook to `@framework`'s `FrameworkGridConfigsProvider`.
- Deleting Panthor's 17 now-redundant per-list stylesheets (different repo).
- The `NG0100` fix and the `@framework` eslint prefix — both in separate worktrees.
