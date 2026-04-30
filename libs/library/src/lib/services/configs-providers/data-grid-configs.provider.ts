import { Injectable } from '@angular/core';
import { DataGridConfigs } from '../../models/configs/data-grid-configs';
import { GridConfigsProvider } from './grid-configs.provider';

@Injectable()
export class DataGridConfigsProvider extends GridConfigsProvider<DataGridConfigs> {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this._configs =
    {
      ...this._configs,
      multiSelect: false,
      multiSelectSize: 'minmax(1.5rem, min-content)',
    } as DataGridConfigs;
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}