import { Component, forwardRef, inject, input, InputSignal, OnInit, signal, WritableSignal } from '@angular/core';
import { DataProviderService, FormService, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/library';
import { takeUntil } from 'rxjs';
import { ModalBase } from '../../../views/modals/modal-base';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-edit',
  templateUrl: './button-edit.component.html',
  imports: [RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonEditComponent) }],
})
export class ButtonEditComponent extends BaseButton implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  public readonly cancelColor: InputSignal<string> = input('text-red-500');
  public readonly cancelIcon: InputSignal<string> = input('fa-ban');
  public readonly cancelLabel: InputSignal<string> = input('Button-Cancel-Edit');
  public readonly editIcon: InputSignal<string> = input('fa-edit');
  public readonly editLabel: InputSignal<string> = input('Button-Edit');
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
