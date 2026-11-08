---
title: Audit history
summary: A ready view of a record's change history, with who changed what and when, field by field.
entryPoint: shared
api:
  [
    ServicesHistoryViewComponent,
    ServicesHistoryChildListComponent,
    ServicesHistoryFilterComponent,
    OperationsHistoryChildListComponent,
    OperationsHistoryModalComponent,
    ServicesHistoryDataset,
    OperationsHistoryDataset,
  ]
storybook: shared-app-showcase--details-view
---

The audit history shows every change made to a record. The left grid lists the **services**: each
action a user ran, with who ran it and when. The right grid lists the **operations** of the selected
service: each row added, modified or deleted. Clicking an operation opens its changes field by field,
with the value before and after.

## Usage

Add `ServicesHistoryViewComponent` as one view of a details page:

```ts
import { Routes } from '@angular/router';
import { DefaultDetailsTabViewComponent, FRAMEWORK_VIEW_TYPE, FrameworkViewType } from '@zambon-dev/ui/framework';
import { ServicesHistoryViewComponent } from '@zambon-dev/ui/shared';

export const customerRoutes: Routes = [
  {
    path: ':id',
    component: DefaultDetailsTabViewComponent,
    data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details /* dataProvider, defaultTitle */ },
    children: [
      { path: '', component: CustomerFormComponent, data: { title: 'Customers-Details', icon: 'fa-user' } },
      {
        path: 'history',
        component: ServicesHistoryViewComponent,
        data: {
          title: 'Button-Views-History',
          icon: 'fa-history',
          controllerName: 'Customers',
          usersCatalogEndpoint: '/api/Users/Catalog',
        },
      },
    ],
  },
];
```

`CustomerFormComponent` stands for your own form view. [Details views](../guides/details-views.md)
explains the details route and its views.

The view reads from its route and its surroundings:

| Input                  | Where it comes from                                                          |
| ---------------------- | ---------------------------------------------------------------------------- |
| `controllerName`       | The route's `controllerName` data. The API controller of the audited record. |
| `entityID`             | The `id` of the details page's record, from its data provider.               |
| `usersCatalogEndpoint` | The route's `usersCatalogEndpoint` data. Optional.                           |

`usersCatalogEndpoint` is not part of the `IDetailsViewRouteData` type. A route `data` object typed
with it rejects the key; leave that object untyped, as above.

### The backend

The view calls `POST {BASE_URL}/{controllerName}/{entityID}/Audit` for the services and
`.../Audit/{serviceHistoryID}` for the operations. See
[Audit history](../guides/backend-contract.md#audit-history) for the request and response shapes.

### Filters

The ribbon offers Refresh and a filter. The filter narrows the services by action name, date range
and author, and can limit the operations to the current record. A date range picked backwards is
corrected. The author filter shows only when `usersCatalogEndpoint` is set; it is a
[catalog select](./catalog-select.md) searching that endpoint.

### Field labels

The change details label each field from its property name: `FullName` reads "Full name". To use
your own labels, provide `OPERATIONS_HISTORY_FIELD_LABEL`. See
[Audit field labels](../guides/details-views.md#audit-field-labels).

### Using the parts

The grids and the modal are exported for a layout of your own. `shared-services-history-child-list`
needs `{ provide: DataGridDataset, useClass: ServicesHistoryDataset }` above it.
`shared-operations-history-child-list` provides its own dataset and opens the modal itself. Bind
their `controllerName`, and pass the selected service's ID to the operations list as `serviceID`.

### Translations

The view's labels are keys from the shared operations-history and services-history translations,
plus the framework ones for its buttons. See [Internationalization](../guides/internationalization.md).

## Accessibility

The view is made of [data grids](./data-grid.md#accessibility), [action buttons](./action-buttons.md)
and a [modal](./modal.md#accessibility), and shares their current limits. In particular, opening an
operation's details means selecting a grid row, which needs a pointer.

## Theming

The view has no tokens of its own. Operation kinds are coloured with `--color-success` (added),
`--color-info` (modified) and `--color-danger` (deleted). See [Theming](../guides/design-tokens.md).
