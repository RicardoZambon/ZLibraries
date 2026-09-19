import { NgIf } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/library';
import { LegacySubViewForm, ModalBase } from '../../../../views';
import { BaseButton } from '../../base-button';

@Component({
  selector: 'framework-button-edit-legacy',
  templateUrl: './button-edit.component.html',
  imports: [NgIf, RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonEditLegacyComponent) }],
})
/**
 * @deprecated Use standalone {@link ButtonEditComponent} instead.
 * Migrate by replacing this legacy component with the standalone equivalent
 * and using inject() for dependency injection.
 */
export class ButtonEditLegacyComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  @Input() public cancelColor = 'text-red-500';
  @Input() public cancelIcon = 'fa-ban';
  @Input() public cancelLabel = 'Button-Cancel-Edit';
  @Input() public editIcon = 'fa-edit';
  @Input() public editLabel = 'Button-Edit';
  @Input() public form?: LegacySubViewForm;
  @Input() public modal?: ModalBase;
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  protected onCancelAction(): void {
    if (this.form) {
      this.form.cancelEdit();
    }
  }

  protected onEditAction(): void {
    if (this.form) {
      this.form.beginEdit();
    } else if (this.modal) {
      this.modal.toggle();
    }
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
