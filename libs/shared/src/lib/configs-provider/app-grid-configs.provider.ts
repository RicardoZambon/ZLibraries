import { Injectable } from '@angular/core';
import { GridConfigsProvider } from '@library';

@Injectable()
export class AppGridConfigsProvider extends GridConfigsProvider {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.configs.loadingDisplayText = 'Grid-Loading';
    this.configs.messageOnEmpty = 'Grid-Message-Empty';
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion 
}