import { Injectable } from '@angular/core';
import { DataGridConfigs, DataGridConfigsProvider } from '@library';

@Injectable()
export class FrameworkGridConfigsProvider extends DataGridConfigsProvider {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    Object.assign(this.configs, {
      loadingDisplayText: 'Grid-Loading',
      messageOnEmpty: 'Grid-Message-Empty',
      messageOnFailed: 'Grid-Message-Failed',
    } as DataGridConfigs);
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion 
}