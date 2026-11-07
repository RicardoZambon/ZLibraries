# Backend contract

This page lists every HTTP call `@zambon-dev/ui` makes, the payloads it sends and the answers it
expects. It also lists the shapes the package expects from calls your own code makes, such as grid
data and validation errors. ZWebAPI implements this contract; any backend that matches it works.

JSON uses camelCase, the ASP.NET Core default. A C# `ID` property arrives as `id`, while `EntityID`
keeps its trailing capitals and arrives as `entityID`.

## Calls the package makes

| Call                                    | Made by                                                 | Method and URL                                                         |
| --------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| [Sign in](#sign-in)                     | `AuthenticationService.authenticate()`                  | `POST {BASE_URL}/Authentication/SignIn`                                |
| [Refresh token](#refresh-token)         | `AuthInterceptor`                                       | `POST {BASE_URL}/Authentication/RefreshToken`                          |
| [Actions](#actions)                     | `AuthenticationService.getActions()`                    | `POST {BASE_URL}/Authentication/GetActions`                            |
| [Service history](#service-history)     | `ServicesHistoryService.list()`                         | `POST {BASE_URL}/{controllerName}/{entityID}/Audit`                    |
| [Operation history](#operation-history) | `OperationsHistoryService.list()`                       | `POST {BASE_URL}/{controllerName}/{entityID}/Audit/{serviceHistoryID}` |
| [Catalog search](#catalog-search)       | `CatalogService.search()`, used by `lib-catalog-select` | `POST {endpoint}`                                                      |
| [Notifications](#notifications)         | `NotificationsService`, driven by the top bar           | SignalR hub at `notificationsUrl`                                      |

`BASE_URL` and `notificationsUrl` come from `APP_CONFIG`. A catalog `endpoint` is used exactly as
the component receives it, so pass a full URL.

## Authentication

`AuthenticationService` (`@zambon-dev/ui/shared`) implements the framework's `AuthService` against
these three endpoints.

### Sign in

`LoginComponent` calls it when the user submits the form.

Request body:

```json
{ "username": "ada", "password": "secret", "rememberMe": true }
```

Response body, `IAuthResponse`:

| Field                    | Type     | Required | What the package does with it                                |
| ------------------------ | -------- | -------- | ------------------------------------------------------------ |
| `token`                  | `string` | yes      | The JWT. Stored, and sent as the bearer token.               |
| `refreshToken`           | `string` | yes      | Stored, and sent back to refresh the JWT.                    |
| `refreshTokenExpiration` | `string` | yes      | Declared, not read.                                          |
| `username`               | `string` | yes      | Stored. Its presence is what makes the user signed in.       |
| `name`                   | `string` | yes      | The user's name in the top bar.                              |
| `costCenterName`         | `string` | yes      | Part of the stored user information.                         |
| `position`               | `string` | no       | Job title under the name in the top bar. Hidden when absent. |
| `pictureUrl`             | `string` | no       | Avatar. Initials show when absent.                           |
| `email`                  | `string` | no       | The `{email}` placeholder in an external menu URL.           |
| `userID`                 | `number` | no       | The `{userId}` placeholder in an external menu URL.          |

Every field except the three token fields is `ICurrentUserInfo`. `AuthenticationService.getUserInfo()`
returns it.

Errors: a 401 shows that the user name or password is incorrect. Any other status shows a server
error. Both appear after a one-second delay.

### Refresh token

`AuthInterceptor` calls it before a request to `BASE_URL` when the stored JWT has expired. Requests
waiting at the same time share one refresh.

Request body:

```json
{ "username": "ada", "refreshToken": "<stored refresh token>" }
```

Response body: an `IAuthResponse`, as for sign in. The new `token`, `refreshToken` and user
information replace the stored ones. The original request is retried with the new token.

A 401 signs the user out and navigates to `/login`.

### Actions

The framework asks for the user's actions the first time it checks one, typically when a button
with `allowedActions` renders.

Request body: `{}`. Response body: the action names the user holds, as a `string[]`.

```json
["Contracts-Edit", "Contracts-Delete"]
```

A user holding `AdministrativeMaster` is allowed every action. The answer is cached until sign-out.

### Storage

| Key            | Holds                                        |
| -------------- | -------------------------------------------- |
| `token`        | The JWT.                                     |
| `refreshToken` | The refresh token.                           |
| `username`     | The user name.                               |
| `userInfo`     | The sign-in response as Base64-encoded JSON. |

With **remember me** the keys go to `localStorage`, otherwise to `sessionStorage`. A refresh writes
to the storage the key is already in. Signing out clears both storages entirely, including keys the
application wrote itself.

The interceptor adds a bearer header only to the request it retries after a refresh. The header on
every other request comes from `@auth0/angular-jwt`, which the application configures to read the
`token` key. See [Getting started](./getting-started.md).

## Audit history

The audit view (`ServicesHistoryViewComponent`) reads two lists. `controllerName` comes from the
view's route data; `entityID` is the record's ID.

### Service history

`POST {BASE_URL}/{controllerName}/{entityID}/Audit`

Request body: [list parameters](#list-parameters). The history filter sends these filters:

| Filter              | Value                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `name`              | Text the user typed.                                                                        |
| `changedByID`       | The selected user's ID. Offered only when the route sets `usersCatalogEndpoint`.            |
| `changedOnFrom`     | Start of the picked local day, as UTC without a zone designator: `2026-03-05T03:00:00.000`. |
| `changedOnTo`       | End of the picked local day, in the same format: `2026-03-06T02:59:59.999`.                 |
| `onlyCurrentEntity` | `true` or `false`.                                                                          |

Response body: a plain array of `IServicesHistoryList`.

```json
[{ "id": 2, "name": "Customer updated", "changedByName": "Grace Hopper", "changedOn": "2026-07-24T09:30:00Z" }]
```

### Operation history

`POST {BASE_URL}/{controllerName}/{entityID}/Audit/{serviceHistoryID}`

Called when the user selects a service history row. Request body: list parameters.

Response body: a plain array of `IOperationsHistoryList`.

| Field           | Type     | What it is                                                               |
| --------------- | -------- | ------------------------------------------------------------------------ |
| `id`            | `number` | The operation's ID. Required.                                            |
| `entityID`      | `number` | The changed record's ID.                                                 |
| `entityName`    | `string` | The changed record's type.                                               |
| `tableName`     | `string` | The table written.                                                       |
| `operationType` | `string` | What the operation did, for example `Modified`.                          |
| `oldValues`     | `string` | JSON of the changed fields before the operation.                         |
| `newValues`     | `string` | JSON of the changed fields after it.                                     |
| `fields`        | array    | Every field before and after. Sent by ZWebAPI 1.17 and later; see below. |

Each item in `fields` is an `IOperationsHistoryField`:

| Field       | Type      | What it is                                                             |
| ----------- | --------- | ---------------------------------------------------------------------- |
| `name`      | `string`  | The property name, as the backend declares it.                         |
| `type`      | `string`  | `boolean`, `date`, `enum`, `key`, `number`, `other`, `text` or `time`. |
| `oldValue`  | any       | The value before; `null` for a creation.                               |
| `newValue`  | any       | The value after; `null` for a deletion.                                |
| `isChanged` | `boolean` | Whether the operation wrote this field.                                |
| `isSystem`  | `boolean` | Bookkeeping, such as the key or audit columns.                         |

Without `fields` the details show only the changed fields, from `oldValues` and `newValues`.

## Catalog search

`lib-catalog-select` calls `POST {endpoint}` to fill its dropdown.

Request body:

```json
{ "maxResults": 100, "criteria": "acme", "filters": { "isActive": true } }
```

| Field        | What it is                                                  |
| ------------ | ----------------------------------------------------------- |
| `maxResults` | The component's `maxEntries` input. Default 100.            |
| `criteria`   | What the user typed. Empty on the first call.               |
| `filters`    | The component's `filters` input. `{}` when it is not bound. |

Response body, `ICatalogResult`:

```json
{ "entries": [{ "display": "Acme Ltd", "value": 42 }], "shouldUseCriteria": false }
```

| Field               | What it does                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entries`           | The options: `display` is the label, `value` is what the form control holds.                                                                                                      |
| `shouldUseCriteria` | Read from the first answer only. `true` means the catalog is too large to list: the field then asks for at least `minimumLengthSearch` characters (default 3) before it searches. |

A plain array of entries is also accepted.

## Notifications

When notifications are enabled, the top bar connects to a SignalR hub at `notificationsUrl`. It
sends the JWT through SignalR's access token factory. The hub pushes the full list with
`ReceiveNotifications(INotification[])` and may handle `MarkAllAsRead()`.

The hub contract, the `INotification` shape and a server example are in
[Top bar configuration](./top-bar-configuration.md).

## Shapes your own calls must match

Your services load grids and records, so you choose their URLs. The package still expects certain
shapes from them.

### List parameters

A grid's `DataGridDataset.getData(parameters)` receives `IListParameters`. Send it to your list
endpoint.

| Field      | Type                        | What the grid sends                                                         |
| ---------- | --------------------------- | --------------------------------------------------------------------------- |
| `startRow` | `number`                    | How many rows are already loaded: `0`, then `100`, `200`...                 |
| `endRow`   | `number`                    | The block size, `recordBlockSize` (default 100). A row count, not an index. |
| `filters`  | `{ [key: string]: string }` | The filter form's values by control name, or absent.                        |
| `sort`     | `{ [key: string]: string }` | Declared, but the grid does not send it.                                    |

Filter values are the filter form's raw values, so a checkbox arrives as a boolean and an empty
field as `null`, despite the declared type. `ISummaryParameters` is the `filters` part alone, for
endpoints that need only the filters.

The answer is either an array of rows or an `IListResult<T>`:

```json
{ "items": [{ "id": 325, "number": "C-325" }], "totalRows": 1840 }
```

- Each row needs an `id`. Selection, **Open** and **Delete** read it.
- A block shorter than the block size ends lazy loading.
- `totalRows` is optional. When it exceeds 50,000, **Export** is disabled.

### Export

`framework-button-export` calls your `DataGridDataset.export(format, parameters)`. `format` is
`xlsx`, `pdf`, `csv`, `xml` or `mhtml`. `parameters` holds the grid's current `filters`, with
`startRow` and `endRow` both `0`.

Return an `HttpResponse<Blob>`: request it with `observe: 'response'` and `responseType: 'blob'`.
The file name comes from the `Content-Disposition` header, or the button's `fileBaseName` input
when the header has none. Expose the header to the browser with CORS
(`Access-Control-Expose-Headers: Content-Disposition`) when the API is on another origin.

### Records

A details tab's `DataProviderService` subclass loads and saves the record. The saved record you
return must include its `id`: the tab's URL and the record's ID are taken from it.

### Validation errors

A save or delete that fails validation answers **400** with an `errors` object. This is ASP.NET
Core's validation problem shape:

```json
{
  "status": 400,
  "errors": {
    "Number": ["NumberInUse"],
    "CustomerName": ["required"]
  }
}
```

- **Keys** are field names. They match form controls ignoring the case of the first letter, so
  `Number` reaches the `number` control.
- **The first message** of each field becomes an error key on that control. The field shows text
  only when its `validations` input maps that key to a translation. See
  [Building views](./building-views.md#validation-messages-on-fields).
- A 400 without `errors` marks no field.

### Other errors

For any other failure, a response body that is a plain string is shown as the error message. It
goes through the translation pipe, so it may be a translation key. Any other body shows the default
message, `Modal-Failed-DefaultMessage`.

A 404 while loading a record shows "Record not found" instead.

## References

- [`AuthenticationService`](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/shared/services/authentication.service.ts)
- [`AuthInterceptor`](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/shared/auth/interceptors/auth-interceptors.ts)
- [Audit history models](https://github.com/RicardoZambon/ZLibraries/tree/main/libs/ui/src/shared/models)
- [List models](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/library/models/data-grid-parameters.ts)
