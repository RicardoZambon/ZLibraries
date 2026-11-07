---
title: Data grid
summary: A virtual-scrolling grid whose columns, rows, paging and selection live in a dataset you provide.
entryPoint: library
api: [DataGridComponent, DataGridDataset, DataGridConfigsProvider, GridConfigsProvider]
storybook: library-data-grid-data-grid--primary
---

`lib-data-grid` shows rows from your API in a scrolling grid. It loads the next block of rows as
the user scrolls, and shows loading, empty and error messages. The grid itself holds no data. A
`DataGridDataset` subclass, provided around it, defines the columns, loads the rows and keeps the
selection. The [action buttons](./action-buttons.md) work with the same dataset.

<!-- example: data-grid-basic -->

## Usage

Subclass `DataGridDataset`, declare the columns and implement `getData`:

```ts
import { Component, inject, Injectable } from '@angular/core';
import { DataGridComponent, DataGridDataset, IGridColumn, IListParameters } from '@zambon-dev/ui/library';
import { Observable } from 'rxjs';

@Injectable()
class CustomersDataset extends DataGridDataset {
  private readonly api = inject(CustomersApi);

  public override columns: IGridColumn[] = [
    { field: 'name', headerName: 'Customers-Name', size: 'minmax(12rem, 1fr)' },
    { field: 'city', headerName: 'Customers-City', size: '10rem' },
  ];

  public getData(parameters: IListParameters): Observable<Customer[]> {
    return this.api.list(parameters);
  }
}

@Component({
  selector: 'app-customers',
  imports: [DataGridComponent],
  providers: [{ provide: DataGridDataset, useClass: CustomersDataset }],
  template: `<div class="h-96"><lib-data-grid></lib-data-grid></div>`,
})
export class CustomersComponent {}
```

`CustomersApi` and `Customer` stand for your own service and model.

### What it needs

- A `DataGridDataset` subclass, provided on the host component or above.
- A `GridConfigsProvider` at the application root. Use `DataGridConfigsProvider` for English
  messages, or `FrameworkGridConfigsProvider` from `@zambon-dev/ui/framework` for messages as
  translation keys. See
  [Providers for library components](../guides/getting-started.md#providers-for-library-components).
- Translations (`provideTranslateService`) and the router (`provideRouter`).
- A height from its parent. The grid fills it and scrolls inside.

### Columns

Each `IGridColumn` names a row `field`, a `headerName` (a translation key) and a CSS grid track
`size`. The default size is `minmax(0, 1fr)`. Give a column a `template` to render its cells
yourself; the template receives `rowData` and `column`. `customClass` adds a class to its cells.

### Loading and paging

`getData(parameters)` receives `startRow`, `endRow` and `filters`. It returns an array of rows, or
`{ items, totalRows }`. A block shorter than the block size marks the end of the data. See
[List parameters](../guides/backend-contract.md#list-parameters).

Each row needs an `id`. Selection and the Open and Delete buttons read it.

The grid loads its first block when it starts. Set `lazyLoadRows` to wait instead, for example until
the user searches; the grid shows the `messageOnLazyLoad` text until then. Call `refresh()` on the
dataset to reload, or `setFilters(filters)` to reload with new filters.

### Settings per grid

The dataset copies the provider's settings into `this.configs` when it is built. Change them in the
subclass constructor:

```ts
constructor() {
  super();
  this.configs = { ...this.configs, multiSelect: true, rowHeight: 56 };
}
```

| Setting             | What it does                                                             |
| ------------------- | ------------------------------------------------------------------------ |
| `rowHeight`         | Row height in pixels. Every row has the same height.                     |
| `rowsToDisplay`     | How many rows the grid is at least tall, while it has that many.         |
| `multiSelect`       | Adds a checkbox column for selecting several rows.                       |
| `selectOnClick`     | In a multi-select grid, whether clicking a row ticks it. Default `true`. |
| `hideColumnHeaders` | Hides the header row.                                                    |

The status texts are `messageOnEmpty`, `messageOnFailed`, `messageOnLazyLoad` and
`loadingDisplayText`. They go through the translation pipe, so they may be keys or plain text.

`recordBlockSize`, the block size, is read from the provider, not from the dataset. To change it,
subclass the provider.

<!-- example: data-grid-multi-select -->

### Toolbar

Set `showButtons` and project content with the `buttons` attribute. It shows in a bar above the
header, and the grid drops its own border.

<!-- example: data-grid-toolbar -->

<!-- example: data-grid-child-list -->

### Selection

The dataset keeps the selection by row key: `selectedRowKeys`, `selectRow(key)`, `deselectRow(key)`,
`clearSelection()` and `getSelectedRowsData()`. It emits `selectedRowsChanged` on every change.
`getRowID(key)` reads the row's `id`.

## Accessibility

The grid does not expose ARIA grid or table roles yet. Assistive technology reads it as plain text
in a scrolling region.

- In a multi-select grid, each row's checkbox is a native, focusable checkbox and toggles with
  Space. It has no accessible name.
- Focusing or selecting a row by clicking it works only with a pointer.
- Rows outside the scrolled view are not in the page, because of virtual scrolling.

If keyboard users must act on single rows, offer the action in another way as well, for example
through a multi-select checkbox and a toolbar button.

## Theming

The grid has no component tokens. It reads `--color-surface-solid`, `--color-line` and
`--color-line-strong` for its frame and header, `--state-hover` for the row under the pointer and
`--state-selected` with `--color-line-selected` for selected rows. Its corner radius is
`--surface-radius`, which falls back to `0.5rem`. See [Theming](../guides/design-tokens.md).
