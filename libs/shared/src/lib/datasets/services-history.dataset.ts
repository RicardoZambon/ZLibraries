import { inject, Injectable } from '@angular/core';
import { DataGridDataset, IGridColumn, IListParameters } from '@library';
import { Observable, of } from 'rxjs';
import { IServicesHistoryList } from '../models';
import { ServicesHistoryService } from '../services';

@Injectable()
export class ServicesHistoryDataset extends DataGridDataset {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  public override columns: IGridColumn[] = [
    { field: '', headerName: '' },
  ];

  public controllerName?: string;

  protected servicesHistoryService: ServicesHistoryService = inject(ServicesHistoryService);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.configs.hideColumnHeaders = true;
    this.configs.rowHeight = 52;
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public getData(params: IListParameters): Observable<IServicesHistoryList[]> {
    return !!this.parentEntityId && !!this.controllerName
      ? this.servicesHistoryService.list(this.controllerName, this.parentEntityId, params)
      : of<IServicesHistoryList[]>([]);
  }
  //#endregion

  //#region Private methods
  //#endregion
}