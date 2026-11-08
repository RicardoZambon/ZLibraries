---
title: Multi editor
summary: A modal that edits many rows of a list and saves every change in one batch.
entryPoint: library
api: [MultiEditorComponent, MultiEditorDataset]
storybook: library-modals-multi-editor--primary
---

`lib-multi-editor` edits a collection in one modal. A grid of rows sits on one side and a form for
the selected row on the other. The user picks a row, edits it, adds or removes rows, and Confirm
saves the whole batch in one call.

<!-- example: multi-editor-basic -->

## Usage

The editor reads from injection:

- a `DataGridDataset` with the rows, as for a [data grid](./data-grid.md);
- a `MultiEditorDataset`, which builds new rows and saves the batch;
- a `FormService`.

You project the form fields and pass the form they bind to as `formGroup`:

```ts
import { Component, inject, Injectable } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonComponent,
  DataGridDataset,
  FormInputGroupComponent,
  FormService,
  IBatchUpdate,
  MultiEditorComponent,
  MultiEditorDataset,
} from '@zambon-dev/ui/library';
import { Observable } from 'rxjs';

@Injectable()
class PhonesEditorDataset extends MultiEditorDataset {
  private readonly api = inject(PhonesApi);

  public newData(id: number): Phone {
    return { id, number: '' };
  }

  public saveData(batch: IBatchUpdate<Phone, number>): Observable<unknown> {
    return this.api.saveBatch(batch);
  }
}

@Component({
  selector: 'app-phones-editor',
  imports: [ButtonComponent, FormInputGroupComponent, MultiEditorComponent, ReactiveFormsModule],
  providers: [
    FormService,
    { provide: DataGridDataset, useClass: PhonesDataset },
    { provide: MultiEditorDataset, useClass: PhonesEditorDataset },
  ],
  template: `
    <form [formGroup]="form">
      <lib-button (click)="editor.toggleModal()">Edit phones</lib-button>

      <lib-multi-editor #editor title="Phones" size="5xl" [formGroup]="form">
        <lib-form-input-group controlName="number" label="Number" [validations]="{ required: 'Required' }">
        </lib-form-input-group>
      </lib-multi-editor>
    </form>
  `,
})
export class PhonesEditorComponent {
  protected readonly form = new FormGroup({
    id: new FormControl<number | null>(null),
    number: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
}
```

`PhonesDataset` is a data grid dataset; `Phone` and `PhonesApi` stand for your own model and service.
The `<form [formGroup]>` around the editor lets the projected fields find their form.

### How it behaves

- Opening the modal reloads the grid and leaves the form empty and disabled.
- Selecting a row fills the form with it and enables it.
- While the form is invalid, the user cannot move to another row. The fields show their messages.
- Every edit is kept per row and shown in the grid at once.
- **Add row** calls `newData(id)` with a negative temporary ID and selects the new row. Values that
  `newData` fills in are saved even if the user never edits the row.
- **Remove row** drops the selected row. A row that was added in this session simply disappears;
  an existing one is sent for deletion.
- **Confirm** calls `saveData(batch)` with `entitiesToInsertOrUpdate` (the changed and new rows,
  new ones with their negative IDs) and `entitiesToDelete` (the removed IDs). On success the modal
  closes and the dataset emits `savedChanges`.

When the save answers 400 with validation errors, the editor selects the row named by the
response's `entityKey` and shows the errors on its fields.

`showAddButton`, `showDeleteButton`, `addButtonLabel` and `removeButtonLabel` control the two row
buttons. Their labels are shown as given.

### Modal inputs

`title`, `size`, `position`, `dialog` and `closeButtonText` work as on [modal](./modal.md). Open the
editor with `toggleModal()`. As with [multi select](./multi-select.md#modal-inputs), the editor's
own `isOpen` and `closed` do not work; listen to the dataset's `savedChanges` instead.

The Confirm button's text is the `Button-Modal-MultiEditor-Confirm` key from the
`@zambon-dev/ui/framework` translation files.

For a framework details view, the `MultiEditorModal` base class in `@zambon-dev/ui/framework` wires
the editor to the record. See [View base classes](../guides/building-views.md#view-base-classes).

<!-- example: multi-editor-pricing -->

## Accessibility

The editor inherits the [modal](./modal.md#accessibility)'s behaviour and limits, and the
[data grid](./data-grid.md#accessibility)'s. Choosing a row in the grid needs a pointer. Plan another
way in for keyboard users where this editor is the only way to change the data.

## Theming

The editor has no tokens of its own. It takes its styling from [modal](./modal.md#theming),
[data grid](./data-grid.md#theming) and the form fields.
