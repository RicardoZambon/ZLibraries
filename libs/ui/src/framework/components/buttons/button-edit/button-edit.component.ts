import { Component, forwardRef, inject, input, InputSignal, OnInit, signal, WritableSignal } from '@angular/core';
import { DataProviderService, FormService, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/ui/library';
import { takeUntil } from 'rxjs';
import { ModalBase } from '../../../views/modals/modal-base';
import { BaseButton } from '../base-button';

/**
 * Ribbon button that puts the current record's form into edit mode, then turns into a Cancel button
 * until the edit ends. Shown only for a saved record. With `modal` set it opens that modal instead.
 */
@Component({
  selector: 'framework-button-edit',
  templateUrl: './button-edit.component.html',
  imports: [RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonEditComponent) }],
})
export class ButtonEditComponent extends BaseButton implements OnInit {
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
  /** Modal to toggle on click instead of editing the form in place. Unset by default. */
  public readonly modal: InputSignal<ModalBase | undefined> = input<ModalBase>();
  //#endregion

  //#region Variables
  // A signal rather than a field: the form cancelling an edit flips this from a subscription,
  // which swaps Edit back in for Cancel.
  protected readonly isButtonCancelVisible: WritableSignal<boolean> = signal(false);

  private dataProviderService: DataProviderService<any> = inject(DataProviderService);
  private formService: FormService = inject(FormService);
  //#endregion

  //#region Properties
  protected get hasDataProviderEntityID(): boolean {
    return this.dataProviderService?.hasEntityID ?? false;
  }

  protected get isFormLoading(): boolean {
    return this.formService.loading;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods

  public ngOnInit(): void {
    this.formService.editCanceled.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isButtonCancelVisible.set(false);
    });
  }
  //#endregion

  //#region Event handlers
  protected onCancelClicked(): void {
    if (this.isButtonCancelVisible()) {
      this.isButtonCancelVisible.set(false);
      this.formService.cancelEdit();
    }
  }

  protected onEditClicked(): void {
    const modal: ModalBase | undefined = this.modal();
    if (modal) {
      modal.toggle();
    } else {
      this.isButtonCancelVisible.set(true);
      this.formService.beginEdit();
    }
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
