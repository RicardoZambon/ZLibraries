import { Component, Injectable } from '@angular/core';
import { DataGridComponent, DataGridDataset, IGridColumn } from '@zambon-dev/ui/library';
import { Observable, of } from 'rxjs';

interface RecordRow {
  id: number;
  name: string;
  status: string;
}

/** Multi-select and the row height are dataset configs, set once in the constructor. */
@Injectable()
class TallRowsDataset extends DataGridDataset {
  public override columns: IGridColumn[] = [
    { field: 'id', headerName: 'ID', size: '5rem' },
    { field: 'name', headerName: 'Name', size: 'minmax(12rem, 1fr)' },
    { field: 'status', headerName: 'Status', size: '10rem' },
  ];

  constructor() {
    super();
    this.configs = { ...this.configs, multiSelect: true, rowHeight: 56 };
  }

  public getData(): Observable<RecordRow[]> {
    return of([
      { id: 1, name: 'Alpha record', status: 'Active' },
      { id: 2, name: 'Beta record', status: 'Pending' },
      { id: 3, name: 'Gamma record', status: 'Archived' },
    ]);
  }
}

/**
 * Multi-select over rows taller than the default, the height a row needs once it shows a
 * thumbnail. The selection checkbox stays centred in the row.
 */
@Component({
  selector: 'example-data-grid-multi-select',
  imports: [DataGridComponent],
  providers: [{ provide: DataGridDataset, useClass: TallRowsDataset }],
  template: `
    <div class="p-4 max-w-5xl h-96">
      <lib-data-grid></lib-data-grid>
    </div>
  `,
})
export class DataGridMultiSelectExample {}
