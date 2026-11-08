import { Component, Injectable } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
import {
  ButtonComponent,
  ButtonConfirmComponent,
  ButtonDeleteComponent,
  ButtonEditComponent,
  ButtonFiltersComponent,
  ButtonNewComponent,
  ButtonOpenRecordComponent,
  ButtonRefreshComponent,
  ButtonSaveComponent,
  ButtonViewsComponent,
  CustomReuseStrategy,
  TabService,
  TabViewService,
} from '@zambon-dev/ui/framework';
import {
  DataGridComponent,
  DataGridDataset,
  DataProviderService,
  FormGroupComponent,
  FormInputGroupComponent,
  FormService,
  IGridColumn,
  RibbonComponent,
  RibbonGroupComponent,
} from '@zambon-dev/ui/library';
import { Observable, of } from 'rxjs';

interface RecordRow {
  id: number;
  name: string;
  status: string;
}

/** The list the grid-aware buttons (open, refresh, delete, confirm) act on. */
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

/** The open record the form buttons (new, edit, save) act on. A real one loads it from your API. */
@Injectable()
class RecordDataProvider extends DataProviderService<RecordRow> {
  public getTitle(record: RecordRow): string {
    return record.name;
  }

  public saveModel(record: RecordRow): Observable<RecordRow> {
    return of(record);
  }

  protected loadModel(): Observable<RecordRow> {
    return of({ id: 1, name: 'Alpha record', status: 'Active' });
  }
}

/**
 * The framework's ready-made ribbon buttons. Each one finds what it acts on through injection:
 * the grid dataset, the data provider, the form service and the tab services.
 */
@Component({
  selector: 'example-framework-buttons-ribbon',
  imports: [
    ButtonComponent,
    ButtonConfirmComponent,
    ButtonDeleteComponent,
    ButtonEditComponent,
    ButtonFiltersComponent,
    ButtonNewComponent,
    ButtonOpenRecordComponent,
    ButtonRefreshComponent,
    ButtonSaveComponent,
    ButtonViewsComponent,
    DataGridComponent,
    FormGroupComponent,
    FormInputGroupComponent,
    ReactiveFormsModule,
    RibbonComponent,
    RibbonGroupComponent,
  ],
  providers: [
    FormService,
    TabService,
    TabViewService,
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    { provide: DataGridDataset, useClass: RecordsDataset },
    { provide: DataProviderService, useClass: RecordDataProvider },
  ],
  template: `
    <div class="p-4 max-w-6xl">
      <lib-ribbon>
        <lib-ribbon-group label="Record">
          <framework-button color="text-primary-500" icon="fa-play" label="Run action"></framework-button>
          <framework-button-new></framework-button-new>
          <framework-button-open-record></framework-button-open-record>
          <framework-button-edit></framework-button-edit>
          <framework-button-save></framework-button-save>
          <framework-button-refresh></framework-button-refresh>
        </lib-ribbon-group>

        <lib-ribbon-group label="Workflow">
          <framework-button-confirm
            color="text-green-600"
            icon="fa-circle-check"
            label="Approve"
            modalConfirmButtonIntent="primary"
            modalConfirmButtonLabel="Approve"
            modalMessage="Confirm this workflow action?"
            modalMessageIconColor="text-green-600"
            modalTitle="Approve record"
            [action]="approve$"
          >
          </framework-button-confirm>
          <framework-button-delete label="Delete" [action]="delete$"></framework-button-delete>
        </lib-ribbon-group>

        <div right>
          <lib-ribbon-group label="View">
            <framework-button-filters modalTitle="Filters" modalSize="xl" [formGroup]="filtersForm">
              <lib-form-group>
                <lib-form-input-group controlName="search" label="Search" [maxLength]="200"></lib-form-input-group>
                <lib-form-input-group controlName="status" label="Status" [maxLength]="50"></lib-form-input-group>
              </lib-form-group>
            </framework-button-filters>
            <framework-button-views></framework-button-views>
          </lib-ribbon-group>
        </div>
      </lib-ribbon>

      <!-- The grid the buttons act on. Filter stays disabled until it has loaded once, and Open
           acts on the selected row. -->
      <div class="mt-4 h-64">
        <lib-data-grid></lib-data-grid>
      </div>
    </div>
  `,
})
export class FrameworkButtonsRibbonExample {
  protected readonly filtersForm = new FormGroup({
    search: new FormControl<string>(''),
    status: new FormControl<string>(''),
  });

  /** The work behind Approve. It runs once the user confirms. */
  protected readonly approve$: Observable<boolean> = of(true);

  /** The work behind Delete. It runs once the user confirms. */
  protected readonly delete$: Observable<boolean> = of(true);
}
