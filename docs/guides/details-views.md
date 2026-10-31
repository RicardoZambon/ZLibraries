# Details Views Guide (for consuming applications)

A record opens in a details tab. The tab is a route whose `data` holds
`[FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details`, and each of its child routes is one **view**
of that record: the form, a child list, the audit history. The **Views** button in the ribbon
lists them, and the user switches between them there.

This guide lists what the framework reads from the route `data` of a details route and of its
views, and how to show or offer a view only for some records.

## The details route

```ts
import { inject } from '@angular/core';
import { DefaultDetailsTabViewComponent, FRAMEWORK_VIEW_TYPE, FrameworkViewType } from '@zambon-dev/ui/framework';

{
  path: ':id',
  component: DefaultDetailsTabViewComponent,
  data: {
    [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details,
    dataProvider: () => new CustomersDataProvider(inject(CustomersService)),
    defaultTitle: 'Customers-Details-Title-New',
  },
  children: [ /* the views, below */ ],
}
```

| Key                     | What it does                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `[FRAMEWORK_VIEW_TYPE]` | Marks the route as a details tab. Buttons and tabs find the record's route by this key. |
| `dataProvider`          | A factory, run in an injection context, for the `DataProviderService` of the record.    |
| `defaultTitle`          | Translation key of the tab title for a record that has not been saved yet.              |

## The views

The views are the child routes. Type their `data` with `IDetailsViewRouteData` to have the
compiler check the keys.

| Key              | What it does                                                                            |
| ---------------- | --------------------------------------------------------------------------------------- |
| `title`          | Translation key of the view's label in the Views menu and the tab history.              |
| `icon`           | Font Awesome icon class beside the label.                                               |
| `allowedActions` | Actions the user needs for the view to be listed. An empty list asks for none.          |
| `controllerName` | The API controller an audit-history view (`ServicesHistoryViewComponent`) reads from.   |
| `ignoreRoute`    | Leaves the route out of the Views menu and the tab history.                             |
| `visibleWhen`    | Lists the view only for the records the condition accepts. See below.                   |
| `enabledWhen`    | Lists the view for every record, but lets it be chosen only when the condition accepts. |

The **first** view is where every tab lands. It cannot be hidden or disabled, and conditions on it
are ignored.

## Views that depend on the record

`visibleWhen` and `enabledWhen` take a `DetailsViewCondition`: a function that receives an
`IDetailsViewContext` and answers `boolean` or `Observable<boolean>`.

```ts
import { DetailsViewCondition, IDetailsViewContext, IDetailsViewRouteData } from '@zambon-dev/ui/framework';

const isCustomer: DetailsViewCondition<ICustomer> = ({ entity }: IDetailsViewContext<ICustomer>) =>
  entity?.status === CustomerStatus.Customer;

children: [
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
],
```

Use `visibleWhen` when the view means nothing for the other records, and `enabledWhen` when the
user should see that it exists but cannot use it yet.

### What the condition receives

| Field      | What it is                                                                   |
| ---------- | ---------------------------------------------------------------------------- |
| `entity`   | The record: `null` while it loads, for a new record, and after a load error. |
| `entityID` | The record's ID, `undefined` for a new record.                               |
| `route`    | The details route snapshot, the parent of every view.                        |

### When it runs

- **On every record the data provider emits.** A save, a status button that calls
  `dataProvider.updateModel(...)`, or `refreshModel()` updates the Views menu at once. Call
  `updateModel` with the record the server answered; setting `FormService.model` alone does not
  reach the conditions.
- **In an injection context.** The condition may call `inject()`, so it can depend on more than
  the record: a feature flag, a setting, the signed-in user.

  ```ts
  visibleWhen: () => inject(FeatureFlagsService).isOn('payments'),
  ```

- **Asynchronously, when it returns an `Observable`.** The latest value wins, and a new record
  cancels the previous record's stream.

### What the framework does with the answer

- **Before the first answer**, a `visibleWhen` view is hidden and an `enabledWhen` view is
  disabled. A view never appears only to vanish a moment later.
- **A condition that throws, errors, or answers anything but `true`** counts as `false`.
- **When the view on screen becomes hidden or disabled**, because the record changed under it or
  because a direct link opened it, the tab goes back to the first view. A direct link waits for
  the first answer, so a valid one survives the record loading.
- **`allowedActions` still applies.** A view is listed only when the user has the actions and the
  condition accepts the record.
- **A view without a condition** behaves as before.
