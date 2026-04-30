import { NgIf } from '@angular/common';
import { Component, forwardRef, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataGridDataset, RibbonButtonComponent, RibbonGroupChild } from '@zambon/library';
import { takeUntil } from 'rxjs';
import { Tab } from '../../../models';
import { TabService } from '../../../services';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-open-record',
  templateUrl: './button-open-record.component.html',
  imports: [
    NgIf,
    RibbonButtonComponent,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonOpenRecordComponent)}]
})
export class ButtonOpenRecordComponent extends BaseButton implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @Input() public elementPath?: string;
  @Input() public rootPath?: string;
  //#endregion

  //#region Variables
  private dataGridDataset: DataGridDataset = inject(DataGridDataset);
  private router: Router = inject(Router);
  private selectionCount: number = 0;
  private tabService: TabService = inject(TabService);
  //#endregion

  //#region Properties
  protected get isSelectedOneRecord(): boolean {
    return this.selectionCount === 1;
  }
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
  protected onButtonClicked(): void {
    if (this.disabled || !this.isAccessLoaded || !this.isSelectedOneRecord || !this.visible) {
      return;
    }

    let path: string = this.rootPath ?? this.router.url;

    if (this.elementPath) {
      path += `/${this.elementPath}`;
    }

    const selectedKey: string = this.dataGridDataset.selectedRowKeys[0];
    const selectedID: any = this.dataGridDataset.getRowID(selectedKey);
    path += `/${selectedID}`;

    this.tabService.navigateCurrentTab(new Tab({ entityBaseUrl: path, url: path }));
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
