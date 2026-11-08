---
title: Multi select
summary: A modal to add records to a selection or remove them, with a searchable grid beside the current selection.
entryPoint: library
api: [MultiSelectComponent, MultiSelectResultDataset, MultiSelectResultGridComponent]
storybook: library-modals-multi-select--primary
---

`lib-multi-select` is a modal for choosing many records at once. A searchable grid of available
records sits on one side and the current selection on the other. The user ticks and unticks rows;
Confirm saves only the differences, in one call.

<!-- example: multi-select-basic -->

## Usage

The modal reads two datasets from injection:

- a `DataGridDataset` with the records to choose from;
- a `MultiSelectResultDataset` with the records already chosen, which also saves the changes.

```ts
import { Component, inject, Injectable } from '@angular/core';
import {
  ButtonComponent,
  DataGridDataset,
  IMultiSelectorChanges,
  MultiSelectComponent,
  MultiSelectResultDataset,
} from '@zambon-dev/ui/library';
import { Observable } from 'rxjs';

@Injectable()
class UserRolesDataset extends MultiSelectResultDataset {
  private readonly api = inject(RolesApi);
  private readonly userId = inject(CurrentUser).id;

  public getData(): Observable<Role[]> {
    return this.api.rolesOf(this.userId);
  }

  protected saveData(changes: IMultiSelectorChanges): Observable<unknown> {
    return this.api.updateRoles(this.userId, changes);
  }
}

@Component({
  selector: 'app-user-roles',
  imports: [ButtonComponent, MultiSelectComponent],
  providers: [
    { provide: DataGridDataset, useClass: AllRolesDataset },
    { provide: MultiSelectResultDataset, useClass: UserRolesDataset },
  ],
  template: `
    <lib-button (click)="picker.toggleModal()">Edit roles</lib-button>
    <lib-multi-select #picker title="Roles" size="5xl" [itemTemplate]="roleItem"></lib-multi-select>

    <ng-template #roleItem let-role="rowData">{{ role.name }}</ng-template>
  `,
})
export class UserRolesComponent {}
```

`AllRolesDataset` is a [data grid](./data-grid.md) dataset. `Role`, `RolesApi` and `CurrentUser`
stand for your own model and services.

### How it behaves

- Opening the modal clears the search, loads the grid and reloads the current selection.
- Enter in the search box runs the search. The text goes to the grid's dataset as a filter named
  after the first column's field, with its first letter in upper case (`name` becomes `Name`).
- The modal turns on `multiSelect` for the grid's dataset. You do not set it yourself.
- Rows already in the selection show as ticked in the grid.
- Confirm calls `saveData(changes)` with the IDs to add and to remove, then closes the modal. The
  result dataset emits `savedChanges`.

### The selection list

Pass a template to `itemTemplate`, as above. It renders each chosen record and receives it as
`rowData`. Without it, each row of the selection shows only its remove button.

### Modal inputs

`title`, `size`, `position`, `dialog` and `closeButtonText` work as on [modal](./modal.md).
`closeButtonText` defaults to the `Button-Modal-Cancel` key. Open and close the picker with
`toggleModal()` and `closeModal()`.

Two members inherited from the modal do not work here: the picker's own `isOpen` stays `false`, and
its `closed` output never emits. Listen to the result dataset's `savedChanges` instead.

### Translations

The Confirm button's text is the `Button-Modal-MultiSelect-Confirm` key from the
`@zambon-dev/ui/framework` translation files. See
[Internationalization](../guides/internationalization.md).

## Accessibility

The picker inherits the [modal](./modal.md#accessibility)'s behaviour and limits. Its search box has
a placeholder (`Search...`, in English) but no label. The grid's checkboxes and the remove buttons in
the selection list have no accessible name.
See [data grid](./data-grid.md#accessibility).

## Theming

The picker has no tokens of its own. It takes its styling from [modal](./modal.md#theming) and
[data grid](./data-grid.md#theming).
