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

/** Turn on `showButtons` and project a toolbar into the `buttons` slot above the rows. */
@Component({
  selector: 'example-data-grid-toolbar',
  imports: [ButtonComponent, DataGridComponent],
  providers: [{ provide: DataGridDataset, useClass: RecordsDataset }],
  template: `
    <div class="p-4 max-w-5xl h-96">
      <lib-data-grid [showButtons]="true">
        <div buttons class="flex gap-2">
          <lib-button intent="secondary">
            <i class="fa-solid fa-plus"></i>
            Add
          </lib-button>
          <lib-button intent="secondary">
            <i class="fa-solid fa-rotate"></i>
            Refresh
          </lib-button>
        </div>
      </lib-data-grid>
    </div>
  `,
})
export class DataGridToolbarExample {}
