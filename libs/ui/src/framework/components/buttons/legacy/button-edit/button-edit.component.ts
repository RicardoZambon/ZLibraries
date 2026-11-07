import { Component, forwardRef, input, InputSignal } from '@angular/core';
import { RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/ui/library';
import { LegacySubViewForm, ModalBase } from '../../../../views';
import { BaseButton } from '../../base-button';

/**
 * Ribbon button that puts a legacy sub-view form into edit mode, then turns into a Cancel button
 * while editing. Without `form` it toggles `modal` instead.
 *
 * @deprecated Use {@link ButtonEditComponent} instead.
 */
@Component({
  selector: 'framework-button-edit-legacy',
  templateUrl: './button-edit.component.html',
  imports: [RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonEditLegacyComponent) }],
})
export class ButtonEditLegacyComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  /** Tailwind text-colour class of the Cancel button's icon. Defaults to `text-red-500`. */
  public readonly cancelColor: InputSignal<string> = input('text-red-500');
  /** Font Awesome icon class of the Cancel button. Defaults to `fa-ban`. */
  public readonly cancelIcon: InputSignal<string> = input('fa-ban');
  /** Translation key of the Cancel button's label. Defaults to `Button-Cancel-Edit`. */
  public readonly cancelLabel: InputSignal<string> = input('Button-Cancel-Edit');
  /** Font Awesome icon class of the Edit button. Defaults to `fa-edit`. */
  public readonly editIcon: InputSignal<string> = input('fa-edit');
  /** Translation key of the Edit button's label. Defaults to `Button-Edit`. */
  public readonly editLabel: InputSignal<string> = input('Button-Edit');
  /** Legacy form to edit. Takes precedence over `modal`. */
  public readonly form: InputSignal<LegacySubViewForm | undefined> = input<LegacySubViewForm>();
  /** Modal to toggle on click when no `form` is set. */
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
