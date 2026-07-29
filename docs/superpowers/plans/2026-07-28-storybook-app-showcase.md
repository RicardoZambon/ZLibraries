# Storybook App Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single self-contained Storybook story to `@shared` where clicking the sidebar entries (Dashboard, General ▸ Customers/Units, Security ▸ Users) opens tabs that render realistic list-views and detail-views through the real framework hosts, with only the backend mocked in-memory.

**Architecture:** One new file, `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts`, contains everything: a mocked `SidebarService`, a nested route table, six standalone screen components, and in-memory `DataGridDataset` / `DataProviderService` subclasses. The story renders `<shared-main-layout>` and registers its routes through `applicationConfig`, so the `<router-outlet>` inside `<framework-tabs>` renders the routed screens. List screens extend the real `TabViewList` and detail screens extend the real `FormView`; the real `framework-button-*` ribbon buttons drive New/Open/Delete/Refresh/Edit/Save.

**Tech Stack:** Angular 19 (standalone components, reactive forms), Storybook 8 (`@storybook/angular`, CSF3), RxJS, Nx, `@zambon-dev/framework`, `@zambon-dev/library`, `@zambon-dev/shared`.

---

## Verified API facts (do not re-derive)

These were confirmed by reading source. Trust them.

1. **`DataProviderService` constructor takes no arguments** — it uses `inject(ActivatedRoute)` internally and reads `:id` from `paramMap`. `new UsersDataProvider()` is correct, and it must be constructed inside the route `data.dataProvider` factory (an injection context).
2. **Routes must be nested, one path segment per route.** `RouteHelper.getRouteURL()` collects `route.url` segments walking up parents and then reverses the flat list, so a multi-segment path like `'general/customers'` yields `/customers/general` (wrong). Use `{ path: 'general', children: [{ path: 'customers', children: [...] }] }`.
3. **Row selection needs no config.** Default `DataGridConfigs.multiSelect` is `false`; a row click calls `setFocusedRow(key)` which, when `multiSelect` is false, calls `selectRow(key)`. `getRowID(key)` returns `row.id` (`compareProperty` is `'id'`).
4. **`allowedActions` can be omitted.** `BaseButton.checkAccessIsAllowed()` sets `isAccessLoaded = true; visible = true` when `allowedActions.length === 0`. `lib-ribbon-group` hides itself unless a child is `visible`, so omitting actions is required for the group to show.
5. **`ButtonSaveComponent` reads `model.id` from the saved model** to build the post-save URL. `FormService.getModelFromForm()` returns `form.getRawValue()`, which has **no `id`** (no `id` control). Therefore mock `saveModel` **must** return an object that includes `id`.
6. **`/new` works naturally.** `Number('new')` is `NaN`, so `hasEntityID` is `false` and `loadModel(NaN)` receives a falsy id → return `of(null)` → `FormView` calls `beginEdit()`.
7. **`SIDEBAR_CONFIGS` has a root factory default** — do not provide it.
8. **`override` usage** (repo has `noImplicitOverride: true`): use `override` when replacing a *concrete* member (`columns`, `configs`), and **omit** it when implementing an *abstract* member (`getData`, `getTitle`, `saveModel`, `loadModel`). This matches `tools/storybook/storybook.providers.ts`. If `tsc` disagrees on any member, follow the compiler.
9. **`lib-form-input-group` injects `FormGroupDirective` (non-optional)** — it must be inside `<form ngNoForm [formGroup]="dataForm">`, and the component must import `ReactiveFormsModule`.
10. **Unresolved i18n keys echo themselves.** The global `StorybookTranslateLoader` returns `{}` for unknown keys, so plain English strings like `'Name'` render as `Name`. Use plain strings, not i18n keys.
11. **Do not override `ngOnInit`** in list/form screens — `TabViewList.ngOnInit` and `FormView.ngOnInit` do required setup. If you must, call `super.ngOnInit()` first.

## File Structure

| File | Responsibility |
|------|----------------|
| Create: `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts` | Everything: seed data, models, datasets, data providers, 6 screen components, sidebar service, route table, CSF3 meta + story. |
| Modify: `libs/shared/CHANGELOG.md` | Record the new story under `[Unreleased]`. |

No other file changes. `**/*.stories.ts` is already excluded from `libs/shared/tsconfig.lib.json`, so nothing here ships in the published package — **do not** edit `tsconfig.lib.json`.

## Commands used throughout

Fast type-check (this config is the only one that *includes* story files):

```bash
npx tsc -p libs/shared/.storybook/tsconfig.json --noEmit
```

Run Storybook for `shared` (serves on port **4402**):

```bash
npx nx storybook shared
```

Note: plain `tsc` does not type-check Angular inline templates. Template errors surface when Storybook compiles. The browser click-through is the real verification for this feature.

---

## Task 1: Story skeleton — sidebar, routes, Dashboard

Gets the navigable shell working end-to-end with one screen, proving the routing/tab wiring before adding grids and forms.

**Files:**
- Create: `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts`

- [ ] **Step 1: Create the file with seed data, sidebar service, Dashboard, routes, and story**

Create `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts` with exactly this content:

```ts
import { Component } from '@angular/core';
import { ROUTES, RouteReuseStrategy, Routes } from '@angular/router';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import {
  CustomReuseStrategy,
  DefaultTabViewComponent,
  FRAMEWORK_VIEW_TYPE,
  FrameworkViewType,
  TabService,
} from '@zambon-dev/framework';
import { ISidebarProfile, SidebarMenu, SidebarService } from '@zambon-dev/library';
import { Observable, of } from 'rxjs';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';

// ---------------------------------------------------------------------------
// Mock backend — in-memory seed data
// ---------------------------------------------------------------------------

interface IUsersList {
  email: string;
  id: number;
  isActive: boolean;
  name: string;
  username: string;
}

const USERS: IUsersList[] = [
  { id: 1, name: 'Ada Lovelace', username: 'ada.lovelace', email: 'ada@example.com', isActive: true },
  { id: 2, name: 'Alan Turing', username: 'alan.turing', email: 'alan@example.com', isActive: true },
  { id: 3, name: 'Grace Hopper', username: 'grace.hopper', email: 'grace@example.com', isActive: true },
  { id: 4, name: 'Edsger Dijkstra', username: 'edsger.dijkstra', email: 'edsger@example.com', isActive: false },
  { id: 5, name: 'Barbara Liskov', username: 'barbara.liskov', email: 'barbara@example.com', isActive: true },
];

interface ICustomersList {
  city: string;
  email: string;
  id: number;
  isActive: boolean;
  name: string;
}

const CUSTOMERS: ICustomersList[] = [
  { id: 1, name: 'Acme Industries', city: 'Toronto', email: 'contact@acme.com', isActive: true },
  { id: 2, name: 'Globex Corporation', city: 'Montreal', email: 'hello@globex.com', isActive: true },
  { id: 3, name: 'Initech Systems', city: 'Vancouver', email: 'info@initech.com', isActive: false },
  { id: 4, name: 'Umbrella Health', city: 'Calgary', email: 'care@umbrella.com', isActive: true },
  { id: 5, name: 'Stark Manufacturing', city: 'Ottawa', email: 'sales@stark.com', isActive: true },
];

interface IUnitsList {
  code: string;
  description: string;
  id: number;
  name: string;
}

const UNITS: IUnitsList[] = [
  { id: 1, code: 'HQ-01', name: 'Head Office', description: 'Main administrative building' },
  { id: 2, code: 'WH-02', name: 'West Warehouse', description: 'Storage and logistics' },
  { id: 3, code: 'PL-03', name: 'Assembly Plant', description: 'Primary production line' },
  { id: 4, code: 'LB-04', name: 'Research Lab', description: 'Product development' },
  { id: 5, code: 'BR-05', name: 'Downtown Branch', description: 'Client-facing office' },
];

// ---------------------------------------------------------------------------
// Sidebar — the navigable menu tree. Menu `url`s must match the route paths.
// ---------------------------------------------------------------------------

const MENU_DASHBOARD: number = 1;
const MENU_GENERAL: number = 2;
const MENU_SECURITY: number = 3;

class ShowcaseSidebarService extends SidebarService {
  public getMenuFromUrl(url: string): Observable<SidebarMenu> {
    return of(new SidebarMenu({ id: MENU_DASHBOARD, label: 'Dashboard', icon: 'fa-chart-line', url }));
  }

  public getUserProfile(): ISidebarProfile {
    return {
      name: 'Ada Lovelace',
      title: 'System Administrator',
    };
  }

  protected loadMenus(parentMenu: SidebarMenu | null): Observable<SidebarMenu[]> {
    if (parentMenu?.id === MENU_GENERAL) {
      return of([
        new SidebarMenu({ id: 21, label: 'Customers', icon: 'fa-address-book', url: '/general/customers', parent: parentMenu }),
        new SidebarMenu({ id: 22, label: 'Units', icon: 'fa-building', url: '/general/units', parent: parentMenu }),
      ]);
    }

    if (parentMenu?.id === MENU_SECURITY) {
      return of([
        new SidebarMenu({ id: 31, label: 'Users', icon: 'fa-user', url: '/security/users', parent: parentMenu }),
      ]);
    }

    return of([
      new SidebarMenu({ id: MENU_DASHBOARD, label: 'Dashboard', icon: 'fa-chart-line', url: '/dashboard', region: 'MAIN' }),
      new SidebarMenu({ id: MENU_GENERAL, label: 'General', icon: 'fa-layer-group', childCount: 2, region: 'MAIN' }),
      new SidebarMenu({ id: MENU_SECURITY, label: 'Security', icon: 'fa-shield-halved', childCount: 1, region: 'ADMINISTRATION' }),
    ]);
  }
}

// ---------------------------------------------------------------------------
// Dashboard screen — a plain component (no grid, no form)
// ---------------------------------------------------------------------------

interface IDashboardCard {
  icon: string;
  label: string;
  value: string;
}

@Component({
  selector: 'showcase-dashboard',
  imports: [],
  template: `
    <div class="p-6 flex flex-col gap-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        @for (card of cards; track card.label) {
          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-center gap-3">
              <i class="fa-solid {{ card.icon }} text-xl text-slate-400"></i>
              <div>
                <div class="text-2xl font-semibold text-slate-800">{{ card.value }}</div>
                <div class="text-xs uppercase tracking-wide text-slate-500">{{ card.label }}</div>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          Recent activity
        </div>
        <ul class="divide-y divide-slate-100">
          @for (entry of activity; track entry) {
            <li class="px-4 py-2 text-sm text-slate-600">{{ entry }}</li>
          }
        </ul>
      </div>
    </div>
  `,
})
class DashboardComponent {
  protected activity: string[] = [
    'Ada Lovelace updated customer Acme Industries',
    'Alan Turing created unit BR-05 Downtown Branch',
    'Grace Hopper deactivated user Edsger Dijkstra',
    'Barbara Liskov exported the customers list',
  ];

  protected cards: IDashboardCard[] = [
    { label: 'Users', value: `${USERS.length}`, icon: 'fa-user' },
    { label: 'Customers', value: `${CUSTOMERS.length}`, icon: 'fa-address-book' },
    { label: 'Units', value: `${UNITS.length}`, icon: 'fa-building' },
  ];
}

// ---------------------------------------------------------------------------
// Routes — MUST be nested one segment per route (see verified fact #2)
// ---------------------------------------------------------------------------

const showcaseRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DefaultTabViewComponent,
    data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
    children: [
      { path: '', component: DashboardComponent },
    ],
  },
  // Storybook bootstraps the app at /iframe.html, which matches none of the routes above.
  // This catch-all lands the story on the dashboard instead of relying on TabsComponent's
  // fallback redirect. Keep it LAST — Angular matches routes in order.
  { path: '**', redirectTo: 'dashboard' },
];

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

// Story-only: constrain the layout to its container (the app uses full-viewport sizing,
// which forces a scrollbar inside the Storybook canvas).
const FIT_TO_CONTAINER: string = `
  <style>
    ::ng-deep shared-main-layout { display: block; height: 100%; max-height: 100%; }
    ::ng-deep shared-main-layout .main-container { max-height: 100% !important; }
  </style>
`;

const meta: Meta<MainLayoutComponent> = {
  component: MainLayoutComponent,
  decorators: [
    applicationConfig({
      providers: [
        // Adds the showcase routes to the router configured globally in
        // tools/storybook/storybook.providers.ts (which registers an empty route table).
        { provide: ROUTES, multi: true, useValue: showcaseRoutes },
        TabService,
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
        { provide: SidebarService, useClass: ShowcaseSidebarService },
      ],
    }),
  ],
  title: 'Shared/App Showcase',
};
export default meta;

export const NavigableApp: StoryObj<MainLayoutComponent> = {
  render: () => ({
    template: `
      ${FIT_TO_CONTAINER}
      <div class="h-[40rem] bg-slate-100">
        <shared-main-layout></shared-main-layout>
      </div>
    `,
  }),
};
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -p libs/shared/.storybook/tsconfig.json --noEmit`
Expected: no output (success). If it reports an unused import, remove that import.

- [ ] **Step 3: Verify in the browser**

Run: `npx nx storybook shared`
Open `http://localhost:4402` and select **Shared → App Showcase → NavigableApp**.

Expected:
- The sidebar shows a `MAIN` region with **Dashboard** and **General**, and an `ADMINISTRATION` region with **Security**.
- A tab is open and the Dashboard renders three KPI cards (Users 5, Customers 5, Units 5) and a "Recent activity" list.
- The browser console has no errors.

If the outlet is empty, confirm the URL redirected to `/dashboard` and that the dashboard route carries `FRAMEWORK_VIEW_TYPE` (without it, `TabsComponent` redirects to `/`).

- [ ] **Step 4: Commit**

```bash
git add libs/shared/src/lib/stories/showcase/app-showcase.stories.ts && git commit -m "feat(storybook): add navigable app showcase story with dashboard"
```

---

## Task 2: Users list-view

Adds the first grid screen: a real `TabViewList` with an in-memory dataset and a New/Open/Delete/Refresh ribbon.

**Files:**
- Modify: `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts`

- [ ] **Step 1: Add imports**

In the import block, add these three statements (keep existing imports):

```ts
import { defer } from 'rxjs';
```

Extend the `@zambon-dev/framework` import to add the buttons and the list base class:

```ts
import {
  ButtonDeleteComponent,
  ButtonNewComponent,
  ButtonOpenRecordComponent,
  ButtonRefreshComponent,
  CustomReuseStrategy,
  DefaultTabViewComponent,
  FRAMEWORK_VIEW_TYPE,
  FrameworkViewType,
  TabService,
  TabViewList,
} from '@zambon-dev/framework';
```

Extend the `@zambon-dev/library` import to add the grid pieces:

```ts
import {
  DataGridComponent,
  DataGridDataset,
  IGridColumn,
  IListResult,
  ISidebarProfile,
  RibbonGroupComponent,
  SidebarMenu,
  SidebarService,
} from '@zambon-dev/library';
```

- [ ] **Step 2: Add a shared dataset base and the Users dataset**

Insert directly **above** the `// Dashboard screen` comment block:

```ts
// ---------------------------------------------------------------------------
// Mock backend — grid datasets
// ---------------------------------------------------------------------------

// Serves rows straight from an in-memory array. Rows are copied on every read so the
// grid's internal `_key` bookkeeping never leaks back into the seed arrays.
abstract class ShowcaseDataset<TListModel> extends DataGridDataset {
  public getData(): Observable<IListResult<TListModel>> {
    const items: TListModel[] = this.rows();
    return of({
      items: items.map((row: TListModel) => ({ ...row })),
      totalRows: items.length,
    });
  }

  protected abstract rows(): TListModel[];
}

// Removes a row from an in-memory array. Deferred so the mutation happens when the
// delete button subscribes, not when the template evaluates `[action]="onDelete()"`.
function deleteById<TListModel extends { id: number }>(rows: TListModel[], id: number): Observable<unknown> {
  return defer(() => {
    const index: number = rows.findIndex((row: TListModel) => row.id === id);
    if (index >= 0) {
      rows.splice(index, 1);
    }
    return of(null);
  });
}

class UsersDataset extends ShowcaseDataset<IUsersList> {
  public override columns: IGridColumn[] = [
    { field: 'name', headerName: 'Name' },
    { field: 'username', headerName: 'Username' },
    { field: 'email', headerName: 'Email' },
  ];

  protected rows(): IUsersList[] {
    return USERS;
  }
}
```

- [ ] **Step 3: Add the Users list component**

Insert directly **below** the `DashboardComponent` class:

```ts
// ---------------------------------------------------------------------------
// Users — list view
// ---------------------------------------------------------------------------

@Component({
  selector: 'showcase-users-list',
  imports: [
    ButtonDeleteComponent,
    ButtonNewComponent,
    ButtonOpenRecordComponent,
    ButtonRefreshComponent,
    DataGridComponent,
    RibbonGroupComponent,
  ],
  providers: [{ provide: DataGridDataset, useClass: UsersDataset }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group label="Entity">
        <framework-button-new></framework-button-new>
        <framework-button-open-record></framework-button-open-record>
        <framework-button-delete [action]="onDelete()" [disabled]="!hasRowsSelected"></framework-button-delete>
      </lib-ribbon-group>
      <lib-ribbon-group label="General">
        <framework-button-refresh></framework-button-refresh>
      </lib-ribbon-group>
    </ng-template>

    <lib-data-grid></lib-data-grid>
  `,
})
class UsersListComponent extends TabViewList<IUsersList> {
  protected onDelete(): Observable<unknown> {
    return deleteById(USERS, this.selectedItem?.id ?? -1);
  }
}
```

- [ ] **Step 4: Register the Users list route**

In `showcaseRoutes`, add this entry after the `dashboard` entry:

```ts
  {
    path: 'security',
    children: [
      {
        path: 'users',
        children: [
          {
            path: '',
            component: DefaultTabViewComponent,
            data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
            children: [
              { path: '', component: UsersListComponent },
            ],
          },
        ],
      },
    ],
  },
```

- [ ] **Step 5: Type-check**

Run: `npx tsc -p libs/shared/.storybook/tsconfig.json --noEmit`
Expected: no output (success).

- [ ] **Step 6: Verify in the browser**

With `npx nx storybook shared` running, reload the story and click **Security → Users**.

Expected:
- A second tab opens titled "Users" and a grid renders with columns **Name / Username / Email** and 5 rows starting with Ada Lovelace.
- The ribbon shows an "Entity" group (New, Open record, Delete) and a "General" group (Refresh). Delete starts disabled.
- Clicking a row highlights it and **enables Delete**.
- Clicking **Refresh** reloads the grid (rows reappear, selection clears).
- Clicking **Delete** opens a confirmation modal; confirming removes the row from the grid.

- [ ] **Step 7: Commit**

```bash
git add libs/shared/src/lib/stories/showcase/app-showcase.stories.ts && git commit -m "feat(storybook): add users list view to app showcase"
```

---

## Task 3: Users detail-view

Adds the first form screen: a real `FormView` bound to a mocked `DataProviderService`, reachable via **Open record** and **New**.

**Files:**
- Modify: `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts`

- [ ] **Step 1: Add imports**

Add Angular forms imports:

```ts
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
```

Extend the `@zambon-dev/framework` import with the detail host, form base, and edit/save buttons — the full list becomes:

```ts
import {
  ButtonDeleteComponent,
  ButtonEditComponent,
  ButtonNewComponent,
  ButtonOpenRecordComponent,
  ButtonRefreshComponent,
  ButtonSaveComponent,
  CustomReuseStrategy,
  DefaultDetailsTabViewComponent,
  DefaultTabViewComponent,
  FRAMEWORK_VIEW_TYPE,
  FormView,
  FrameworkViewType,
  TabService,
  TabViewList,
} from '@zambon-dev/framework';
```

Extend the `@zambon-dev/library` import with the form pieces and the data provider — the full list becomes:

```ts
import {
  DataGridComponent,
  DataGridDataset,
  DataProviderService,
  FormGroupComponent,
  FormInputGroupComponent,
  FormService,
  GroupAccordionComponent,
  GroupScrollSpyComponent,
  IGridColumn,
  IListResult,
  ISidebarProfile,
  RibbonGroupComponent,
  SidebarMenu,
  SidebarService,
} from '@zambon-dev/library';
```

- [ ] **Step 2: Add the Users detail model and seed lookup**

Insert directly **below** the `USERS` array:

```ts
interface IUsersDisplay extends IUsersList {
  mustChangePassword: boolean;
}

function findUser(id: number): IUsersDisplay | null {
  const user: IUsersList | undefined = USERS.find((row: IUsersList) => row.id === id);
  return user ? { ...user, mustChangePassword: false } : null;
}
```

- [ ] **Step 3: Add the Users data provider**

Insert directly **below** the `UsersDataset` class:

```ts
class UsersDataProvider extends DataProviderService<IUsersDisplay> {
  public getTitle(entity: IUsersDisplay): string {
    return entity?.name ?? '';
  }

  public saveModel(model: IUsersDisplay): Observable<IUsersDisplay> {
    // ButtonSaveComponent builds the post-save URL from `model.id`, and the form's raw
    // value has no `id` — so it must be supplied here.
    return of({ ...model, id: this.entityID ?? USERS.length + 1 });
  }

  protected loadModel(entityID?: number): Observable<IUsersDisplay | null> {
    return of(entityID ? findUser(entityID) : null);
  }
}
```

- [ ] **Step 4: Add the Users form component**

Insert directly **below** the `UsersListComponent` class:

```ts
// ---------------------------------------------------------------------------
// Users — detail view
// ---------------------------------------------------------------------------

@Component({
  selector: 'showcase-users-form',
  imports: [
    ButtonEditComponent,
    ButtonNewComponent,
    ButtonSaveComponent,
    FormGroupComponent,
    FormInputGroupComponent,
    GroupAccordionComponent,
    GroupScrollSpyComponent,
    ReactiveFormsModule,
    RibbonGroupComponent,
  ],
  providers: [{ provide: FormService }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group label="Entity">
        <framework-button-new></framework-button-new>
        <framework-button-edit></framework-button-edit>
        <framework-button-save></framework-button-save>
      </lib-ribbon-group>
    </ng-template>

    <lib-group-scroll-spy>
      <form ngNoForm [formGroup]="dataForm">
        <lib-group-accordion label="Details">
          <lib-form-group label="User">
            <lib-form-input-group
              controlName="name"
              label="Name"
              [maxLength]="200"
              [validations]="{ 'required': 'Name is required' }">
            </lib-form-input-group>
            <lib-form-input-group
              controlName="username"
              label="Username"
              [maxLength]="100"
              [validations]="{ 'required': 'Username is required' }">
            </lib-form-input-group>
            <lib-form-input-group controlName="email" label="Email" [maxLength]="200">
            </lib-form-input-group>
            <lib-form-input-group controlName="isActive" label="Active" type="checkbox">
            </lib-form-input-group>
            <lib-form-input-group controlName="mustChangePassword" label="Must change password" type="checkbox">
            </lib-form-input-group>
          </lib-form-group>
        </lib-group-accordion>
      </form>
    </lib-group-scroll-spy>
  `,
})
class UsersFormComponent extends FormView<IUsersDisplay> {
  protected formSetup(): FormGroup {
    return this.formBuilder.group({
      email: [null],
      isActive: [true, { nonNullable: true }],
      mustChangePassword: [false, { nonNullable: true }],
      name: [null, Validators.required],
      username: [null, Validators.required],
    });
  }
}
```

- [ ] **Step 5: Register the Users detail route**

In `showcaseRoutes`, inside the `path: 'users'` `children` array, add this entry **after** the existing `path: ''` entry:

```ts
          {
            path: ':id',
            component: DefaultDetailsTabViewComponent,
            data: {
              [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details,
              dataProvider: () => new UsersDataProvider(),
              defaultTitle: 'New user',
            },
            children: [
              { path: '', component: UsersFormComponent, data: { icon: 'fa-user', title: 'Details' } },
            ],
          },
```

- [ ] **Step 6: Type-check**

Run: `npx tsc -p libs/shared/.storybook/tsconfig.json --noEmit`
Expected: no output (success).

- [ ] **Step 7: Verify in the browser**

With `npx nx storybook shared` running, reload the story and click **Security → Users**.

Expected:
- Select the "Grace Hopper" row, click **Open record** → the tab navigates to the detail view, the breadcrumb/tab title becomes "Grace Hopper", and the form shows Name/Username/Email/Active/Must change password populated and **read-only**.
- Click **Edit** → fields become editable and a Cancel button appears. Click **Cancel** → fields revert to read-only.
- Click **Edit**, change the Name, then click **Save** → the button shows a success state and the fields return to read-only.
- Click **New** → navigates to `/security/users/new`, the title shows "New user", and the form is **empty and already editable**.
- With **New** open, clear Name and click **Save** → the button shows a warning state (validation blocks the save) and the Name field shows "Name is required".
- No console errors during any of the above.

- [ ] **Step 8: Commit**

```bash
git add libs/shared/src/lib/stories/showcase/app-showcase.stories.ts && git commit -m "feat(storybook): add users detail view to app showcase"
```

---

## Task 4: Customers list-view and detail-view

A second, differently-shaped slice under General, proving the pattern generalizes.

**Files:**
- Modify: `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts`

- [ ] **Step 1: Add the Customers detail model and seed lookup**

Insert directly **below** the `CUSTOMERS` array:

```ts
interface ICustomersDisplay extends ICustomersList {
  phone: string;
}

const CUSTOMER_PHONES: { [id: number]: string } = {
  1: '+1 416 555 0101',
  2: '+1 514 555 0102',
  3: '+1 604 555 0103',
  4: '+1 403 555 0104',
  5: '+1 613 555 0105',
};

function findCustomer(id: number): ICustomersDisplay | null {
  const customer: ICustomersList | undefined = CUSTOMERS.find((row: ICustomersList) => row.id === id);
  return customer ? { ...customer, phone: CUSTOMER_PHONES[id] ?? '' } : null;
}
```

- [ ] **Step 2: Add the Customers dataset and data provider**

Insert directly **below** the `UsersDataProvider` class:

```ts
class CustomersDataset extends ShowcaseDataset<ICustomersList> {
  public override columns: IGridColumn[] = [
    { field: 'name', headerName: 'Name' },
    { field: 'city', headerName: 'City' },
    { field: 'email', headerName: 'Email' },
    { field: 'isActive', headerName: 'Active', size: '6rem' },
  ];

  protected rows(): ICustomersList[] {
    return CUSTOMERS;
  }
}

class CustomersDataProvider extends DataProviderService<ICustomersDisplay> {
  public getTitle(entity: ICustomersDisplay): string {
    return entity?.name ?? '';
  }

  public saveModel(model: ICustomersDisplay): Observable<ICustomersDisplay> {
    return of({ ...model, id: this.entityID ?? CUSTOMERS.length + 1 });
  }

  protected loadModel(entityID?: number): Observable<ICustomersDisplay | null> {
    return of(entityID ? findCustomer(entityID) : null);
  }
}
```

- [ ] **Step 3: Add the Customers list and form components**

Insert directly **below** the `UsersFormComponent` class:

```ts
// ---------------------------------------------------------------------------
// Customers — list and detail views
// ---------------------------------------------------------------------------

@Component({
  selector: 'showcase-customers-list',
  imports: [
    ButtonDeleteComponent,
    ButtonNewComponent,
    ButtonOpenRecordComponent,
    ButtonRefreshComponent,
    DataGridComponent,
    RibbonGroupComponent,
  ],
  providers: [{ provide: DataGridDataset, useClass: CustomersDataset }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group label="Entity">
        <framework-button-new></framework-button-new>
        <framework-button-open-record></framework-button-open-record>
        <framework-button-delete [action]="onDelete()" [disabled]="!hasRowsSelected"></framework-button-delete>
      </lib-ribbon-group>
      <lib-ribbon-group label="General">
        <framework-button-refresh></framework-button-refresh>
      </lib-ribbon-group>
    </ng-template>

    <lib-data-grid></lib-data-grid>
  `,
})
class CustomersListComponent extends TabViewList<ICustomersList> {
  protected onDelete(): Observable<unknown> {
    return deleteById(CUSTOMERS, this.selectedItem?.id ?? -1);
  }
}

@Component({
  selector: 'showcase-customers-form',
  imports: [
    ButtonEditComponent,
    ButtonNewComponent,
    ButtonSaveComponent,
    FormGroupComponent,
    FormInputGroupComponent,
    GroupAccordionComponent,
    GroupScrollSpyComponent,
    ReactiveFormsModule,
    RibbonGroupComponent,
  ],
  providers: [{ provide: FormService }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group label="Entity">
        <framework-button-new></framework-button-new>
        <framework-button-edit></framework-button-edit>
        <framework-button-save></framework-button-save>
      </lib-ribbon-group>
    </ng-template>

    <lib-group-scroll-spy>
      <form ngNoForm [formGroup]="dataForm">
        <lib-group-accordion label="Details">
          <lib-form-group label="Customer">
            <lib-form-input-group
              controlName="name"
              label="Name"
              [maxLength]="200"
              [validations]="{ 'required': 'Name is required' }">
            </lib-form-input-group>
            <lib-form-input-group controlName="email" label="Email" [maxLength]="200">
            </lib-form-input-group>
            <lib-form-input-group controlName="phone" label="Phone" [maxLength]="40">
            </lib-form-input-group>
            <lib-form-input-group controlName="isActive" label="Active" type="checkbox">
            </lib-form-input-group>
          </lib-form-group>
        </lib-group-accordion>

        <lib-group-accordion label="Address">
          <lib-form-group label="Location">
            <lib-form-input-group controlName="city" label="City" [maxLength]="100">
            </lib-form-input-group>
          </lib-form-group>
        </lib-group-accordion>
      </form>
    </lib-group-scroll-spy>
  `,
})
class CustomersFormComponent extends FormView<ICustomersDisplay> {
  protected formSetup(): FormGroup {
    return this.formBuilder.group({
      city: [null],
      email: [null],
      isActive: [true, { nonNullable: true }],
      name: [null, Validators.required],
      phone: [null],
    });
  }
}
```

- [ ] **Step 4: Register the Customers routes**

In `showcaseRoutes`, add this entry **between** the `dashboard` entry and the `security` entry:

```ts
  {
    path: 'general',
    children: [
      {
        path: 'customers',
        children: [
          {
            path: '',
            component: DefaultTabViewComponent,
            data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
            children: [
              { path: '', component: CustomersListComponent },
            ],
          },
          {
            path: ':id',
            component: DefaultDetailsTabViewComponent,
            data: {
              [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details,
              dataProvider: () => new CustomersDataProvider(),
              defaultTitle: 'New customer',
            },
            children: [
              { path: '', component: CustomersFormComponent, data: { icon: 'fa-address-book', title: 'Details' } },
            ],
          },
        ],
      },
    ],
  },
```

- [ ] **Step 5: Type-check**

Run: `npx tsc -p libs/shared/.storybook/tsconfig.json --noEmit`
Expected: no output (success).

- [ ] **Step 6: Verify in the browser**

With `npx nx storybook shared` running, reload the story and click **General** to expand it, then **Customers**.

Expected:
- A grid renders with columns **Name / City / Email / Active** and 5 rows starting with Acme Industries.
- Select "Globex Corporation" and click **Open record** → the detail view opens titled "Globex Corporation" with **two** accordion sections ("Details" and "Address"), and the scroll-spy shows both section titles. Phone shows `+1 514 555 0102`.
- **Edit** / **Save** / **New** behave as they did for Users.

- [ ] **Step 7: Commit**

```bash
git add libs/shared/src/lib/stories/showcase/app-showcase.stories.ts && git commit -m "feat(storybook): add customers list and detail views to app showcase"
```

---

## Task 5: Units list-view (list only)

A list with no detail route, so its ribbon deliberately omits New and Open record (no dead links).

**Files:**
- Modify: `libs/shared/src/lib/stories/showcase/app-showcase.stories.ts`

- [ ] **Step 1: Add the Units dataset**

Insert directly **below** the `CustomersDataProvider` class:

```ts
class UnitsDataset extends ShowcaseDataset<IUnitsList> {
  public override columns: IGridColumn[] = [
    { field: 'code', headerName: 'Code', size: '8rem' },
    { field: 'name', headerName: 'Name' },
    { field: 'description', headerName: 'Description' },
  ];

  protected rows(): IUnitsList[] {
    return UNITS;
  }
}
```

- [ ] **Step 2: Add the Units list component**

Insert directly **below** the `CustomersFormComponent` class:

```ts
// ---------------------------------------------------------------------------
// Units — list view only (no detail route, so no New/Open record buttons)
// ---------------------------------------------------------------------------

@Component({
  selector: 'showcase-units-list',
  imports: [
    ButtonRefreshComponent,
    DataGridComponent,
    RibbonGroupComponent,
  ],
  providers: [{ provide: DataGridDataset, useClass: UnitsDataset }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group label="General">
        <framework-button-refresh></framework-button-refresh>
      </lib-ribbon-group>
    </ng-template>

    <lib-data-grid></lib-data-grid>
  `,
})
class UnitsListComponent extends TabViewList<IUnitsList> {
}
```

- [ ] **Step 3: Register the Units route**

In `showcaseRoutes`, inside the `path: 'general'` `children` array, add this entry **after** the `path: 'customers'` entry:

```ts
      {
        path: 'units',
        children: [
          {
            path: '',
            component: DefaultTabViewComponent,
            data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
            children: [
              { path: '', component: UnitsListComponent },
            ],
          },
        ],
      },
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -p libs/shared/.storybook/tsconfig.json --noEmit`
Expected: no output (success).

- [ ] **Step 5: Verify in the browser**

With `npx nx storybook shared` running, reload the story and click **General → Units**.

Expected:
- A grid renders with columns **Code / Name / Description** (Code is a narrow fixed column) and 5 rows starting with HQ-01.
- The ribbon shows only a "General" group with **Refresh** — no New, Open record, or Delete.

- [ ] **Step 6: Commit**

```bash
git add libs/shared/src/lib/stories/showcase/app-showcase.stories.ts && git commit -m "feat(storybook): add units list view to app showcase"
```

---

## Task 6: Changelog and full verification

**Files:**
- Modify: `libs/shared/CHANGELOG.md`

- [ ] **Step 1: Read the changelog to find the `[Unreleased]` section**

Read `libs/shared/CHANGELOG.md` and locate `## [Unreleased]` and its `### Added` subsection (create `### Added` if it is absent).

- [ ] **Step 2: Add the changelog entry**

Under `## [Unreleased]` → `### Added`, add:

```markdown
- **Storybook: `Shared/App Showcase` story** — a navigable demo of the full application shell.
  Clicking the sidebar entries (Dashboard, General ▸ Customers/Units, Security ▸ Users) opens
  tabs that render working list-views and detail-views through the real framework hosts
  (`DefaultTabViewComponent` / `DefaultDetailsTabViewComponent`, `TabViewList` / `FormView`, and
  the `framework-button-*` ribbon buttons), backed by in-memory mock data. Story-only: it lives
  entirely in `app-showcase.stories.ts` and is excluded from the published package.
```

Ensure the `## [Unreleased]` section's `⚠ Breaking Changes / Migration` subsection says `None` (leave an existing `None` as-is; if the subsection is missing, add it with `None`).

- [ ] **Step 3: Confirm no story code ships in the package**

Run: `npx nx build shared`
Expected: build succeeds.

Then confirm the showcase is absent from the build output:

```bash
grep -rl "showcase" dist/libs/shared || echo "NOT PRESENT (expected)"
```

Expected: `NOT PRESENT (expected)`.

- [ ] **Step 4: Confirm lint introduces no new errors**

Run: `npx nx lint shared`
Expected: passes, or the same pre-existing failures as `main`. If new errors point at the story file, fix them. To compare against the baseline, run `git stash && npx nx lint shared; git stash pop`.

- [ ] **Step 5: Full click-through**

Run: `npx nx storybook shared` and walk the whole story once:

1. Dashboard renders cards + recent activity.
2. General ▸ Customers → grid → select a row → Open record → detail populated → Edit → Save → New → empty editable form.
3. General ▸ Units → grid with Refresh only.
4. Security ▸ Users → grid → Open record → detail → Edit → Save.
5. Multiple tabs are open across the walk; switching between them preserves each screen.
6. No console errors.

- [ ] **Step 6: Commit**

```bash
git add libs/shared/CHANGELOG.md && git commit -m "docs(changelog): record the navigable app showcase story (@shared)"
```

---

## Troubleshooting

Likely snags and their fixes, so the implementer does not have to re-derive them.

| Symptom | Cause | Fix |
|---------|-------|-----|
| Console: `Cannot match any routes. URL Segment: 'iframe.html'` | Wildcard route missing or not last | Keep `{ path: '**', redirectTo: 'dashboard' }` as the final entry in `showcaseRoutes`. |
| Outlet empty; URL jumps to `/` | Route missing `FRAMEWORK_VIEW_TYPE` in `data` | `TabsComponent.ngOnInit` redirects to `/` when neither List nor Details is found. Add the key. |
| Post-save URL looks like `//3` or `/customers/general/3` | A route path has more than one segment | Split into nested single-segment routes (verified fact #2). |
| Save throws on `model.id` | Mock `saveModel` returned no `id` | Return `{ ...model, id: ... }` (verified fact #5). |
| Ribbon group invisible | No visible children | Ensure buttons are present and `allowedActions` is omitted (verified fact #4). |
| `lib-form-input-group` injection error | Not inside a `[formGroup]` | Wrap in `<form ngNoForm [formGroup]="dataForm">` and import `ReactiveFormsModule` (verified fact #9). |
| Delete removes a row on mere render | Mutation ran when `onDelete()` was called | Keep the mutation inside `defer(...)` (`deleteById` already does). |
| `tsc` complains about `override` | Repo has `noImplicitOverride: true` | Add/remove `override` as the compiler asks (verified fact #8). |
| Top bar looks odd / notification errors | `NotificationsService` is not mocked in this story | Matches the existing `Shared/Layouts → MainLayout` story. Only mock it if it actually breaks; the `TopBar` story in `layouts.stories.ts` shows the provider shape to copy. |

## Out of scope

Do not add these; they were explicitly deferred:
- Export and Filter ribbon buttons.
- Many-to-many child-list sub-grids inside a detail view.
- A Roles slice or further General entities.
- Any change to `libs/shared/tsconfig.lib.json`, the existing `layouts.stories.ts`, or shipped `@library` / `@framework` code.
