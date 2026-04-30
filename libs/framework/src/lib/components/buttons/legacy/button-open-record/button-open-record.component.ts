import { NgIf } from '@angular/common';
import { Component, forwardRef, inject, Input, OnInit } from '@angular/core';
import { DataGridDataset, ITabView, RibbonButtonComponent, RibbonGroupChild } from '@zambon/library';
import { takeUntil } from 'rxjs';
import { Tab } from '../../../../models';
import { TabService } from '../../../../services';
import { BaseButton } from '../../base-button';

@Component({
  selector: 'framework-button-open-record-legacy',
  templateUrl: './button-open-record.component.html',
  imports: [
    NgIf,
    RibbonButtonComponent,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonOpenRecordLegacyComponent)}]
})
/**
 * @deprecated Use standalone {@link ButtonOpenRecordComponent} instead.
 * Migrate by replacing this legacy component with the standalone equivalent
 * and using inject() for dependency injection.
 */
export class ButtonOpenRecordLegacyComponent extends BaseButton implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @Input() public endpoint: string = 'new';
  @Input() public path!: string;
  @Input() public tabView!: ITabView;
  //#endregion

  //#region Variables
  protected dataGridDataset: DataGridDataset = inject(DataGridDataset);
  protected selectionCount: number = 0;

  private tabService: TabService = inject(TabService);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  public ngOnInit(): void {
    this.dataGridDataset.selectedRowsChanged
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
        this.selectionCount = this.dataGridDataset.selectedRowKeys.length;
    });
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public clicked(): void {
    if (this.dataGridDataset.hasSelectedRows && this.selectionCount === 1) {
      const selectedKey: string = this.dataGridDataset.selectedRowKeys[0];
      const selectedID: any = this.dataGridDataset.getRowID(selectedKey);

      this.tabService.navigateTo(new Tab({ url: `${this.path}/${selectedID}` }));
      // this.tabService.navigateTab(this.tabView, `${this.path}/${this.dataGridDataset.selectedRows[0]}`);
    }
  }
  //#endregion

  //#region Private methods
  //#endregion
}