# @framework Library

Core UI framework library providing tab-based navigation, CRUD view scaffolding, and reusable button components for Angular 19 applications. This library is generic and must not contain project-specific logic.

Path alias: `@framework` (mapped in `tsconfig.base.json`)

## Commands

```bash
npx nx build framework       # Build the library
npx nx lint framework         # Run ESLint
npx nx test framework         # Run Jest tests
```

## Architecture Overview

The framework follows a layered architecture:

```
┌─────────────────────────────────────────────────┐
│  TabsComponent (tab bar + breadcrumbs)          │
│  ┌────────────────────────────────────────────┐ │
│  │  DefaultTabViewComponent (list views)      │ │
│  │  DefaultDetailsTabViewComponent (forms)    │ │
│  │  ┌──────────────────────────────────────┐  │ │
│  │  │  Feature Components (app-specific)   │  │ │
│  │  │  extending FormView / TabViewList    │  │ │
│  │  └──────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

Feature components extend abstract base classes from `views/` and are rendered inside layout components from `components/views/`. Ribbon buttons from `components/buttons/` handle navigation and CRUD actions.

## Tab Navigation System

### Data Model

Each tab is a **stack of `ITab` entries** (`openTabs: ITab[][]`). The first entry is the root (list or detail), subsequent entries are navigation history (opened records, sub-views).

```typescript
interface ITab {
  clones: string[];          // Cloned URLs for component reuse
  entityBaseUrl?: string;    // Entity-level URL for duplicate detection
  isTitleLoading: boolean;   // Whether title is still resolving
  queryParams?: { ... };     // Query parameters
  title?: string;            // Display title
  url: string;               // Full route URL
}
```

### Entity-Level Matching

The `entityBaseUrl` enables **entity-level matching**: recognizing that `/entity/9`, `/entity/9/audit`, and `/entity/9/history` all belong to the same entity. This prevents duplicate tabs when the same record is open at different sub-views.

- Set by buttons (Open, New, Save) and TabsComponent when creating Tab entries for detail views.
- **Propagated to sub-views**: `replaceCurrentTabSubView` copies `entityBaseUrl` from the anchor entry to new sub-view entries. This ensures the top-of-stack always carries the entity identity.
- **Entity match checks the top-of-stack only**: `findTabIndexByEntityMatch` only looks at the current view (last entry) of each tab, not the full history. A record buried in another tab's history does NOT block opening it elsewhere.

### Title Resolution

When a new Tab entry is created for a URL that was already loaded in another tab's history, `TabService.inheritTitleIfKnown()` copies the resolved title. This avoids a loading spinner when the entity name is already known.

### Three Navigation Capabilities

The system provides three distinct navigation modes:

1. **To a new tab** — `openTab`: Creates a fresh tab with its own history stack.
2. **Current tab, other view** — `navigateCurrentTab`: Pushes a new entity or record onto the current tab's stack (e.g., list to detail).
3. **Current tab, internal view** — `replaceCurrentTabSubView`: Switches between sub-views within the same entity (e.g., Details to History). Does NOT create a new stack entry; it replaces the sub-view portion.

### Navigation Behaviors — Component Triggers

#### From Outside (menu item with URL)
- **Action**: Open a new tab and start a new Tab History
- **Exception**: If the URL (exact match) is already open — Focus that Tab
- **Method**: `openTab(tab)` — no `entityBaseUrl` set (list URLs use exact match only)

#### Button New
- **Action**: Redirect current tab and insert the 'new' entity into Tab History
- **Exception**: If the URL (ENTITY match) is already open — Focus that Tab
- **Method**: `navigateCurrentTab(tab)` with `entityBaseUrl` set to the `/new` URL

#### Button Open
- **Action**: Redirect current tab and insert entity name into Tab History (loading while tab name is not available)
- **Exception**: If the URL (ENTITY match) is already open — Focus that Tab (keeping current view)
- **Method**: `navigateCurrentTab(tab)` with `entityBaseUrl` set to the entity URL

#### Button Views (DEFAULT to Non-default view)
- **Example**: Selects History View
- **Action**: Redirect current tab and insert View name into Tab History
- **Method**: `replaceCurrentTabSubView(baseUrl, tab)` — adds sub-view entry after anchor

#### Button Views (Non-default to DEFAULT view)
- **Example**: Selects Details View
- **Action**: Redirect current tab back to the default view
- **Method**: `replaceCurrentTabSubView(baseUrl)` — removes sub-view entry, keeps anchor

#### Button Views (Non-default to Another non-default view)
- **Example**: While in History, selects Payments View
- **Action**: Redirect current tab and replace the last entry (History) with the view name in Tab History
- **Method**: `replaceCurrentTabSubView(baseUrl, tab)` — replaces existing sub-view with new one

#### Button Save (Save)
- **Action**: Saves the entity and updates the URL in-place (e.g., `/new` to `/:id`)
- **Method**: `redirectCurrentTab(url)` — also updates `entityBaseUrl` if it matched the old URL
- **Router sync**: If the Angular router URL differs from the saved entity URL (e.g., still at `/new`), syncs the router invisibly via `setRouteRedirect` + `navigateByUrl`. This ensures subsequent navigations (e.g., clicking New button) don't hit a stale router URL and become no-ops.

#### Button Save (Save And New)
- **Action**: Saves the entity, caches the saved entity component, then navigates to `/new`
- **Exception**: If the URL (ENTITY match) is already open — Focus that Tab
- **Router URL check**: Uses `currentRouteUrl !== savedEntityUrl` to decide the navigation path
- **When router URL differs** (e.g., still at `/new` after first save): Syncs the router invisibly via `setRouteRedirect` + `navigateByUrl` to `/:id` (component reused, no DOM swap because `shouldReuseRoute` returns true for the redirect), then calls `navigateToNew()` (real navigation, old `/:id` component detached and cached)
- **When router URL matches** (already at `/:id`): Direct `navigateToNew()` — the `/:id` component is cached by the reuse strategy
- **Method**: `redirectCurrentTab(url)` + `navigateCurrentTab(tab)` (via `navigateToNew()`)

#### Button Save (Save And Close)
- **Action**: Navigates back one step in Tab History. If it's the last entry, closes the tab.
- **Method**: `navigateBackOrCloseActiveTab()`

#### Tab Close Button
- **Action**: Closes the entire tab (all history entries)
- **Method**: `closeTab(index)`

### Navigation Behaviors — Direct URL Access

#### ListView URL
- **Action**: Open a new tab and start a new Tab History
- **Method**: `openTab(tab)` — no `entityBaseUrl` (exact match only)

#### Form View (DEFAULT view)
- **Action**: Open a new tab and insert entity name into Tab History (loading while tab name is not available)
- **Method**: `openTab(tab)` with `entityBaseUrl` set

#### Form View (Non-default view)
- **Action**: Open a new tab and insert entity name into Tab History (loading while tab name is not available), then insert the view name in Tab History
- **Method**: `openTab(tab)` with `entityBaseUrl`, then `replaceCurrentTabSubView(url, viewTab)` with view title from route `data['title']`

### Edge Cases

1. **Entity open at sub-view, same record opened from another tab**: Entity match finds the existing tab via `entityBaseUrl` on the top-of-stack sub-view entry (propagated from anchor). Focuses the tab at its current view — does NOT navigate back to default.

2. **Entity buried in another tab's history (navigated away to different entity)**: Entity match only checks top-of-stack. A record in history does NOT prevent opening it in the current tab. Example: Tab 1 has `[/contratacoes, /contratacoes/325, /cobrancas/13620]` — opening `/contratacoes/325` from Tab 2 will push to Tab 2, not focus Tab 1.

3. **Title already known from another tab's history**: `inheritTitleIfKnown()` copies the resolved title from any existing entry with the same URL, avoiding unnecessary loading spinners.

4. **Direct navigation to sub-view URL**: TabsComponent detects the non-default child route, reads the view title from route `data['title']`, and calls `replaceCurrentTabSubView` so the breadcrumb shows `[Entity name] > [View name]` instead of a loading spinner.

5. **Save changes URL from `/new` to `/:id`**: `redirectCurrentTab` updates both `url` and `entityBaseUrl` on the current entry, ensuring future entity matching uses the real ID.

6. **Direct navigation to inner view of a new entity** (e.g., `/entity/new/audit`): TabsComponent detects that the `:id` param is not a valid numeric ID (`Number("new")` → `NaN`) and redirects to the base URL (`/entity/new`) using `replaceUrl: true`. Inner views like Audit/History require a persisted entity, so they are not accessible for new entities. The redirect keeps the URL clean and prevents loading empty/broken inner views.

7. **Navigation to a non-existent entity** (e.g., `/entity/99` or `/entity/99/audit` where ID 99 doesn't exist): The backend returns a 404 (or other HTTP error). `DataProviderService.refreshModel()` catches the error, emits `null` to the model cache (stopping the loading spinner in FormView), and emits the `HttpErrorResponse` via `getError$()`. `DefaultDetailsTabViewComponent` subscribes to `getError$()` and shows an `ErrorModalComponent`. When the user closes the modal, navigation goes back past the invalid entity: if the tab has prior history before the entity (e.g., a list view), it navigates back to that entry; otherwise, the tab is closed entirely. This covers both direct URL access and inner view access (`/entity/99/audit`), since all entries sharing the same `entityBaseUrl` are skipped.

### TabService Methods Reference

| Method | Used By | Behavior |
|--------|---------|----------|
| `openTab(tab)` | TabsComponent, sidebar menu | Opens new tab or focuses existing (exact URL match, then entity match) |
| `navigateCurrentTab(tab)` | ButtonOpen, ButtonNew, ButtonSave | Pushes entry onto current tab's stack (checks entity match in other tabs first) |
| `navigateCurrentTabBack(tab)` | Breadcrumbs, internal | Pops stack back to the specified entry |
| `replaceCurrentTabSubView(baseUrl, tab?)` | ButtonViews, TabsComponent | Replaces sub-view entries after the anchor; propagates `entityBaseUrl` from anchor |
| `navigateBackOrCloseActiveTab()` | ButtonSave (Save & Close) | Goes back one step in history; closes tab if last entry |
| `redirectCurrentTab(url)` | ButtonSave (default save) | Updates current entry's URL and `entityBaseUrl` in-place |
| `activateTab(tab)` | Tab click | Switches focus to another tab |
| `closeTab(index)` | Tab close button | Closes entire tab and clears cached components |
| `closeActiveTab()` | AuthService (sign out) | Alias for `closeTab(activeTabIndex)` |
| `closeAllTabs()` | AuthService (sign out) | Clears all tabs and cached handles |
| `updateTabTitle(url, title)` | DefaultDetailsTabViewComponent | Updates title on all entries matching the URL |
| `inheritTitleIfKnown(tab)` | Internal (navigateCurrentTab, openTab) | Copies resolved title from existing entry with same URL |

### Component Caching (CustomReuseStrategy)

`CustomReuseStrategy` implements Angular's `RouteReuseStrategy` to cache component instances per URL. When switching tabs, components are detached/reattached rather than destroyed/recreated. Cache keys are `{url}-{componentName}`. Handles are cleared when a tab (or history entry) is closed and the URL is no longer open anywhere.

- **`redirects` map**: Temporary redirect entries (set via `setRouteRedirect`) that make `shouldReuseRoute` return true when the future URL matches a redirect target. This allows "invisible" router syncs (e.g., after save) that update the router URL without destroying/recreating the component. Entries are cleared after each navigation.
- **`retrieve` method**: After returning a cached handle, schedules `ApplicationRef.tick()` via `setTimeout` to ensure the entire app tree is checked. Without this, reattached components may render stale views because `NgTemplateOutlet` does not automatically re-create its embedded view on reattachment.

## View Base Classes (`views/`)

### Inheritance Hierarchy

```
ViewBase
├── TabViewBase
│   ├── TabViewList<TListModel>
│   │   └── ListView<TEntityModel, TListModel>
│   └── FormView<TEntityModel>
├── ChildList<TEntityModel>
└── ModalBase
    ├── ViewModal<TEntityModel>
    ├── MultiEditorModal<TEntityModel>
    └── MultiSelectModal
```

### ViewBase

Base for all views. Provides `destroy$` subject for RxJS teardown and `loading` state.

### TabViewBase (extends ViewBase)

Base for views rendered inside tabs. Captures a `#ribbon` template ref and pushes it to `TabViewService` on `ngAfterViewInit`, so the ribbon bar updates when switching between views.

### TabViewList\<TListModel\> (extends TabViewBase)

Base for **list views** (grids). Injects `DataGridDataset`, tracks row selection, and exposes `hasRowsSelected` and `selectedItem`.

### ListView\<TEntityModel, TListModel\> (extends TabViewList)

Extends `TabViewList` with `DataProviderService` integration. Binds `parentEntityId` from the data provider to the grid dataset. Used for list views that are child views of a detail (e.g., a list of invoices within a contract).

### FormView\<TEntityModel\> (extends TabViewBase)

Base for **form/detail views**. Injects `FormBuilder`, `FormService`, and `DataProviderService`. On init: calls the abstract `formSetup()` method, subscribes to the model observable, and auto-enters edit mode for new entities.

Subclasses must implement:
```typescript
protected abstract formSetup(): FormGroup;
```

### ChildList\<TEntityModel\> (extends ViewBase)

Base for **child list views** rendered inside a detail view (not as a tab). Injects `DataGridDataset`, `DataProviderService`, and `MultiSelectResultDataset`. Binds parent entity ID and auto-refreshes the grid when saved changes are emitted.

**Auto-refresh on parent entity update**: Subscribes to `DataProviderService.getModel$()` with `skip(1)` to automatically refresh the child list grid whenever the parent entity is saved/updated. The first emission (initial load) is skipped because the initial data load is already handled in `ngOnInit`. This means child list implementations do **not** need to manually subscribe to `getModel$()` for refresh-on-save — it is built into the base class.

### ModalBase (extends ViewBase)

Abstract base for modals. Requires implementing `toggle()`.

### ViewModal\<TEntityModel\> (extends ModalBase)

Base for **data-loading modals** with a form. On toggle: resets form, triggers entity load via a subject, patches form with loaded data. Subclasses implement `formSetup()` and `loadData(entityID)`.

### MultiEditorModal\<TEntityModel\> (extends ModalBase)

Base for **multi-editor modals** (inline grid editing). Integrates with `MultiEditorDataset` and `DataGridDataset`. Binds parent entity ID and propagates `savedChanges` events.

## Layout Components (`components/views/`)

### DefaultTabViewComponent

Wrapper for **list views**. Subscribes to `TabViewService` for ribbon template updates and view change events. Used in route config with `FrameworkViewType.List`.

**Ribbon template rendering strategy**: `updateRibbonTemplate` uses `detectChanges()` for real templates (from child views) to render buttons immediately without waiting for the next change detection cycle. For empty/fallback templates, it uses `markForCheck()` instead to defer rendering — this avoids briefly flashing an empty ribbon during component creation, since the child view will push the real template moments later in the same initialization cycle.

### DefaultDetailsTabViewComponent (extends DefaultTabViewComponent)

Wrapper for **detail/form views**. Provides `DataProviderService` via factory from route data. Subscribes to model changes and calls `tabService.updateTabTitle()` to update the tab title dynamically. Also subscribes to `DataProviderService.getError$()` and displays an `ErrorModalComponent` when the backend returns an error (e.g., 404 for invalid entity IDs). Used in route config with `FrameworkViewType.Details`.

Route configuration pattern:
```typescript
{
  path: ':id',
  component: DefaultDetailsTabViewComponent,
  data: {
    [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details,
    dataProvider: () => new EntityDataProvider(inject(EntityService)),
    defaultTitle: 'Entity-Details-Title-New',
  },
  children: [
    { path: '', component: EntityFormComponent, data: { icon: 'fa-edit', title: 'Button-Views-Details' } },
    { path: 'audit', component: ServicesHistoryViewComponent, data: { icon: 'fa-history', title: 'Button-Views-History' } },
  ],
}
```

### TabsComponent

Renders the tab bar, breadcrumbs, and `<router-outlet>`. On init, reads the activated route to determine if it's a List or Details view and calls `tabService.openTab()`. For direct navigation to non-default child routes (e.g., `/entity/9/audit`), adds the sub-view to history via `replaceCurrentTabSubView` with the view title from route data.

### TabBreadcrumbsComponent

Renders the current tab's history stack as clickable breadcrumbs. Clicking a breadcrumb calls `tabService.navigateCurrentTabBack()`.

## Button Components (`components/buttons/`)

All buttons extend `BaseButton` which provides access control (via `AuthService`), loading state animation, and `RibbonGroupChild` registration.

| Component | Selector | Purpose |
|-----------|----------|---------|
| `ButtonComponent` | `framework-button` | Generic customizable ribbon button |
| `ButtonConfirmComponent` | `framework-button-confirm` | Button with confirmation modal |
| `ButtonDeleteComponent` | `framework-button-delete` | Delete with confirmation; refreshes grid on success |
| `ButtonEditComponent` | `framework-button-edit` | Toggle form edit mode |
| `ButtonFiltersComponent` | `framework-button-filters` | Open filter modal for grid |
| `ButtonNewComponent` | `framework-button-new` | Navigate to `/new` entity URL |
| `ButtonOpenRecordComponent` | `framework-button-open-record` | Navigate to selected grid row's detail view |
| `ButtonRefreshComponent` | `framework-button-refresh` | Refresh grid data |
| `ButtonSaveComponent` | `framework-button-save` | Save with dropdown: Save, Save & Close, Save & New |
| `ButtonViewsComponent` | `framework-button-views` | View switcher (Details, History, etc.) |

### ButtonSaveComponent Details

Dropdown options use i18n keys: `Button-Save`, `Button-Save-And-Close`, `Button-Save-And-New`. See the [Button Save](#button-save-save) navigation behaviors above for details on each option's post-save navigation logic.

### ButtonViewsComponent Details

Dynamically builds dropdown options from the `detailsViewRoute` children (reads `title`, `icon`, `allowedActions` from route data). Switches between sub-views via `TabService.replaceCurrentTabSubView`.

**Disabled for new entities**: When `DataProviderService.hasEntityID` is `false` (i.e., the entity is being created with URL `/new`), the button is **disabled** — not hidden. This prevents navigation to views like History/Audit that require a persisted entity ID, while still signaling to the user that those views exist. The button becomes enabled automatically once the entity is saved and receives a real ID.

**Hidden when no accessible options**: The button is hidden (`*ngIf="hasOptions"`) when no visible/accessible view options exist (e.g., all views require actions the user doesn't have).

## Services

### TabService

Root-provided singleton managing all tab state. See [Tab Navigation System](#tab-navigation-system) above.

### TabViewService

Provided per `DefaultDetailsTabViewComponent` instance. Manages ribbon template updates (`onUpdateRibbonTemplate`) and active view tracking (`onViewChanged`).

### AuthService (abstract)

Abstract service for JWT authentication. Manages token storage (localStorage/sessionStorage), action-based authorization with caching, and sign-out. Consuming apps must extend this and implement `getActions()`.

### CustomReuseStrategy

Angular `RouteReuseStrategy` implementation. Caches detached component handles keyed by `{url}-{componentName}`. Coordinates with `TabService` to determine which URLs are open.

## Helpers

### RouteHelper

Static utility for Angular route tree traversal:
- `getRouteByData(snapshot, key, value)` — find route with matching data property
- `getRouteWithComponent(snapshot, component)` — find route with matching component
- `getRouteURL(route, rootLevel?)` — build full URL string from route snapshot

### BackendFormValidationHelper

Static utility that applies HTTP 400 validation errors to Angular `FormGroup` controls. Matches error field names case-insensitively to form control names.

## Models

### ITab / Tab

Tab data model. See [Data Model](#data-model) above.

### FrameworkViewType

Enum used in route `data` to identify view types:
- `FrameworkViewType.List` — list/grid view (no data provider)
- `FrameworkViewType.Details` — detail/form view (with data provider)

Constant `FRAMEWORK_VIEW_TYPE` is the route data key.

### ITabHistory

Interface for tab history entries with `title` and `url`.

## Configuration

### AppConfig / APP_CONFIG

Injection token for application base URL configuration. Provided in root with empty default. Apps override via `providers` array.

### FrameworkGridConfigsProvider

Provider for framework-specific data grid configuration (loading messages, empty state messages).

## Testing Patterns

Tests follow the **manual mocking pattern** using `Object.create()` for logic-heavy components with many dependencies. This avoids full TestBed setup and gives fine-grained control over injected services.

### Pattern: Logic Tests with Object.create()

Used for components like `ButtonViewsComponent`, `ButtonSaveComponent`, `CatalogSelectComponent`:

```typescript
component = Object.create(MyComponent.prototype);
component.destroy$ = new Subject();
// Set inputs, internal state, inject mock services via (component as any).serviceName = mock;
component.ngOnInit();
```

### Pattern: Service Tests with HttpTestingController

Used for services with HTTP calls (e.g., `CatalogService`):

```typescript
TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
service = TestBed.inject(MyService);
httpMock = TestBed.inject(HttpTestingController);
```

### Running Tests

```bash
npx nx test framework                    # All framework tests
npx nx test library                      # All library tests
npx jest --config libs/library/jest.config.ts --testPathPattern="my-component"  # Single test
```

## Error Handling

### Principles

All backend calls must handle errors — never assume success. There are three categories of HTTP errors to handle:

1. **Validation errors (400)**: The form has invalid data. Apply field-level validation errors to the form via `BackendFormValidationHelper` or `FormService.setValidationErrorsFromHttpResponse()`.
2. **Not found errors (404)**: The requested entity does not exist (deleted or invalid URL). Show a clear "record not found" message — NOT a generic server error. Use `Modal-NotFound-Title` / `Modal-NotFound-Message` i18n keys.
3. **Server errors (500, others)**: An unexpected error occurred. Show the generic error modal with the "contact administrator" subtitle. Use `Modal-Failed-Title` / `Modal-Failed-DefaultMessage` i18n keys.

### Data Loading (DataProviderService)

`DataProviderService.refreshModel()` catches HTTP errors from `loadModel()` and:
- Emits `null` to the model cache (stopping loading spinners in FormView and other consumers)
- Emits the `HttpErrorResponse` via `getError$()` for consumers to react

`DefaultDetailsTabViewComponent` subscribes to `getError$()` and shows the `ErrorModalComponent` with status-appropriate messages (404 = "record not found", others = generic server error). When the user closes the error modal, the component navigates back past the invalid entity in tab history or closes the tab if it was the first entry.

`DataProviderService.resetForNewEntity()` clears the entity ID, resets the model loaded state, and emits `null` to the model cache. Used for clearing form state when reusing a component for a new entity (e.g., after Save & New navigates back to a cached component that needs to start fresh).

### Actions (Buttons)

Button components (e.g., `ButtonSaveComponent`, `ButtonDeleteComponent`) handle errors in their subscribe callbacks:
- **400**: Apply validation errors to the form
- **Other**: Show `ErrorModalComponent` with the error message

### ErrorModalComponent

Reusable error modal with configurable `title`, `subtitle`, and `errorMessage` (all i18n keys). The `subtitle` defaults to `'Modal-Failed-Administrator'` but can be set to `''` to hide it (e.g., for 404 errors where contacting an administrator is not relevant). The `showModal(error)` method accepts either a string (i18n key) or an `HttpErrorResponse`. Emits a `closed` event (forwarded from `ModalComponent`) when the modal is dismissed (close button, click outside, or Escape key).

## Legacy Code

Files under `views/legacy/` and `components/buttons/legacy/` are deprecated. They use the old `ITabView` pattern with constructor-injected `TabService` and manual view switching. New features should use the current standalone component pattern with `inject()`.
