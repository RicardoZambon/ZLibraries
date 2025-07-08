import { Component, inject, OnInit } from '@angular/core';
import { DataGridDataset } from '@library';
import { takeUntil } from 'rxjs';
import { TabViewBase } from './tabview-base';

@Component({ template: '' })
export abstract class TabViewList<TListModel> extends TabViewBase implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private _selectedItem?: TListModel;
  protected dataGridDataset: DataGridDataset;
  private selectionCount: number = 0;
  //#endregion

  //#region Properties
  protected get hasRowsSelected(): boolean {
    return this.selectionCount > 0;
  }

  protected get selectedItem(): TListModel | undefined {
    return this._selectedItem;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.dataGridDataset = inject(DataGridDataset);
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
        setTimeout(() => this.loading = false);
      });

    this.dataGridDataset.selectedRowsChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.selectedRowChanged();
      });
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  protected selectedRowChanged(): void {
    this.selectionCount = this.dataGridDataset.selectedRowKeys.length;

    this._selectedItem = undefined;
    if (this.selectionCount === 1) {
      this._selectedItem = <TListModel>this.dataGridDataset.getRowData(this.dataGridDataset.selectedRowKeys[0])
    }
  }
  //#endregion
}