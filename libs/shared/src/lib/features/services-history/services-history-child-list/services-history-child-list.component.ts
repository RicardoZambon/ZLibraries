import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { ChildList } from '@framework';
import { DataGridComponent, DataGridDataset } from '@library';
import { TranslatePipe } from '@ngx-translate/core';
import { ServicesHistoryDataset } from '../../../datasets';
import { UtcDatePipe } from '../../../pipes';

@Component({
  selector: 'shared-services-history-child-list',
  templateUrl: './services-history-child-list.component.html',
  styleUrls: ['./services-history-child-list.component.scss'],
  imports: [
    DataGridComponent,
    DatePipe,
    UtcDatePipe,
    TranslatePipe,
  ],
  providers: [{ provide: DataGridDataset, useClass: ServicesHistoryDataset }]
})
export class ServicesHistoryChildListComponent extends ChildList<any> implements AfterViewInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('serviceTemplate') private serviceTemplate!: TemplateRef<any>;

  @Input() public set controllerName(value: string) {
    (<ServicesHistoryDataset>this.dataGridDataset).controllerName = value;
  }  
  //#endregion

  //#region Variables
  public selectedServiceID?: number;
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  public ngAfterViewInit(): void {
    this.dataGridDataset.columns[0].template = this.serviceTemplate;
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public override selectedRowChanged(): void {
    super.selectedRowChanged();

    if (this.dataGridDataset.hasSelectedRows) {
      const selectedKey: string = this.dataGridDataset.selectedRowKeys[0];;
      this.selectedServiceID = this.dataGridDataset.getRowID(selectedKey);
    }
  }
  //#endregion

  //#region Private methods
  //#endregion
}