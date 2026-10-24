import { Component, forwardRef, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/library';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button',
  templateUrl: './button.component.html',
  imports: [RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonComponent) }],
})
export class ButtonComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  public readonly color: InputSignal<string> = input('text-primary-500');
  public readonly icon: InputSignal<string | undefined> = input<string>();
  public readonly label: InputSignal<string> = input('');

  public readonly action: OutputEmitterRef<void> = output<void>();
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  protected onButtonClicked(): void {
    if (this.disabled() || !this.isAccessLoaded() || !this.isVisible()) {
      return;
    }

    this.action.emit();
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
