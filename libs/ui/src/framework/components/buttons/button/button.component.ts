import { Component, forwardRef, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/ui/library';
import { BaseButton } from '../base-button';

/**
 * Generic ribbon button with the framework's access check. Set its label, icon and colour, and
 * handle `action`.
 */
@Component({
  selector: 'framework-button',
  templateUrl: './button.component.html',
  imports: [RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonComponent) }],
})
export class ButtonComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  /** Tailwind text-colour class for the icon. Defaults to `text-primary-500`. */
  public readonly color: InputSignal<string> = input('text-primary-500');
  /** Font Awesome icon class, such as `fa-plus`. No icon when unset. */
  public readonly icon: InputSignal<string | undefined> = input<string>();
  /** Translation key of the button's label. Defaults to `''`. */
  public readonly label: InputSignal<string> = input('');

  /** Emits when the button is clicked while enabled, visible and its access check has returned. */
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
