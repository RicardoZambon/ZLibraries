import { Component, Injectable, input } from '@angular/core';
import { DataGridComponent, DataGridDataset, IGridColumn } from '@zambon-dev/ui/library';
import { Observable, of } from 'rxjs';

interface RecordRow {
  id: number;
  name: string;
  status: string;
}

/** The dataset owns the columns and loads the rows. A real one calls your API in `getData`. */
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

/** A grid fed by its own dataset. The grid needs a height from its parent. */
@Component({
  selector: 'example-data-grid-basic',
  imports: [DataGridComponent],
  providers: [{ provide: DataGridDataset, useClass: RecordsDataset }],
  template: `
    <div class="p-4 max-w-5xl h-96">
      <lib-data-grid [disabled]="disabled()"></lib-data-grid>
    </div>
  `,
})
export class DataGridBasicExample {
  /** Turns the whole grid read-only. */
  public readonly disabled = input(false);
}
