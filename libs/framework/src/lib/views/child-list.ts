import { Component, inject, OnInit } from '@angular/core';
import { DataGridDataset, DataProviderService, MultiSelectResultDataset } from '@library';
import { takeUntil } from 'rxjs';
import { ViewBase } from './view-base';

@Component({ template: '' })
export abstract class ChildList<TEntityModel> extends ViewBase implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  protected dataGridDataset: DataGridDataset;
  protected dataProvider: DataProviderService<TEntityModel> | null;
  protected resultDataset: MultiSelectResultDataset | null;
  protected selectionCount: number = 0;
  //#endregion

  //#region Properties
  protected get isLoading(): boolean {
    return this.loading;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.dataGridDataset = inject(DataGridDataset);
    this.dataProvider = inject(DataProviderService, { optional: true });
    this.resultDataset = inject(MultiSelectResultDataset, { optional: true });
  }

  public ngOnInit(): void {
    this.dataGridDataset.loadStarted
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loading = true;
      });

    this.dataGridDataset.loadFinished
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loading = false;
      });

    this.dataGridDataset.selectedRowsChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.selectedRowChanged();
      });

    this.resultDataset?.savedChanges
      ?.pipe(takeUntil(this.destroy$))
      ?.subscribe(() => {
        this.dataGridDataset.refresh();
      });

    if (this.dataProvider?.hasEntityID) {
      this.dataGridDataset.parentEntityId = this.dataProvider.entityID;

      if (!this.dataGridDataset.loadedRows) {
        this.dataGridDataset.refresh();
      }
      
      if (!!this.resultDataset) {
        this.resultDataset.parentEntityId = this.dataProvider.entityID;
      }
    }
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  protected selectedRowChanged(): void {
    this.selectionCount = this.dataGridDataset.selectedRowKeys.length;
  }
  //#endregion
}