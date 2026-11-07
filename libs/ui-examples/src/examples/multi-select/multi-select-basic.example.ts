import { Component, Injectable, input } from '@angular/core';
import {
  ButtonComponent,
  DataGridDataset,
  IGridColumn,
  IMultiSelectorChanges,
  ModalSize,
  MultiSelectComponent,
  MultiSelectResultDataset,
} from '@zambon-dev/ui/library';
import { Observable, of } from 'rxjs';

interface RecordRow {
  id: number;
  name: string;
  status: string;
}

/** The records to choose from. */
@Injectable()
class AvailableRecordsDataset extends DataGridDataset {
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

/** The records already chosen, and how a confirmed change is saved. */
@Injectable()
class SelectedRecordsDataset extends MultiSelectResultDataset {
  public getData(): Observable<RecordRow[]> {
    return of([
      { id: 1, name: 'Selected alpha', status: 'Active' },
      { id: 2, name: 'Selected beta', status: 'Pending' },
    ]);
  }

  protected saveData(changes: IMultiSelectorChanges): Observable<IMultiSelectorChanges> {
    return of(changes);
  }
}

/** A modal to add records to a selection or remove them from it. */
@Component({
  selector: 'example-multi-select-basic',
  imports: [ButtonComponent, MultiSelectComponent],
  providers: [
    { provide: DataGridDataset, useClass: AvailableRecordsDataset },
    { provide: MultiSelectResultDataset, useClass: SelectedRecordsDataset },
  ],
  template: `
    <div class="p-4">
      <lib-button intent="primary" (click)="multiSelect.toggleModal()">Open selector</lib-button>

      <lib-multi-select
        #multiSelect
        closeButtonText="Cancel"
        [size]="modalSize()"
        [title]="modalTitle()"
      ></lib-multi-select>
    </div>
  `,
})
export class MultiSelectBasicExample {
  /** Width of the modal. */
  public readonly modalSize = input<ModalSize>('5xl');

  /** Heading of the modal. */
  public readonly modalTitle = input('Select records');
}
