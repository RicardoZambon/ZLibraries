import { Component, forwardRef, input, InputSignal } from '@angular/core';
import { RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/ui/library';
import { LegacySubViewForm, ModalBase } from '../../../../views';
import { BaseButton } from '../../base-button';

@Component({
  selector: 'framework-button-edit-legacy',
  templateUrl: './button-edit.component.html',
  imports: [RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonEditLegacyComponent) }],
})
/**
 * @deprecated Use standalone {@link ButtonEditComponent} instead.
 * Migrate by replacing this legacy component with the standalone equivalent
 * and using inject() for dependency injection.
 */
export class ButtonEditLegacyComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  public readonly cancelColor: InputSignal<string> = input('text-red-500');
  public readonly cancelIcon: InputSignal<string> = input('fa-ban');
  public readonly cancelLabel: InputSignal<string> = input('Button-Cancel-Edit');
  public readonly editIcon: InputSignal<string> = input('fa-edit');
  public readonly editLabel: InputSignal<string> = input('Button-Edit');
  public readonly form: InputSignal<LegacySubViewForm | undefined> = input<LegacySubViewForm>();
  public readonly modal: InputSignal<ModalBase | undefined> = input<ModalBase>();
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  protected onCancelAction(): void {
    this.form()?.cancelEdit();
  }

  protected onEditAction(): void {
    const form: LegacySubViewForm | undefined = this.form();
    if (form) {
      form.beginEdit();
    } else {
      this.modal()?.toggle();
    }
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
