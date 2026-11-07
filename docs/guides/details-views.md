# Details views

A record opens in a details tab. The tab is a route whose `data` holds
`[FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details`. Each child route is one **view** of the
record, such as the form, a child list or the audit history. The **Views** button in the ribbon
lists the views, and the user switches between them there.

This guide lists the route `data` the framework reads, and shows how to offer a view only for some
records.

## The details route

```ts
import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { DefaultDetailsTabViewComponent, FRAMEWORK_VIEW_TYPE, FrameworkViewType } from '@zambon-dev/ui/framework';

export const customerRoutes: Routes = [
  {
    path: ':id',
    component: DefaultDetailsTabViewComponent,
    data: {
      [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details,
      dataProvider: () => new CustomersDataProvider(inject(CustomersService)),
      defaultTitle: 'Customers-Details-Title-New',
    },
    children: [/* the views, below */],
  },
];
```

| Key                     | What it does                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `[FRAMEWORK_VIEW_TYPE]` | Marks the route as a details tab. Buttons and tabs find the record's route by this key.                     |
| `dataProvider`          | Factory for the record's `DataProviderService`. It runs in an injection context, so it may call `inject()`. |
| `defaultTitle`          | Translation key of the tab title for a record that has not been saved yet.                                  |

## The views

The views are the child routes. Type their `data` with `IDetailsViewRouteData` so the compiler
checks the keys.

| Key              | What it does                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `title`          | Translation key of the view's label in the Views menu and the tab history.                    |
| `icon`           | Font Awesome icon class beside the label.                                                     |
| `allowedActions` | Actions the user needs for the view to be listed. An empty list asks for none.                |
| `controllerName` | API controller that an audit history view (`ServicesHistoryViewComponent`) reads from.        |
| `ignoreRoute`    | Leaves the route out of the Views menu and the tab history.                                   |
| `visibleWhen`    | Lists the view only for the records the condition accepts. See below.                         |
| `enabledWhen`    | Lists the view for every record, but lets the user choose it only when the condition accepts. |

A child route with no `data` at all is also left out of the Views menu. Give every view a `data`
object.

The **first** listed view is where every tab opens. It cannot be hidden or disabled, and
conditions on it are ignored.

For a record that has not been saved yet, the Views button is disabled. A direct link to another
view of an unsaved record opens the first view.

### Audit field labels

The audit's change details label each field from its property name. By default, `FullName` reads
"Full name" and `RecordID` reads "Record ID". To use your own labels, provide
`OPERATIONS_HISTORY_FIELD_LABEL` from `@zambon-dev/ui/shared`. The result goes through the
translation pipe, so it may be a translation key:

```ts
import { OPERATIONS_HISTORY_FIELD_LABEL } from '@zambon-dev/ui/shared';

export const auditLabelProvider = {
  provide: OPERATIONS_HISTORY_FIELD_LABEL,
  useValue: (field: string, entityName: string | undefined) => `${entityName}-Field-${field}`,
};
```

To show the full record before and after an update, the backend must send every field
(`fields`). ZWebAPI 1.17 and later do. An older backend sends only the changed fields, and the
details show only those.

## Views that depend on the record

`visibleWhen` and `enabledWhen` take a `DetailsViewCondition`. It is a function that receives an
`IDetailsViewContext` and returns `boolean` or `Observable<boolean>`.

```ts
import { Routes } from '@angular/router';
import { DetailsViewCondition, IDetailsViewContext, IDetailsViewRouteData } from '@zambon-dev/ui/framework';

const isCustomer: DetailsViewCondition<ICustomer> = ({ entity }: IDetailsViewContext<ICustomer>) =>
  entity?.status === CustomerStatus.Customer;

const views: Routes = [
  { path: '', component: CustomersFormComponent, data: { icon: 'fa-dice-d6', title: 'Button-Views-Details' } },
  {
    path: 'payments',
    component: CustomersPaymentsComponent,
    data: <IDetailsViewRouteData<ICustomer>>{
      icon: 'fa-file-invoice-dollar',
      title: 'Customers-Button-Views-Payments',
      visibleWhen: isCustomer,
    },
  },
];
```

Use `visibleWhen` when the view means nothing for other records. Use `enabledWhen` when the user
should see that the view exists but cannot use it yet.

### What the condition receives

| Field      | What it is                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `entity`   | The record. `null` for a new record, after a load error, or when the route has no data provider. |
| `entityID` | The record's ID. `undefined` for a new record.                                                   |
| `route`    | The details route snapshot, the parent of every view.                                            |

### When it runs

- **Each time the data provider emits the record.** The first run waits for the record to load.
  A save, a status button that calls `dataProvider.updateModel(...)`, or `refreshModel()` updates
  the Views menu at once. Call `updateModel` with the record the server returned. Setting
  `FormService.model` alone does not reach the conditions.
- **In an injection context.** The condition may call `inject()`, so it can depend on more than
  the record: a feature flag, a setting or the signed-in user.

  ```ts
  visibleWhen: () => inject(FeatureFlagsService).isOn('payments'),
  ```

- **Asynchronously, when it returns an `Observable`.** The latest value wins. A new record cancels
  the previous record's stream.

### What the framework does with the answer

- **Before the first answer**, a `visibleWhen` view is hidden and an `enabledWhen` view is
  disabled. A view never appears only to vanish a moment later.
- **A condition that throws, errors, or returns anything but `true`** counts as `false`.
- **When the view on screen becomes hidden or disabled**, the tab goes back to the first view.
  This happens when the record changes under it, or when a direct link opened it. A direct link
  waits for the first answer, so a link to an allowed view survives the record loading.
- **`allowedActions` still applies.** A view is listed only when the user has the actions and the
  condition accepts the record.
- **A view without a condition** is always listed and available.
