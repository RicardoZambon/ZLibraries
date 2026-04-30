import { Component, forwardRef, inject, OnInit } from '@angular/core';
import { DataGridDataset, RibbonButtonComponent, RibbonGroupChild } from '@zambon/library';
import { takeUntil } from 'rxjs';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-refresh',
  templateUrl: './button-refresh.component.html',
  imports: [
    RibbonButtonComponent,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonRefreshComponent)}]
})
export class ButtonRefreshComponent extends BaseButton implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private dataGridDataset: DataGridDataset | null = inject(DataGridDataset, { optional: true });
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();
    
    this.disabled = false;
  }

  public ngOnInit(): void {
    this.dataGridDataset?.loadFinished
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loading = false;
      });
  }
  //#endregion

  //#region Event handlers
  protected onButtonClicked(): void {
    this.loading = true;
    this.dataGridDataset?.refresh();
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}