import { Component, inject } from '@angular/core';
import { DataProviderService, FormService } from '@library';
import { AuthService } from '../../services';
import { BaseButton } from './base-button';

@Component({ template: '' })
export abstract class BaseFormViewButton extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  protected dataProviderService!: DataProviderService<any>;
  protected formService!: FormService;
  //#endregion

  //#region Properties
  protected override get isButtonDisabled(): boolean {
    return super.isButtonDisabled || this.formService.loading;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(authService: AuthService) {
    super(authService);

    this.dataProviderService = inject(DataProviderService<any>);
    this.formService = inject(FormService);
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}