import { Component, Injectable } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonComponent,
  DataGridDataset,
  FormInputGroupComponent,
  FormService,
  IBatchUpdate,
  IGridColumn,
  MultiEditorComponent,
  MultiEditorDataset,
} from '@zambon-dev/ui/library';
import { Observable, of } from 'rxjs';

interface RecordRow {
  id: number;
  name: string;
  status: string;
}

/** The rows the editor lists on its left. */
@Injectable()
class RecordsDataset extends DataGridDataset {
  public override columns: IGridColumn[] = [
    { field: 'id', headerName: 'ID', size: '5rem' },
    { field: 'name', headerName: 'Name', size: 'minmax(12rem, 1fr)' },
    { field: 'status', headerName: 'Status', size: '10rem' },
  ];

  public getData(): Observable<RecordRow[]> {
    return of([
      { id: 1, name: 'Alpha record', status: 'Active' },
      { id: 2, name: 'Beta record', status: 'Pending' },
      { id: 3, name: 'Gamma record', status: 'Archived' },
    ]);
  }
}

/** Builds a new row and saves every change in one batch. A real one posts the batch to your API. */
@Injectable()
class RecordsEditorDataset extends MultiEditorDataset {
  public newData(id: number): RecordRow {
    return { id, name: 'New record', status: 'Draft' };
  }

  public saveData(batchUpdate: IBatchUpdate<RecordRow, number>): Observable<IBatchUpdate<RecordRow, number>> {
    return of(batchUpdate);
  }
}

/** Edit many rows in one modal: pick a row on the left, edit it on the right, save all at once. */
@Component({
  selector: 'example-multi-editor-basic',
  imports: [ButtonComponent, FormInputGroupComponent, MultiEditorComponent, ReactiveFormsModule],
  providers: [
    FormService,
    { provide: DataGridDataset, useClass: RecordsDataset },
    { provide: MultiEditorDataset, useClass: RecordsEditorDataset },
  ],
  template: `
    <form [formGroup]="formGroup" class="p-4">
      <lib-button intent="primary" (click)="editor.toggleModal()">Open editor</lib-button>

      <lib-multi-editor #editor title="Edit records" size="5xl" [formGroup]="formGroup">
        <lib-form-input-group controlName="name" label="Name" [validations]="{ required: 'Name is required' }">
        </lib-form-input-group>

        <lib-form-input-group controlName="status" label="Status" [validations]="{ required: 'Status is required' }">
        </lib-form-input-group>
      </lib-multi-editor>
    </form>
  `,
})
export class MultiEditorBasicExample {
  protected readonly formGroup = new FormGroup({
    id: new FormControl<number | null>(null),
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
  });
}
