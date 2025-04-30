import { Injectable } from '@angular/core';

import { DataGridConfigs } from '../../models/configs/data-grid-configs';
import { GridConfigsProvider } from './grid-configs.provider';

@Injectable()
export class DataGridConfigsProvider extends GridConfigsProvider {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  protected override _configs: DataGridConfigs;
  //#endregion

  //#region Properties
  public override get configs(): DataGridConfigs {
    return {...this._configs};
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(private gridConfigsProvider: GridConfigsProvider) {
    super();

    this._configs = {
      ...this.gridConfigsProvider.configs,
      multiSelect: false,
      multiSelectSize: 'minmax(1.5rem, min-content)',
    };
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}