# Storybook "App Showcase" — navigable, backend-mocked layout story

- **Date:** 2026-07-28
- **Status:** Approved (design) — pending implementation plan
- **Library affected:** `@shared` (story-only; `@library` / `@framework` shipped code untouched)
- **Branch:** `feat/sidebar-rework`

## 1. Context & goal

The `shared` Storybook already renders the full application shell (`shared-main-layout`
= sidebar + top-bar + tabs) in `libs/shared/src/lib/stories/layouts/layouts.stories.ts`,
with a mocked `SidebarService` that shows **Dashboard / General / Security** in the
navigation. However, clicking a nav entry opens a tab whose `<router-outlet>` is empty:
no routed content or backend data is wired in (the global Storybook config registers
`provideRouter([])` with an empty route table).

**Goal:** make the sidebar *navigable* in a new story so that clicking an entry renders a
realistic **list-view** or **detail-view** — "the full picture … just mocking the
backend." Reproduce the screens exactly the way the real Panthor app builds them, so the
story exercises real production code with only the backend faked.

## 2. Decisions (locked)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Fidelity** | Faithful — reuse the real framework hosts | Truest "full picture"; mocks only the backend; exercises tabs + ribbon + grid + form together |
| **Scope** | Broad showcase across the whole sidebar | Dashboard + General (Customers, Units) + Security (Users) |
| **Code structure** | Everything inline in **one** new `.stories.ts` file | `**/*.stories.ts` is already excluded from the library build, so mock code can never ship; no `tsconfig.lib.json` change needed |
| **Story title** | `Shared/App Showcase` (sibling to `Shared/Layouts`) | Keeps the existing minimal shell stories untouched |
| **Customers detail** | Included | A second, differently-shaped form; shows the form pattern generalizes |

## 3. How Panthor builds these screens (the pattern being mirrored)

- **List route** → host `DefaultTabViewComponent` + route data `{ [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List }`;
  child list component `extends TabViewList<TListModel>` and provides its own
  `DataGridDataset` subclass (`providers: [{ provide: DataGridDataset, useClass: XDataset }]`).
  The dataset declares `columns: IGridColumn[]` and implements
  `getData(params) → Observable<IListResult<T>>` (`{ items, totalRows }`). Template = a
  `#ribbon` template + a bare `<lib-data-grid>`. The grid itself calls `dataset.loadRows()`
  on init when `lazyLoadRows` is false.
- **Detail route** → host `DefaultDetailsTabViewComponent` + route data
  `{ [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details, dataProvider: () => new XDataProvider(), defaultTitle: '…' }`
  and a `:id` param; child form component `extends FormView<TEntityModel>`, provides its own
  `FormService`, and implements `formSetup(): FormGroup`. Template = a `#ribbon` template +
  `<lib-group-scroll-spy>` → `<lib-group-accordion>` → `<lib-form-group>` →
  `<lib-form-input-group>`. `FormView` auto-enters edit mode for a new (id-less) entity.
- **DataProviderService** subclass implements `getTitle(entity)`, `loadModel(id)`,
  `saveModel(model)`. Its base constructor reads `:id` from an injected `ActivatedRoute`;
  the `new XDataProvider()` runs inside the route factory's injection context, so this works.
- **Ribbon buttons** are the real `framework-button-*` components. They act against the
  injected `DataProviderService` / `FormService` / `TabService` and gate on `AuthService`
  (already globally mocked to "allow everything").

Reference files (real app): `apps/panthor/src/app/features/security/users/*`,
`.../datasets/security/users/users.dataset.ts`,
`.../data-providers/security/users.data-provider.ts`.

## 4. Menu → routes → rendered content

Mocked `SidebarService` serves this tree; menu `url`s match route `path`s exactly.

| Sidebar entry | Region | URL | Host + view type | Rendered child |
|---|---|---|---|---|
| Dashboard | `MAIN` | `/dashboard` | `DefaultTabViewComponent` · List | `DashboardComponent` (cards + recent-activity panel) |
| General ▸ Customers | `MAIN` | `/general/customers` | `DefaultTabViewComponent` · List | `CustomersListComponent` |
| ↳ open row / New | | `/general/customers/:id` | `DefaultDetailsTabViewComponent` · Details | `CustomersFormComponent` |
| General ▸ Units | `MAIN` | `/general/units` | `DefaultTabViewComponent` · List | `UnitsListComponent` (list only) |
| Security ▸ Users | `ADMINISTRATION` | `/security/users` | `DefaultTabViewComponent` · List | `UsersListComponent` |
| ↳ open row / New | | `/security/users/:id` | `DefaultDetailsTabViewComponent` · Details | `UsersFormComponent` |

Plus `{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }` so the story has an
initial view. Every routed leaf carries `FRAMEWORK_VIEW_TYPE` in its route data — required,
otherwise `TabsComponent.ngOnInit` redirects to `/`.

### Route table sketch

```ts
const showcaseRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'dashboard', component: DefaultTabViewComponent,
    data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
    children: [{ path: '', component: DashboardComponent }] },

  { path: 'general/customers', component: DefaultTabViewComponent,
    data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
    children: [{ path: '', component: CustomersListComponent }] },
  { path: 'general/customers/:id', component: DefaultDetailsTabViewComponent,
    data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details,
            dataProvider: () => new CustomersDataProvider(),
            defaultTitle: 'New customer' },
    children: [{ path: '', component: CustomersFormComponent,
                 data: { icon: 'fa-address-book', title: 'Details' } }] },

  { path: 'general/units', component: DefaultTabViewComponent,
    data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
    children: [{ path: '', component: UnitsListComponent }] },

  { path: 'security/users', component: DefaultTabViewComponent,
    data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
    children: [{ path: '', component: UsersListComponent }] },
  { path: 'security/users/:id', component: DefaultDetailsTabViewComponent,
    data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details,
            dataProvider: () => new UsersDataProvider(),
            defaultTitle: 'New user' },
    children: [{ path: '', component: UsersFormComponent,
                 data: { icon: 'fa-user', title: 'Details' } }] },
];
```

## 5. Screens & models

Grid column `field`s must match the list-model property names.

### Users (mirrors Panthor exactly)
- `IUsersList { id: number; name: string; username: string; email: string; isActive: boolean }`
- `IUsersDisplay { id: number; name: string; username: string; email: string; isActive: boolean; mustChangePassword: boolean }`
- List columns: name, username, email. Form fields: name (required), username (required),
  email, isActive (checkbox), mustChangePassword (checkbox).

### Customers
- `ICustomersList { id: number; name: string; city: string; email: string; isActive: boolean }`
- `ICustomersDisplay { id: number; name: string; email: string; phone: string; city: string; isActive: boolean }`
- List columns: name, city, email, isActive. Form fields: name (required), email, phone,
  city, isActive (checkbox).

### Units (list only)
- `IUnitsList { id: number; code: string; name: string; description: string }`
- List columns: code, name, description. No detail route → ribbon has no New/Open.

### Dashboard
- Plain standalone component (no `TabViewList`/`FormView`). KPI cards (e.g. total users,
  total customers, active units) + a small static "recent activity" panel. Visually distinct
  from the grid-based lists; no grid dataset required.

## 6. Ribbon composition per screen

Uses the real `framework-button-*` inside `lib-ribbon-group`. The host renders the ribbon
shell; the screen supplies a `#ribbon` template (captured by `TabViewBase`).

| Screen | Ribbon buttons |
|--------|----------------|
| Customers list, Users list | New, Open record, Delete (`[action]="onDelete()"`, `[disabled]="!hasRowsSelected"`), Refresh |
| Units list | Refresh |
| Customers form, Users form | New, Edit, Save |
| Dashboard | none (empty ribbon) |

`allowedActions` inputs may be omitted or set to a placeholder; the global `AuthService`
mock returns "allowed" for any action, so buttons render and act.

## 7. Mock "backend"

Pure in-memory — no HTTP, no interceptor.

- **Datasets** (`extends DataGridDataset`): `getData() → of<IListResult<T>>({ items: SEED, totalRows: SEED.length })`.
  Seed arrays of ~5–8 rows. `lazyLoadRows` stays false; default `recordBlockSize` (100) >
  row count, so all rows load and no lazy fetch fires. Enable single-row selection in the
  dataset ctor (e.g. `this.configs.selectOnClick = true`) so **Open record** has a target.
  `onDelete()` removes the selected row from the in-memory array and refreshes the grid.
- **Data providers** (`extends DataProviderService<T>`): `loadModel(id) → of(SEED_BY_ID[id] ?? SEED[0])`
  for an existing id, `of(null)` when there's no id (New); `saveModel(model) → of({ ...model, id: entityID ?? 999 })`;
  `getTitle(entity) → entity.name`.

### Representative sketches

```ts
@Injectable()
class UsersDataset extends DataGridDataset {
  public override columns: IGridColumn[] = [
    { field: 'name',     headerName: 'Name' },
    { field: 'username', headerName: 'Username' },
    { field: 'email',    headerName: 'Email' },
  ];
  constructor() { super(); this.configs.selectOnClick = true; }
  public getData(): Observable<IListResult<IUsersList>> {
    return of({ items: USERS_SEED, totalRows: USERS_SEED.length });
  }
}

@Injectable()
class UsersDataProvider extends DataProviderService<IUsersDisplay> {
  public getTitle(e: IUsersDisplay): string { return e?.name ?? ''; }
  protected loadModel(id?: number): Observable<IUsersDisplay | null> {
    return of(id ? (USERS_BY_ID[id] ?? USERS_DISPLAY_SEED[0]) : null);
  }
  public saveModel(model: IUsersDisplay): Observable<IUsersDisplay> {
    return of({ ...model, id: this.entityID ?? 999 });
  }
}

@Component({
  selector: 'showcase-users-list',
  standalone: true,
  imports: [DataGridComponent, RibbonGroupComponent, ButtonNewComponent,
            ButtonOpenRecordComponent, ButtonDeleteComponent, ButtonRefreshComponent],
  providers: [{ provide: DataGridDataset, useClass: UsersDataset }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group label="Entity">
        <framework-button-new></framework-button-new>
        <framework-button-open-record></framework-button-open-record>
        <framework-button-delete [action]="onDelete()" [disabled]="!hasRowsSelected"></framework-button-delete>
        <framework-button-refresh [disabled]="loading"></framework-button-refresh>
      </lib-ribbon-group>
    </ng-template>
    <lib-data-grid></lib-data-grid>`,
})
class UsersListComponent extends TabViewList<IUsersList> {
  public onDelete(): Observable<unknown> { /* remove selected from seed, refresh */ return of(null); }
}
```

(Form component mirrors Panthor's `UsersFormComponent`: `providers: [{ provide: FormService }]`,
`formSetup()` builds the `FormGroup`, template = `#ribbon` + `lib-group-scroll-spy` →
`lib-group-accordion` → `lib-form-group` → `lib-form-input-group`.)

## 8. Story providers

The story renders `<shared-main-layout>` (as `Shared/Layouts` does) and adds, in its
`applicationConfig` / `moduleMetadata.providers`:

- `provideRouter(showcaseRoutes)` — composes with the global empty `provideRouter([])`
  (Angular `ROUTES` is a multi-provider token).
- `TabService`
- `{ provide: RouteReuseStrategy, useClass: CustomReuseStrategy }`
- `{ provide: SidebarService, useClass: ShowcaseSidebarService }` — the mocked menu +
  `getUserProfile()` + `getMenuFromUrl()`.

Already supplied globally (in `tools/storybook/storybook.providers.ts`), so **not** repeated:
`provideAnimations`, `provideHttpClient`, translations, `APP_CONFIG`,
`GridConfigsProvider`/`DataGridConfigsProvider`, root `FormService`, root `DataGridDataset`
mock, root `DataProviderService` mock, `AuthService`/`AuthenticationService` mocks. Per-screen
`DataGridDataset` (component providers) and per-route `DataProviderService` (host factory)
override the root mocks where needed.

The framework host components and the screen components are standalone and referenced from
the route table, so the router loads them — no need to list them in the story `imports`.

## 9. File layout

One new file, everything inline:

```
libs/shared/src/lib/stories/showcase/app-showcase.stories.ts
```

Contains: `ShowcaseSidebarService`, `showcaseRoutes`, seed data + model interfaces, the
datasets and data providers, the six screen components (Dashboard, Customers list/form,
Units list, Users list/form), the CSF3 `meta` (`title: 'Shared/App Showcase'`), and one story exported as
`NavigableApp` rendering `<shared-main-layout>` in a fixed-height wrapper
(reusing the `FIT_TO_CONTAINER` technique from `layouts.stories.ts`).

`libs/shared/src/lib/stories/layouts/layouts.stories.ts` is left unchanged.

## 10. Build hygiene & changelog

- **No `tsconfig.lib.json` change** — `**/*.stories.ts` is already excluded from
  `nx build shared`, so the inline mock code never ships in `@zambon-dev/shared`.
- **Changelog:** add an `Added` entry to `libs/shared/CHANGELOG.md` under `[Unreleased]`
  describing the new navigable showcase story, with "⚠ Breaking Changes / Migration: None".
  No `@library` / `@framework` changelog entries — their shipped code is untouched.

## 11. Risks / to verify during implementation

1. `DataProviderService` base constructor argument list — confirm `new XDataProvider()` with
   no args compiles (base uses `inject()` internally for `ActivatedRoute`).
2. Row selection — confirm which `DataGridConfigs` flag (`selectOnClick` vs `multiSelect`)
   populates `selectedRowKeys`/`selectedItem` so **Open record** navigates to `…/:id`.
3. `framework-button-new` target — confirm it resolves the current list route to `…/:id`
   (i.e. navigates to `/security/users/new`).
4. `framework-button-*` with no `allowedActions` — confirm they render (else pass a
   placeholder action string that the mock `AuthService` allows).
5. New-entity flow — `Number('new') = NaN` → `hasEntityID` false → `loadModel` returns
   `of(null)` → form enters edit mode. Confirm the save→redirect path (`/new` → `/:id`)
   doesn't error against the in-memory provider.
6. Dashboard route uses the List host with a plain child that pushes no `#ribbon` — confirm
   the empty-ribbon fallback renders cleanly.

## 12. Out of scope (v1) — easy follow-ups

- Export and Filter ribbon buttons (need `dataset.export` + a `FiltersBase` component).
- Many-to-many child-list sub-grids in a detail (the Panthor "Roles" rich-detail pattern).
- A Roles slice; additional General entities.

## 13. Verification plan

- `nx build shared` stays green; `nx lint shared` introduces no new errors (baseline per
  project memory).
- Run the Storybook dev server, open `Shared/App Showcase`, and click through: Dashboard →
  General ▸ Customers (list) → open a row (detail) → New (empty edit form) → Save; General ▸
  Units (list); Security ▸ Users (list → detail). Capture one or two screenshots to confirm
  content renders inside the layout.
```
