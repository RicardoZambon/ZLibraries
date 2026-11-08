---
title: Action buttons
summary: Ready-made ribbon buttons for new, open, edit, save, delete, confirm, refresh, filter, export and views.
entryPoint: framework
api:
  [
    ButtonNewComponent,
    ButtonOpenRecordComponent,
    ButtonEditComponent,
    ButtonSaveComponent,
    ButtonDeleteComponent,
    ButtonConfirmComponent,
    ButtonRefreshComponent,
    ButtonFiltersComponent,
    ButtonExportComponent,
    ButtonViewsComponent,
    BaseButton,
  ]
storybook: framework-buttons--ribbon-actions
---

The framework ships the ribbon buttons that list and record screens need. Each one is a
`lib-ribbon-button` that already knows its job. It finds what it acts on through injection: the
grid's dataset, the record's data provider, the form service and the tab services. You place it in
a `lib-ribbon-group` and bind little or nothing.

<!-- example: framework-buttons-ribbon -->

## Usage

Import the buttons you need from `@zambon-dev/ui/framework` and put them in a ribbon group:

```ts
import { ButtonNewComponent, ButtonRefreshComponent } from '@zambon-dev/ui/framework';
import { RibbonGroupComponent } from '@zambon-dev/ui/library';
```

```html
<lib-ribbon-group label="Records">
  <framework-button-new></framework-button-new>
  <framework-button-refresh></framework-button-refresh>
</lib-ribbon-group>
```

In a framework view, put the group in the view's `<ng-template #ribbon>`. The shell shows it above
the view. See [The ribbon](../guides/building-views.md#the-ribbon).

### What each button acts on

| Button                         | What it does                                                                     | What it needs                                     |
| ------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------- |
| `framework-button-new`         | Opens the new-record page in the current tab.                                    | The router. A data provider is optional.          |
| `framework-button-open-record` | Opens the record selected in the grid. Enabled when exactly one row is selected. | `DataGridDataset`, the router.                    |
| `framework-button-edit`        | Puts the form in edit mode, then turns into a Cancel button.                     | `DataProviderService`, `FormService`.             |
| `framework-button-save`        | Validates and saves the form. Its menu adds Save and close, and Save and new.    | `DataProviderService`, `FormService`, the router. |
| `framework-button-delete`      | Asks for confirmation, runs `action`, then refreshes the grid.                   | `DataGridDataset`.                                |
| `framework-button-confirm`     | The same flow as delete, with your own label, icon and message.                  | `DataGridDataset`.                                |
| `framework-button-refresh`     | Reloads the grid and spins until the load ends.                                  | `DataGridDataset`, optional.                      |
| `framework-button-filters`     | Opens your filter fields in a modal and applies them to the grid.                | `DataGridDataset`, a parent `[formGroup]`.        |
| `framework-button-export`      | Downloads the grid, with its filters, as Excel, PDF, CSV, XML or MHTML.          | `DataGridDataset`, optional.                      |
| `framework-button-views`       | Switches between the views of a details page.                                    | `TabViewService`, the router.                     |

Every button also needs `AuthService`, to check permissions. The application shell provides it. See
[The full application shell](../guides/getting-started.md#the-full-application-shell).

`framework-button` is a plain ribbon button with the same permission check. Give it a `label`, an
`icon` and handle its `(action)` output.

### Permissions

Set `allowedActions` to hide a button from users who lack the right. One allowed action is enough.
While the check is running, the button shows but stays disabled. An empty list skips the check.

### Delete and confirm

Pass the work as an observable to `action`. It runs once, when the user confirms. A request from
`HttpClient` fits, because it does nothing until it is subscribed to. On success the modal closes
and the grid reloads. On failure the modal stays open and shows the error. A 400 response is mapped
onto the fields of a surrounding form.

Both buttons start disabled and nothing enables them for you. Bind `disabled`, for example to
whether the grid has selected rows:

```html
<framework-button-delete [action]="deleteSelected$" [disabled]="!hasSelection()"></framework-button-delete>
```

### Filters

Project the filter fields into `framework-button-filters`. The button reads them from the nearest
`[formGroup]`, so wrap it in one:

```html
<form [formGroup]="filtersForm">
  <framework-button-filters modalTitle="Filter customers">
    <input class="form-input" formControlName="name" aria-label="Name" />
  </framework-button-filters>
</form>
```

On Confirm the non-empty values become the grid's filters. Display controls created by
`lib-catalog-select` are not sent. A Clear button appears while filters are applied. The button is
disabled until the grid has loaded.

### Export

The export button calls `export(format, parameters)` on the grid's dataset and downloads the
response. The base `DataGridDataset.export` throws, so override it in your dataset. The file name
comes from the response's `Content-Disposition` header, or else from `fileBaseName`. The button is
disabled when the dataset's `totalRows` is above `MaxExportRows` (50,000). See
[Export](../guides/backend-contract.md#export) for the request shape.

### Showing progress

`startLoading()` and `finishLoading(status)` drive the spinner of any framework button. The status
(`success`, `warning` or `failure`) shows on the button for one second.

<!-- example: framework-buttons-states -->

## Accessibility

The buttons inherit the behaviour of `lib-ribbon-button`. Each has a translated label, which also
names it for screen readers when the ribbon is too narrow to show labels. The delete and confirm
modals are `lib-modal` dialogs. See [Ribbon](./ribbon.md) and [Modal](./modal.md) for the details
and their current limits.

## Theming

The buttons are ribbon buttons and take the ribbon's styling. Their icon colours are Tailwind text
classes. `framework-button` and `framework-button-confirm` take yours through `color`, and
`framework-button-edit` through `cancelColor`. The others use fixed ones. See
[Ribbon](./ribbon.md#theming).
