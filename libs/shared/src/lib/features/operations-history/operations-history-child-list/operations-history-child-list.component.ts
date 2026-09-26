import { AfterViewInit, Component, Input, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ChildList } from '@zambon-dev/framework';
import { DataGridComponent, DataGridDataset } from '@zambon-dev/library';
import { OperationsHistoryDataset } from '../../../datasets';
import { IOperationsHistoryList } from '../../../models';
import { OperationsHistoryModalComponent } from '../operations-history-modal/operations-history-modal.component';

@Component({
  selector: 'shared-operations-history-child-list',
  templateUrl: './operations-history-child-list.component.html',
  styleUrls: ['./operations-history-child-list.component.scss'],
  imports: [DataGridComponent, OperationsHistoryModalComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [{ provide: DataGridDataset, useClass: OperationsHistoryDataset }],
})
export class OperationsHistoryChildListComponent extends ChildList<any> implements AfterViewInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(OperationsHistoryModalComponent) private modal!: OperationsHistoryModalComponent;
  @ViewChild('operationTemplate') private operationTemplate!: TemplateRef<any>;

  @Input() public set controllerName(value: string) {
    (<OperationsHistoryDataset>this.dataGridDataset).controllerName = value;
  }

  /**
   * Filters to send with the list.
   *
   * The audit view applies its filters to the services grid and hands the same set here, because
   * one of them -- whether to list only the audited record's own operations -- belongs to this
   * list. The rest mean nothing to it, and the backend reads only what it recognises.
   *
   * Setting filters does not reload on its own; the grid reloads when a service is selected, and
   * that selection is cleared by the services grid reloading under its new filters.
   */
  @Input() public set filters(value: { [key: string]: string } | undefined) {
    this.dataGridDataset.setFilters(value);
  }

  @Input() public set serviceID(value: number | undefined) {
    (<OperationsHistoryDataset>this.dataGridDataset).serviceId = value;
  }
  //#endregion

  //#region Variables
  public selectedNewValues: any | null = null;
  public selectedOldValues: any | null = null;
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  public ngAfterViewInit(): void {
    this.dataGridDataset.columns[0].template = this.operationTemplate;
  }
  //#endregion

  //#region Event handlers
  public openModal(): void {
    if (!this.modal.isModalShown) {
      this.modal.toggle();
    }
  }
  //#endregion

  //#region Public methods
  public override selectedRowChanged(): void {
    super.selectedRowChanged();

    if (this.dataGridDataset.hasSelectedRows) {
      const key: string = this.dataGridDataset.selectedRowKeys[0];

      const data: IOperationsHistoryList = this.dataGridDataset.getRowData(key);
      this.selectedOldValues = JSON.parse(data.oldValues?.trim() ?? '');
      this.selectedNewValues = JSON.parse(data.newValues?.trim() ?? '');
    }
  }
  //#endregion

  //#region Private methods
  //#endregion
}
