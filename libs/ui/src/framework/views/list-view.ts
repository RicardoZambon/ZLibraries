import { Component, inject, OnInit } from '@angular/core';
import { DataProviderService, MultiSelectResultDataset } from '@zambon-dev/ui/library';
import { TabViewList } from './tabview-list';

// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
@Component({ template: '' })
export abstract class ListView<TEntityModel, TListModel> extends TabViewList<TListModel> implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  protected dataProvider: DataProviderService<TEntityModel> | null;
  protected resultDataset: MultiSelectResultDataset | null;
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.dataProvider = inject(DataProviderService, { optional: true });
    this.resultDataset = inject(MultiSelectResultDataset, { optional: true });
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    if (this.dataProvider?.hasEntityID) {
      this.dataGridDataset.parentEntityId = this.dataProvider.entityID;

      if (!this.dataGridDataset.loadedRows) {
        this.dataGridDataset.refresh();
      }

      if (this.resultDataset) {
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
  //#endregion
}
