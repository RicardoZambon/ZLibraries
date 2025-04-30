import { AfterViewInit, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { ChildList } from '@framework';
import { DataGridComponent, DataGridDataset } from '@library';
import { OperationsHistoryDataset } from '../../../datasets';
import { IOperationsHistoryList } from '../../../models';
import { OperationsHistoryModalComponent } from '../operations-history-modal/operations-history-modal.component';

@Component({
  selector: 'shared-operations-history-child-list',
  templateUrl: './operations-history-child-list.component.html',
  styleUrls: ['./operations-history-child-list.component.scss'],
  imports: [
    DataGridComponent,
    OperationsHistoryModalComponent,
  ],
  providers: [{ provide: DataGridDataset, useClass: OperationsHistoryDataset }]
})
export class OperationsHistoryChildListComponent extends ChildList<any> implements AfterViewInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(OperationsHistoryModalComponent) private modal!: OperationsHistoryModalComponent;
  @ViewChild('operationTemplate') private operationTemplate!: TemplateRef<any>;

  @Input() public set controllerName(value: string) {
    (<OperationsHistoryDataset>this.dataGridDataset).controllerName = value;
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