# Building views

A screen in an application built on `@zambon-dev/ui` is a route. The route names a framework
**shell**, the shell hosts your **view**, and your view extends one of the framework's **base
classes**. This guide covers the route configuration, the base classes, the data provider behind a
record, and how errors reach the user. It ends with a complete example.

The tab behaviour these routes produce is described in [Tabbed navigation](./tabbed-navigation.md).
What the Views menu reads from a record's child routes is in [Details views](./details-views.md).

## Before you start

The application wiring comes first: translations, `APP_CONFIG`, the reuse strategy and the
authentication providers. See [Getting started](./getting-started.md).

A view with a grid also needs a grid configuration provider. The framework ships one with
translated grid messages:

```ts
import { ApplicationConfig } from '@angular/core';
import { FrameworkGridConfigsProvider } from '@zambon-dev/ui/framework';
import { GridConfigsProvider } from '@zambon-dev/ui/library';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    { provide: GridConfigsProvider, useClass: FrameworkGridConfigsProvider },
  ],
};
```

## Routes

A tab is a route whose `data` holds `FRAMEWORK_VIEW_TYPE`. There are two kinds.

| `FrameworkViewType` | Shell component                  | Use it for                                                         |
| ------------------- | -------------------------------- | ------------------------------------------------------------------ |
| `List`              | `DefaultTabViewComponent`        | A screen with no record behind it: a list, a dashboard.            |
| `Details`           | `DefaultDetailsTabViewComponent` | One record, with its views (form, child lists, audit) as children. |

The shell is the route's `component`. Your view is its child route.

```ts
import { Routes } from '@angular/router';
import {
  DefaultDetailsTabViewComponent,
  DefaultTabViewComponent,
  FRAMEWORK_VIEW_TYPE,
  FrameworkViewType,
} from '@zambon-dev/ui/framework';

export const contractsRoutes: Routes = [
  {
    path: 'contracts',
    children: [
      {
        path: '',
        component: DefaultTabViewComponent,
        data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
        children: [{ path: '', component: ContractsListComponent }],
      },
      {
        path: ':id',
        component: DefaultDetailsTabViewComponent,
        data: {
          [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details,
          dataProvider: () => new ContractsDataProvider(),
          defaultTitle: 'Contracts-Details-Title-New',
        },
        children: [
          {
            path: '',
            component: ContractsFormComponent,
            data: { icon: 'fa-file-contract', title: 'Button-Views-Details' },
          },
        ],
      },
    ],
  },
];
```

Keep these rules:

- **One URL segment per route path.** `'contracts'` and `':id'` are separate routes. A path like
  `'sales/contracts'` breaks the URLs the buttons build.
- **The record parameter is `id`.**
- **The list and the details route are siblings.** **New** opens `<list URL>/new`, and **Open**
  opens `<list URL>/<id>`, so `:id` must sit next to the list route.

### Route data the framework reads

| Key                     | Set on                       | What it does                                                                                  |
| ----------------------- | ---------------------------- | --------------------------------------------------------------------------------------------- |
| `[FRAMEWORK_VIEW_TYPE]` | A tab root                   | Marks the route as a tab: `FrameworkViewType.List` or `FrameworkViewType.Details`.            |
| `dataProvider`          | A details route              | A factory for the record's `DataProviderService`. It runs in an injection context.            |
| `defaultTitle`          | A details route              | Translation key of the tab title while the record is new.                                     |
| `title`                 | A view (details child route) | Translation key of the view's label in the Views menu and the breadcrumbs.                    |
| `icon`                  | A view                       | Font Awesome icon class beside the label.                                                     |
| `allowedActions`        | A view                       | Actions the user needs for the view to be listed.                                             |
| `visibleWhen`           | A view                       | Lists the view only for records the condition accepts.                                        |
| `enabledWhen`           | A view                       | Lets the view be chosen only for records the condition accepts.                               |
| `ignoreRoute`           | A view                       | Leaves the route out of the Views menu and the tab history.                                   |
| `controllerName`        | An audit view                | The API controller `ServicesHistoryViewComponent` reads the history from.                     |
| `usersCatalogEndpoint`  | An audit view                | Catalog endpoint for the history filter's "changed by" field. Without it the field is hidden. |

Type a view's `data` with `IDetailsViewRouteData<TEntity>` to have the compiler check the keys. The
first view is where every tab lands; `visibleWhen` and `enabledWhen` are ignored on it. The
[details views guide](./details-views.md) explains the conditions.

### What the shells provide

| Shell                            | Provides to your view                                                                | Renders                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `DefaultTabViewComponent`        | `TabViewService`                                                                     | The ribbon your view publishes, and the router outlet.           |
| `DefaultDetailsTabViewComponent` | `TabViewService`, `DataProviderService` (from `dataProvider`), an idle `FormService` | The ribbon, the Views button, the record title, the error modal. |

The idle `FormService` serves views without a form of their own, such as a child list with an
**Edit** button. A form view provides its own, which takes precedence.

### The ribbon

A view publishes its ribbon buttons with an `<ng-template #ribbon>`. The tab view base classes find
it and hand it to the shell, which shows it above the view. Switching views switches the ribbon.

```html
<ng-template #ribbon>
  <lib-ribbon-group [label]="'RibbonGroup-Entity' | translate">
    <framework-button-new></framework-button-new>
  </lib-ribbon-group>
</ng-template>
```

## View base classes

All base classes are in `@zambon-dev/ui/framework`. Extend one and decorate the subclass with
`@Component`.

```text
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

| Class                                | Use it for                                                     | Must implement                                                                    | Your component provides                                                      |
| ------------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `ViewBase`                           | Any view. Gives `destroy$` and `loading`.                      | Nothing                                                                           | Nothing                                                                      |
| `TabViewBase`                        | A tab view without a grid, such as a dashboard.                | Nothing                                                                           | `#ribbon` template, optional                                                 |
| `TabViewList<TListModel>`            | A list in its own tab.                                         | Nothing                                                                           | `DataGridDataset`                                                            |
| `ListView<TEntityModel, TListModel>` | A list shown as a view of a record, scoped to the record's ID. | Nothing                                                                           | `DataGridDataset`                                                            |
| `FormView<TEntityModel>`             | A record's form.                                               | `formSetup(): FormGroup`                                                          | `FormService`                                                                |
| `ChildList<TEntityModel>`            | A grid inside another view, such as lines inside a form.       | Nothing                                                                           | `DataGridDataset`                                                            |
| `ModalBase`                          | Any modal a button opens.                                      | `toggle(): void`                                                                  | Nothing                                                                      |
| `ViewModal<TEntityModel>`            | A modal that loads one item into a form.                       | `formSetup(): FormGroup`, `loadData(entityID?): Observable<TEntityModel \| null>` | `FormService`, a `#modal` reference to `lib-modal`                           |
| `MultiEditorModal<TEntityModel>`     | A modal that edits a collection in a grid.                     | `formSetup(): FormGroup`                                                          | `DataGridDataset`, `MultiEditorDataset`, `FormService`, a `lib-multi-editor` |
| `MultiSelectModal`                   | A modal that picks items from one grid into another.           | Nothing                                                                           | A `lib-multi-select`                                                         |

What each one does for you:

- **`TabViewBase`** starts with `loading` set, so buttons start disabled. It publishes `#ribbon`
  after the view initializes.
- **`TabViewList`** tracks the grid's selection: `hasRowsSelected`, and `selectedItem` when one
  row is selected. It sets `loading` while the grid loads. Override `selectedRowChanged()` to react
  to a selection.
- **`ListView`** and **`ChildList`** set the grid's `parentEntityId` to the record's ID and load
  it. `ChildList` also refreshes the grid every time the record is saved or reloaded, and when a
  `MultiSelectResultDataset` saves changes.
- **`FormView`** builds the form from `formSetup()`, fills it from the data provider each time the
  record loads, and starts in edit mode for a new record. It exposes `dataForm`, `formBuilder`,
  `formService`, `dataProvider` and `hasEntityID`.
- **`ViewModal`** resets its form and calls `loadData(entityID)` when `toggle(entityID)` opens it.
  Set `beginEditOnEntityLoad` to open it in edit mode.
- **`MultiEditorModal`** sets the record's ID on both datasets and re-emits `savedChanges`. Bind
  `overrideParentID` to edit another record's collection.

A view that reads state in its template follows the package's reactivity rules. See
[Change detection and zoneless](./reactivity.md).

## The data provider

`DataProviderService<TEntityModel>` loads, caches and saves the record a details tab shows. One
instance exists per details tab, created by the route's `dataProvider` factory.

### What a subclass implements

| Member                                                           | Contract                                                                                                    |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `loadModel(entityID?: number): Observable<TEntityModel \| null>` | Protected. Fetch the record. It is also called for a new record, with no usable ID: return `of(null)` then. |
| `saveModel(model: any): Observable<TEntityModel>`                | Create or update. Receives the form's raw value. Must answer the saved record, including its `id`.          |
| `getTitle(entity: TEntityModel): string`                         | The tab title for a saved record.                                                                           |

### What it does

- **It reads the `id` route parameter once,** when the details tab is created. `/contracts/new`
  gives no ID: `entityID` is not a valid number and `hasEntityID` is `false`. Test `hasEntityID`,
  not `entityID ?? …`.
- **It loads the record right away.** Set `shouldLazyLoad = true` in the subclass to load it
  yourself with `refreshModel()`.
- **It caches the record.** Every subscriber to `getModel$()` gets the latest value at once.
- **The saved record carries the ID.** `updateModel()` takes the new ID from the record's `id`.
  The **Save** button builds the record's URL from it too.

### Public members

| Member                    | What it does                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `entityID`, `hasEntityID` | The record's ID, and whether there is one. Both are signal-backed, so templates update. |
| `getModel$()`             | The cached record. Emits `null` for a new record and after a load error.                |
| `getError$()`             | The `HttpErrorResponse` of a failed load.                                               |
| `refreshModel()`          | Reloads the record. Ignored while a load is running.                                    |
| `updateModel(model)`      | Replaces the cached record, for example with the server's answer to a status change.    |
| `resetForNewEntity()`     | Clears the ID and emits `null`, so a form reused for a new record starts empty.         |

Call `updateModel()` with whatever the server answers after an action that changes the record. That
is what refreshes the form, the title, the child lists and the Views menu conditions.

## Error handling

The framework sorts HTTP errors into three cases.

| Status         | Meaning                    | What the user sees                                                                  |
| -------------- | -------------------------- | ----------------------------------------------------------------------------------- |
| 400            | The data is invalid.       | The messages appear on the form fields.                                             |
| 404, on a load | The record does not exist. | The error modal: "Record not found", without the "contact your administrator" line. |
| Anything else  | An unexpected failure.     | The error modal: the generic message and the "contact your administrator" line.     |

### Where each case is handled

- **Loading a record.** `DataProviderService` catches the error, emits `null` so spinners stop, and
  emits the error on `getError$()`. The details shell shows the error modal. Closing it goes back
  to the entry before the record, or closes the tab when the record was its first entry.
- **Saving.** The **Save** button sends a 400 to `FormService.setValidationErrorsFromHttpResponse()`.
  Any other error opens the error modal. The modal shows the response body when it is a string,
  otherwise `Modal-Failed-DefaultMessage`.
- **Delete and confirm buttons.** The confirm modal shows the error inside itself, with the same
  string-or-default rule. When the modal sits inside a form, a 400 goes to that form's fields instead.

### Validation messages on fields

A 400 body lists messages per field. The framework sets the **first** message of a field as an error
key on the matching control. `lib-form-input-group` shows a message only for keys listed in its
`validations` input:

```html
<lib-form-input-group
  controlName="number"
  label="Contracts-Field-Number"
  [validations]="{ required: 'Contracts-Validation-Number-Required', NumberInUse: 'Contracts-Validation-Number-InUse' }"
>
</lib-form-input-group>
```

Here a server message `NumberInUse` on field `Number` shows the translated text. A key the
`validations` map does not list marks the field invalid with no text. The body shape is in the
[backend contract](./backend-contract.md#validation-errors).

`FormService` matches a field by lower-casing its first letter: `Number` becomes `number`.
`BackendFormValidationHelper.validateAllFormFields(error, form)` matches top-level controls,
ignoring case. Use the helper for a form that has no `FormService`.

### `ErrorModalComponent`

`<framework-error-modal>` is the modal the framework uses. Use it for your own calls too.

| Member                   | Kind           | Default                        | What it does                                                     |
| ------------------------ | -------------- | ------------------------------ | ---------------------------------------------------------------- |
| `title`                  | model          | `'Modal-Failed-Title'`         | Translation key of the title.                                    |
| `subtitle`               | model          | `'Modal-Failed-Administrator'` | Translation key of the line under the message. `''` hides it.    |
| `errorMessage`           | model          | `''`                           | Translation key or text of the message.                          |
| `size`                   | input          | `'xl'`                         | Modal size.                                                      |
| `closed`                 | output         |                                | Emits when the modal closes, by button, outside click or Escape. |
| `showModal(error)`       | method         |                                | Opens it. Takes a key or an `HttpErrorResponse`.                 |
| `closeModal()`, `isOpen` | method, signal |                                | Closes it; whether it is open.                                   |

`showModal(error)` with an `HttpErrorResponse` shows the body when it is a string, otherwise
`Modal-Failed-DefaultMessage`.

### Translation keys

The framework translations ship these keys in English and Portuguese:

| Key                           | Text (English)                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| `Modal-Failed-Title`          | An error occurred                                                                         |
| `Modal-Failed-DefaultMessage` | An error occurred in the server. Please try again later.                                  |
| `Modal-Failed-Administrator`  | If the problem persists, please contact your administrator.                               |
| `Modal-NotFound-Title`        | Record not found                                                                          |
| `Modal-NotFound-Message`      | The requested record was not found. It may have been deleted or the URL may be incorrect. |

## Worked example

A contracts list and a contract form. The application's own service talks to its API; the
endpoints in it are examples, not part of the package's contract.

### Models and service

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from '@zambon-dev/ui/framework';
import { IListParameters, IListResult } from '@zambon-dev/ui/library';
import { Observable } from 'rxjs';

export interface IContract {
  customerName: string;
  id: number;
  number: string;
}

export interface IContractsList {
  customerName: string;
  id: number;
  number: string;
}

@Injectable({ providedIn: 'root' })
export class ContractsService {
  private readonly config: AppConfig = inject(APP_CONFIG);
  private readonly http: HttpClient = inject(HttpClient);

  private get baseUrl(): string {
    return `${this.config.BASE_URL}/Contracts`;
  }

  public create(model: Omit<IContract, 'id'>): Observable<IContract> {
    return this.http.post<IContract>(this.baseUrl, model);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  public get(id: number): Observable<IContract> {
    return this.http.get<IContract>(`${this.baseUrl}/${id}`);
  }

  public list(parameters: IListParameters): Observable<IListResult<IContractsList>> {
    return this.http.post<IListResult<IContractsList>>(`${this.baseUrl}/List`, parameters);
  }

  public update(id: number, model: Omit<IContract, 'id'>): Observable<IContract> {
    return this.http.put<IContract>(`${this.baseUrl}/${id}`, model);
  }
}
```

### Dataset and data provider

```ts
import { inject, Injectable } from '@angular/core';
import {
  DataGridDataset,
  DataProviderService,
  IGridColumn,
  IListParameters,
  IListResult,
} from '@zambon-dev/ui/library';
import { Observable, of } from 'rxjs';

@Injectable()
export class ContractsDataset extends DataGridDataset {
  public override columns: IGridColumn[] = [
    { field: 'number', headerName: 'Contracts-Column-Number' },
    { field: 'customerName', headerName: 'Contracts-Column-Customer' },
  ];

  private readonly contractsService: ContractsService = inject(ContractsService);

  public getData(parameters: IListParameters): Observable<IListResult<IContractsList>> {
    return this.contractsService.list(parameters);
  }
}

@Injectable()
export class ContractsDataProvider extends DataProviderService<IContract> {
  private readonly contractsService: ContractsService = inject(ContractsService);

  public getTitle(entity: IContract): string {
    return entity?.number ?? '';
  }

  public saveModel(model: Omit<IContract, 'id'>): Observable<IContract> {
    return this.hasEntityID ? this.contractsService.update(this.entityID!, model) : this.contractsService.create(model);
  }

  protected loadModel(entityID?: number): Observable<IContract | null> {
    return entityID ? this.contractsService.get(entityID) : of(null);
  }
}
```

`new ContractsDataProvider()` in the route works because the factory runs in an injection context,
so the `inject()` calls in the class resolve.

### List view

```ts
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ButtonDeleteComponent,
  ButtonNewComponent,
  ButtonOpenRecordComponent,
  ButtonRefreshComponent,
  TabViewList,
} from '@zambon-dev/ui/framework';
import { DataGridComponent, DataGridDataset, RibbonGroupComponent } from '@zambon-dev/ui/library';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-contracts-list',
  imports: [
    ButtonDeleteComponent,
    ButtonNewComponent,
    ButtonOpenRecordComponent,
    ButtonRefreshComponent,
    DataGridComponent,
    RibbonGroupComponent,
    TranslatePipe,
  ],
  providers: [{ provide: DataGridDataset, useClass: ContractsDataset }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group [label]="'RibbonGroup-Entity' | translate">
        <framework-button-new></framework-button-new>
        <framework-button-open-record></framework-button-open-record>
        <framework-button-delete [action]="deleteSelected()" [disabled]="!hasRowsSelected"></framework-button-delete>
      </lib-ribbon-group>
      <lib-ribbon-group [label]="'RibbonGroup-General' | translate">
        <framework-button-refresh></framework-button-refresh>
      </lib-ribbon-group>
    </ng-template>

    <lib-data-grid></lib-data-grid>
  `,
})
export class ContractsListComponent extends TabViewList<IContractsList> {
  private readonly contractsService: ContractsService = inject(ContractsService);

  protected deleteSelected(): Observable<void> {
    return this.contractsService.delete(this.selectedItem?.id ?? 0);
  }
}
```

`[action]` takes an observable, and the template creates it on every render. Return a cold
observable, such as an `HttpClient` call: the button subscribes only after the user confirms.

### Form view

```ts
import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonEditComponent, ButtonNewComponent, ButtonSaveComponent, FormView } from '@zambon-dev/ui/framework';
import { FormGroupComponent, FormInputGroupComponent, FormService, RibbonGroupComponent } from '@zambon-dev/ui/library';

@Component({
  selector: 'app-contracts-form',
  imports: [
    ButtonEditComponent,
    ButtonNewComponent,
    ButtonSaveComponent,
    FormGroupComponent,
    FormInputGroupComponent,
    ReactiveFormsModule,
    RibbonGroupComponent,
    TranslatePipe,
  ],
  providers: [{ provide: FormService }],
  template: `
    <ng-template #ribbon>
      <lib-ribbon-group [label]="'RibbonGroup-Entity' | translate">
        <framework-button-new></framework-button-new>
        <framework-button-edit></framework-button-edit>
        <framework-button-save></framework-button-save>
      </lib-ribbon-group>
    </ng-template>

    <form ngNoForm [formGroup]="dataForm">
      <lib-form-group label="Contracts-FormGroup-General">
        <lib-form-input-group
          controlName="number"
          label="Contracts-Field-Number"
          [maxLength]="20"
          [validations]="{ required: 'Contracts-Validation-Number-Required' }"
        >
        </lib-form-input-group>
        <lib-form-input-group controlName="customerName" label="Contracts-Field-Customer" [maxLength]="200">
        </lib-form-input-group>
      </lib-form-group>
    </form>
  `,
})
export class ContractsFormComponent extends FormView<IContract> {
  protected formSetup(): FormGroup {
    return this.formBuilder.group({
      customerName: [null],
      number: [null, Validators.required],
    });
  }
}
```

With the routes from the start of this guide, the menu entry `/contracts` opens the list. **New**
opens `/contracts/new` in edit mode, **Save** turns it into `/contracts/<id>`, and **Open** opens
the selected row.

To add the audit history as a second view, add a child route to the details route:

```ts
import { ServicesHistoryViewComponent } from '@zambon-dev/ui/shared';

{
  path: 'audit',
  component: ServicesHistoryViewComponent,
  data: { controllerName: 'Contracts', icon: 'fa-history', title: 'Button-Views-History' },
},
```

## Deprecated APIs

These still ship but will be removed. Do not use them in new code.

| Deprecated                                                                                                                                 | Use instead                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `ButtonEditLegacyComponent` (`framework-button-edit-legacy`)                                                                               | `ButtonEditComponent` (`framework-button-edit`)                 |
| `ButtonNewLegacyComponent` (`framework-button-new-legacy`)                                                                                 | `ButtonNewComponent` (`framework-button-new`)                   |
| `ButtonOpenRecordLegacyComponent` (`framework-button-open-record-legacy`)                                                                  | `ButtonOpenRecordComponent` (`framework-button-open-record`)    |
| `ButtonSaveLegacyComponent` (`framework-button-save-legacy`)                                                                               | `ButtonSaveComponent` (`framework-button-save`)                 |
| `ButtonViewsLegacyComponent` (`framework-button-views-legacy`)                                                                             | `ButtonViewsComponent` (`framework-button-views`)               |
| `LegacyTabViewList`                                                                                                                        | `TabViewList`                                                   |
| `LegacyTabViewDetails`                                                                                                                     | `DefaultDetailsTabViewComponent` with the views as child routes |
| `LegacySubViewForm`                                                                                                                        | `FormView`                                                      |
| `ChildListLegacy`                                                                                                                          | `ChildList`                                                     |
| `MultiEditorLegacyModal`                                                                                                                   | `MultiEditorModal`                                              |
| `LibraryModule`, `FrameworkModule`, `FrameworkComponentsModule`, `FrameworkButtonsModule`, `FrameworkModalsModule`, `FrameworkViewsModule` | Import the standalone components in your component's `imports`. |

The legacy classes take their dependencies through the constructor and switch views by hand. The
replacements use `inject()` and the route-driven shells described above.

## References

- [View base classes](https://github.com/RicardoZambon/ZLibraries/tree/main/libs/ui/src/framework/views)
- [`DataProviderService`](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/library/services/data-providers/data-provider.service.ts)
- [`DefaultDetailsTabViewComponent`](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/framework/components/views/default-details-tab-view/default-details-tab-view.component.ts)
- [Route data types](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/framework/models/route-data.ts)
