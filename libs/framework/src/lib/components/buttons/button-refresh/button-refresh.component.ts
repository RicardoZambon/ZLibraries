import { Component, forwardRef, OnInit, Optional } from '@angular/core';
import { DataGridDataset, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { takeUntil } from 'rxjs';
import { AuthService } from '../../../services';
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
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    @Optional() private dataGridDataset: DataGridDataset,
    authService: AuthService,
  ) {
    super(authService);
    
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