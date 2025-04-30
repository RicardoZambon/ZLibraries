import { NgIf } from '@angular/common';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { DataGridDataset, ITabView, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { takeUntil } from 'rxjs';
import { Tab } from '../../../../models';
import { AuthService, TabService } from '../../../../services';
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
export class ButtonOpenRecordLegacyComponent extends BaseButton implements OnInit {
  protected selectionCount: number = 0;

  @Input() path!: string;
  @Input() endpoint: string = 'new';
  @Input() tabView!: ITabView;


  constructor(
    authService: AuthService,
    protected dataGridDataset: DataGridDataset,
    private tabService: TabService
  ) {
    super(authService);
  }

  ngOnInit(): void {
    this.dataGridDataset.selectedRowsChanged
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
        this.selectionCount = this.dataGridDataset.selectedRowKeys.length;
    });
  }

  
  clicked(): void {
    if (this.dataGridDataset.hasSelectedRows && this.selectionCount === 1) {
      const selectedKey: string = this.dataGridDataset.selectedRowKeys[0];
      const selectedID: any = this.dataGridDataset.getRowID(selectedKey);

      this.tabService.navigateTo(new Tab({ url: `${this.path}/${selectedID}` }));
      // this.tabService.navigateTab(this.tabView, `${this.path}/${this.dataGridDataset.selectedRows[0]}`);
    }
  }
}