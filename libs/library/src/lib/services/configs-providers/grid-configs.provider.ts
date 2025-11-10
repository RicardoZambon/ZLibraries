import { Injectable } from '@angular/core';
import { GridConfigs } from '../../models/configs/grid-configs';

@Injectable()
export class GridConfigsProvider<TGridConfigs extends GridConfigs = GridConfigs> {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  protected _configs: TGridConfigs;
  //#endregion

  //#region Properties
  public get configs(): TGridConfigs {
    return this._configs;
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor() {
    this._configs = {
      loadingDisplayText: 'Loading...',
      messageOnEmpty: 'No results',
      recordBlockSize: 100,
      rowHeight: 41.6,
      rowsToDisplay: 6,
    } as TGridConfigs;
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}