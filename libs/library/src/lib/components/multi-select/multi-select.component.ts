import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { take, takeUntil } from 'rxjs';
import { IGridColumn } from '../../models';
import { DataGridDataset } from '../../services/datasets/data-grid.dataset';
import { MultiSelectResultDataset } from '../../services/datasets/multi-select-result.dataset';
import { DataGridComponent } from '../data-grid/data-grid.component';
import { ModalComponent } from '../modal/modal.component';
import { MultiSelectResultGridComponent } from './result-grid/result-grid.component';

@Component({
  selector: 'lib-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  imports: [
    DataGridComponent,
    FormsModule,
    ModalComponent,
    MultiSelectResultGridComponent,
    TranslatePipe,
  ]
})
export class MultiSelectComponent extends ModalComponent implements OnInit {  
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ModalComponent) private modal!: ModalComponent;

  @Input() public itemTemplate!: TemplateRef<any>;
  //#endregion

  //#region Variables
  protected isResultGridLoading: boolean = false;
  protected isSearchGridLoading: boolean = false;
  protected searchCriteria: string = '';

  private _searchColumn: string = '';
  //#endregion

  //#region Properties
  private get searchColumn(): string {
    if (this._searchColumn.length === 0) {
      let columnName = this.dataGridDataset.columns.filter((col: IGridColumn) => col.field !== '')[0]?.field ?? 'Search';
      columnName = columnName.charAt(0).toUpperCase() + columnName.slice(1);
      this._searchColumn = columnName;
    }
    return this._searchColumn;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    private dataGridDataset: DataGridDataset,
    protected resultDataset: MultiSelectResultDataset,
  ) {
    super();

    dataGridDataset.configs.multiSelect = true;
    this.closeButtonText = 'Button-Modal-Cancel';
  }

  public ngOnInit(): void {
    this.dataGridDataset.loadStarted
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isSearchGridLoading = true;
      });

    this.dataGridDataset.loadFinished
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isSearchGridLoading = false;
        this.updateSelectedItems();
      });

    this.resultDataset.loadFinished
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isResultGridLoading = false;
        this.updateSelectedItems();
      });

    this.dataGridDataset.selectedRowsChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectionChanges: { [id:string]: { rowData: any; selected: boolean } }) => {
        if (this.isSearchGridLoading || this.isResultGridLoading) {
          return;
        }

        Object.keys(selectionChanges)
          .forEach((key: string) => {
            const selection: { rowData: any; selected: boolean } = selectionChanges[key];
            const id: any = this.dataGridDataset.getRowID(key);

            if (selection.selected) {
              this.resultDataset.setIDToAdd(id, selection.rowData);
            } else {
              this.resultDataset.setIDToRemove(id);
            }
          });
      });
  }
  //#endregion

  //#region Event handlers
  protected onSave(): void {
    this.modalProcessing = true;
    this.resultDataset.saveChanges()
      .pipe(take(1))
      .subscribe(() => {
        this.modalProcessing = false;
        this.toggleModal();
      });
  }

  protected onSearch(): void {
    const filters: { [key: string]: string; } = this.dataGridDataset.filters ?? {};

    this.isSearchGridLoading = true;
    if (this.searchCriteria.length > 0) {
      filters[this.searchColumn] = this.searchCriteria;
      this.dataGridDataset.setFilters(filters);

    } else if (Object.keys(filters).includes(this.searchColumn)) {
      this.clearSearch();
    }
  }
  //#endregion

  //#region Public methods
  public override closeModal(): void {
    this.modal.closeModal();
  }

  public override toggleModal(): void {
    this.modal.toggleModal();

    if (this.modal.isShown) {
      this.searchCriteria = '';
      this.clearSearch();

      this.isResultGridLoading = true;
      this.resultDataset.refresh();
    }
  }
  //#endregion

  //#regiosn Private methods
  private clearSearch(): void {
    const filters: { [key: string]: string; } = this.dataGridDataset.filters ?? {};
    if (Object.keys(filters).includes(this.searchColumn)) {
      delete filters[this.searchColumn];
    }
    this.dataGridDataset.setFilters(filters);
  }
  private updateSelectedItems(): void {
    if (this.isSearchGridLoading || this.isResultGridLoading) {
      return;
    }

    // Filter by the results that are not marked to be removed.
    const idsFromResult: any[] = (this.resultDataset.loadedKeys ?? [])
      .map((key: string) => this.resultDataset.getRowID(key))
      .filter((id: any) => this.resultDataset.idsToRemove.indexOf(id) < 0);

    idsFromResult.push(...this.resultDataset.idsToAdd);
    
    // Get each corresponding key from the data grid.
    const keysToSelect: string[] = (this.dataGridDataset.loadedKeys ?? [])
      .filter((key: string) => idsFromResult.indexOf(this.dataGridDataset.getRowID(key)) >= 0);

    this.dataGridDataset.selectRows(keysToSelect);
  }
  //#endregion
}