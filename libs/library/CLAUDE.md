# @library Library

Low-level UI component library providing form controls, data grids, modals, navigation components, and shared services for Angular 19 applications. This library is generic and must not contain project-specific logic.

Path alias: `@library` (mapped in `tsconfig.base.json`)

## Commands

```bash
npx nx build library        # Build the library
npx nx lint library          # Run ESLint
npx nx test library          # Run Jest tests
npx jest --config libs/library/jest.config.ts --testPathPattern="my-component"  # Single test
```

## Architecture Overview

The library provides foundational UI building blocks consumed by `@framework` and application code. It has no dependency on `@framework` or `@shared`.

```
@library (no dependencies on other custom libs)
├── Components     # Form inputs, grids, modals, ribbon, sidebar
├── Services       # FormService, CatalogService, SidebarService, DataProviderService
├── Datasets       # RxJS-based data sources for grids and editors
├── Models         # Interfaces and data classes
├── Directives     # ScrollSpy
├── Pipes          # EnumTranslate, Replace, ReplaceMany
├── Validators     # Date validators
└── Helpers        # Date, GUID, route formatting utilities
```

## Components

All components are standalone (Angular 19 pattern with `imports` array, no NgModule declarations).

### Form Components

| Component | Selector | Purpose |
|-----------|----------|---------|
| `FormGroupComponent` | `lib-form-group` | Groups form fields with optional label and expand/collapse |
| `FormInputComponent` | `lib-form-input` | Input field (text, number, date, textarea) integrated with reactive forms |
| `FormInputGroupComponent` | `lib-form-input-group` | Container for form inputs with validation styling |
| `CatalogSelectComponent` | `lib-catalog-select` | Searchable dropdown using CDK overlay; debounced search, keyboard navigation, ARIA-compliant |

### Data Display Components

| Component | Selector | Purpose |
|-----------|----------|---------|
| `DataGridComponent` | `lib-data-grid` | Virtual-scrolled table with lazy loading, multi-select, and ResizeObserver-based viewport recalculation |
| `DataGridRowComponent` | `lib-data-grid-row` | Individual row renderer for the data grid |

### Modal Components

| Component | Selector | Purpose |
|-----------|----------|---------|
| `ModalComponent` | `lib-modal` | Reusable dialog with configurable size, escape/outside-click handling |
| `MultiSelectComponent` | `lib-multi-select` | Modal with two grids (search + selected results) |
| `MultiEditorComponent` | `lib-multi-editor` | Modal for inline editing of collection items (add/remove/update tracking) |

### Layout Components

| Component | Selector | Purpose |
|-----------|----------|---------|
| `RibbonComponent` | `lib-ribbon` | Container for the ribbon toolbar pattern |
| `RibbonGroupComponent` | `lib-ribbon-group` | Groups buttons within the ribbon |
| `RibbonButtonComponent` | `lib-ribbon-button` | Individual ribbon button with optional dropdown options |
| `GroupAccordionComponent` | `lib-group-accordion` | Accordion wrapper for collapsible sections |
| `GroupContainerComponent` | `lib-group-container` | Generic container with icon and title |
| `GroupScrollSpyComponent` | `lib-group-scroll-spy` | Container with scroll-spy tracking |

### Navigation Components

| Component | Selector | Purpose |
|-----------|----------|---------|
| `SidebarComponent` | `lib-sidebar` | Responsive sidebar with collapsible menu and profile display |
| `SidebarItemComponent` | `lib-sidebar-item` | Individual menu item in the sidebar |

### BaseComponent

Abstract base class (`components/base.component.ts`) for all components. Provides `destroy$` Subject for RxJS teardown via `takeUntil(this.destroy$)` pattern.

### RibbonButtonComponent Details

Supports dropdown options via the `options` input. Key behaviors:
- **Default option**: When `defaultOption` index is set, clicking the main button emits the default option's ID and closes the dropdown
- **No default**: Clicking the main button toggles the dropdown visibility
- **Option click**: Closes dropdown and emits the option's ID
- **Dismiss**: Closes on outside click (mousedown+mouseup), Escape key, or body click outside the dropdown
- **Loading state**: Shows spinner animation, disables button
- **Status feedback**: Success/warning/failure icons with 1-second auto-reset


### DataGridComponent Details

Uses Angular CDK `CdkVirtualScrollViewport` for virtual scrolling with fixed row height (`configs.rowHeight`, default 41.6px). Key behaviors:
- **Virtual scroll**: CDK handles which rows to render based on viewport size and scroll position
- **Lazy loading**: Monitors `renderedRangeStream` to load more rows when user scrolls near the end
- **Container resize handling**: A `ResizeObserver` on the body element detects size changes (e.g., when a parent modal expands) and calls `viewport.checkViewportSize()` with 150ms debounce, running outside Angular zone to avoid unnecessary change detection
- **Scroll position preservation**: Saves/restores scroll position across route navigation
- **Header alignment**: Recalculates `headerRightMargin` to account for scrollbar width changes

## Services

### FormService

**Scope**: Component-provided (not root singleton)

Manages reactive form state: edit/view mode toggling, model binding, and backend validation error mapping.

| Method | Purpose |
|--------|---------|
| `initializeForm(form)` | Bind a FormGroup instance |
| `beginEdit()` / `cancelEdit()` | Toggle edit mode |
| `enableForm()` / `disableForm()` | Enable/disable form controls |
| `getModelFromForm()` | Extract current form data as model |
| `resetForm()` | Reset form to last model state |
| `markAllAsTouched()` | Mark all controls as touched (triggers validation display) |
| `setValidationErrorsFromHttpResponse(error)` | Apply HTTP 400 validation errors to form controls |
| `setFieldValue(fieldName, value)` | Update a specific field value |

**Events**: `modelRefreshed`, `fieldRefreshed` (EventEmitters), `editCanceled` (Observable)

### DataProviderService (Abstract)

**Scope**: Component-provided (via factory in route data)

Abstract base for entity CRUD operations with model caching via `ReplaySubject`.

| Method | Purpose |
|--------|---------|
| `getModel$()` | Observable of current entity (triggers load if not cached) |
| `refreshModel()` | Reload entity by ID from the server |
| `updateModel(model)` | Update cache and sync entity ID |
| `resetForNewEntity()` | Clear entity ID, reset loaded state, emit null (for Save & New form reset) |
| `saveModel(model)` | Abstract — POST/PUT to backend |
| `loadModel(entityID)` | Abstract — GET from backend |
| `getTitle(entity)` | Abstract — extract display title from entity |
| `getError$()` | Observable of HTTP errors from load operations |

**Constructor behavior**: Reads `:id` from `ActivatedRoute.paramMap` (once via `take(1)`), sets entity ID, and triggers model load via `queueMicrotask`.

### CatalogService

**Scope**: Provided in root

Handles catalog search endpoint calls. `search(endpoint, maxResults, criteria?, filters?)` POSTs to the endpoint and returns `Observable<ICatalogResult>`.

### SidebarService (Abstract)

**Scope**: Provided in root

Manages sidebar menu hierarchy with lazy-loaded children, selection state, and collapse/expand. Apps must extend and implement `getMenuFromUrl(url)` and `getUserProfile()`.

## Datasets

All datasets extend `BaseDataset` (abstract base with `destroy$` for cleanup).

| Dataset | Purpose |
|---------|---------|
| `DataGridDataset` | Manages grid data, columns, filters, virtual scroll loading, multi-selection |
| `GridDataset` | Older grid dataset variant |
| `MultiEditorDataset` | Tracks add/remove/update changes for multi-editor modals |
| `MultiSelectResultDataset` | Stores selected items from multi-select modals |

## Models

| Model | Purpose |
|-------|---------|
| `IGridColumn` | Grid column definition (field, headerName, size, template, customClass) |
| `IRibbonButtonOption` | Ribbon button dropdown option (id, label, icon, path, allowedActions, isAccessAllowed) |
| `RibbonGroupChild` | Base class for components that register as ribbon group children |
| `ICatalogEntry` / `ICatalogResult` | Catalog search result types |
| `IModal` | Modal contract (isShown, toggleModal, closeModal) |
| `IMultiEditorChanges` / `IMultiSelectorChanges` | Change tracking for multi-editor/multi-select |
| `IListParameters` | Query parameters for paginated list/summary endpoints |
| `DataGridConfigs` / `GridConfigs` | Grid rendering configuration (rowHeight, multiSelect, messages) |
| `SidebarMenu` / `SidebarProfile` / `SidebarConfigs` | Sidebar data types |

## Directives

| Directive | Selector | Purpose |
|-----------|----------|---------|
| `ScrollSpyDirective` | `[libScrollSpy]` | Tracks scroll position for scroll-spy effects on grouped content |

## Pipes

| Pipe | Purpose |
|------|---------|
| `EnumTranslatePipe` | Translates enum values to localized labels via i18n |
| `ReplacePipe` | String search/replace |
| `ReplaceManyPipe` | String with multiple search/replace patterns |

## Validators

| Validator | Purpose |
|-----------|---------|
| `DateValidators` | Custom validators for date fields (min, max, format) |

## Helpers

| Helper | Purpose |
|--------|---------|
| `DateHelpers` | Date manipulation, formatting, parsing utilities |
| `GuidHelper` | GUID/UUID generation and validation |
| `RouterFormatter` | URL/route string formatting utilities |

## Testing Patterns

Tests use either TestBed for component rendering or manual mocking with `Object.create()` for logic-heavy components.

```bash
npx nx test library                    # All library tests
npx jest --config libs/library/jest.config.ts --testPathPattern="data-provider"  # Single test
```
