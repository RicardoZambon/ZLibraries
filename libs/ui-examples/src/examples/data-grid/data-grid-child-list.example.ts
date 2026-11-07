import { Component, Injectable } from '@angular/core';
import { ButtonComponent, DataGridComponent, DataGridDataset, IGridColumn } from '@zambon-dev/ui/library';
import { Observable, of } from 'rxjs';

interface RecordRow {
  id: number;
  name: string;
  status: string;
}

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

/**
 * The shape of a child list inside a details form: a shorter grid that loads rows as they scroll
 * into view, with its own New and Remove actions.
 */
@Component({
  selector: 'example-data-grid-child-list',
  imports: [ButtonComponent, DataGridComponent],
  providers: [{ provide: DataGridDataset, useClass: RecordsDataset }],
  template: `
    <div class="p-4 max-w-5xl h-80">
      <lib-data-grid [lazyLoadRows]="true" [showButtons]="true">
        <div buttons class="flex gap-2">
          <lib-button intent="primary">
            <i class="fa-solid fa-plus"></i>
            New
          </lib-button>
          <lib-button intent="danger">
            <i class="fa-solid fa-trash"></i>
            Remove
          </lib-button>
        </div>
      </lib-data-grid>
    </div>
  `,
})
export class DataGridChildListExample {}
