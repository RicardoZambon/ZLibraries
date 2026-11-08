import { Component, inject } from '@angular/core';
import { DataProviderService, FormService } from '@zambon-dev/ui/library';
import { BaseButton } from './base-button';

// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
/**
 * Base class for ribbon buttons that act on the current form view. It gives them the form's data
 * provider and form service, and disables the button while the form is loading.
 */
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
  constructor() {
    super();

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
