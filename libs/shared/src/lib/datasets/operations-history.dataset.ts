import { Injectable } from '@angular/core';
import { DataGridDataset, IGridColumn, IListParameters } from '@library';
import { Observable, of } from 'rxjs';
import { IOperationsHistoryList } from '../models';
import { OperationsHistoryService } from '../services';

@Injectable()
export class OperationsHistoryDataset extends DataGridDataset {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  public override columns: IGridColumn[] = [
    { field: '', headerName: '' },
  ];

  public controllerName?: string;
  
  private _serviceID?: number | undefined;
  //#endregion

  //#region Properties
  public set serviceId(value: number | undefined) {
    if (this._serviceID !== value) {
      this._serviceID = value;
      this.refresh();
    }
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(protected operationsHistoryService: OperationsHistoryService) {
    super();
    
    this.configs.hideColumnHeaders = true;
    this.configs.showMessageOnEmpty = false;
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public getData(params: IListParameters): Observable<IOperationsHistoryList[]> {
    this.configs.showMessageOnEmpty = !!this._serviceID;

    return !!this.parentEntityId && !!this.controllerName && !!this._serviceID
      ? this.operationsHistoryService.list(this.controllerName, this.parentEntityId, this._serviceID, params)
      : of<IOperationsHistoryList[]>([]);
  }
  //#endregion

  //#region Private methods
  //#endregion
}