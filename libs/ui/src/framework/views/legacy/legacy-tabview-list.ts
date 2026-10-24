import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataGridDataset } from '@zambon-dev/ui/library';
import { takeUntil } from 'rxjs';
import { TabService } from '../../services';
import { LegacyTabViewBase } from './legacy-tabview-base';

/**
 * @deprecated Use standalone {@link TabViewList} instead. Migrate by extending TabViewList
 * and using standalone component imports with inject() for dependency injection.
 */
// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
@Component({ template: '' })
export abstract class LegacyTabViewList<TListModel> extends LegacyTabViewBase implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private _selectedItem?: TListModel;
  private selectedRows = 0;
  //#endregion

  //#region Properties
  protected get hasRowsSelected(): boolean {
    return this.selectedRows > 0;
  }

  protected get selectedItem(): TListModel | undefined {
    return this._selectedItem;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    protected dataGridDataset: DataGridDataset,
    route: ActivatedRoute,
    tabService: TabService,
  ) {
    super(route, tabService);

    // This will force the screen to initialize with the buttons disabled.
    this.loading = true;
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    this.dataGridDataset.loadStarted.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loading = true;
    });

    this.dataGridDataset.loadFinished.pipe(takeUntil(this.destroy$)).subscribe(() => {
      setTimeout(() => (this.loading = false));
    });

    this.dataGridDataset.selectedRowsChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
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
    this.selectedRows = this.dataGridDataset.selectedRowKeys.length;

    this._selectedItem = undefined;
    if (this.selectedRows === 1) {
      this._selectedItem = <TListModel>this.dataGridDataset.getRowData(this.dataGridDataset.selectedRowKeys[0]);
    }
  }
  //#endregion
}
