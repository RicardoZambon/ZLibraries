import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  Signal,
  viewChild,
} from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
import { FormService, IModal, ModalComponent, ModalSize } from '@zambon-dev/library';
import { TranslatePipe } from '@ngx-translate/core';
import { BackendFormValidationHelper } from '../../../helpers';

@Component({
  selector: 'framework-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  imports: [ModalComponent, NgClass, TranslatePipe],
})
export class ConfirmModalComponent implements IModal {
  //#region ViewChilds, Inputs, Outputs
  private readonly modal: Signal<ModalComponent | undefined> = viewChild(ModalComponent);

  // Models rather than inputs: this component writes both while confirming, from callbacks a
  // parent owns. As plain fields they landed with nothing marking this view dirty.
  public readonly errorMessage: ModelSignal<string> = model('');
  public readonly isLoading: ModelSignal<boolean> = model(false);

  public readonly message: InputSignal<string> = input('');
  public readonly messageIcon: InputSignal<string> = input('fa-regular fa-circle-question');
  public readonly messageIconColor: InputSignal<string> = input('text-cyan-500');
  public readonly showMessageIcon: InputSignal<boolean> = input(true);
  public readonly size: InputSignal<ModalSize> = input<ModalSize>('xl');
  public readonly title: InputSignal<string> = input('');
  //#endregion

  //#region Variables

  protected formService: FormService | undefined = inject(FormService, { optional: true }) ?? undefined;
  //#endregion

  //#region Properties
  /**
   * Delegates to the inner modal. A signal view query, not @ViewChild: a computed reading a plain
   * query would never re-run when the query resolves, so the wrapper would answer against an
   * undefined child for ever.
   */
  public readonly isOpen: Signal<boolean> = computed(() => this.modal()?.isOpen() ?? false);

  protected get hasErrorMessage(): boolean {
    return !!this.errorMessage() && this.errorMessage().length > 0;
  }

  protected get hasMessage(): boolean {
    return !!this.message() && this.message().length > 0;
  }

  private controlContainer: ControlContainer | null = inject(ControlContainer, { optional: true });

  private get formGroup(): FormGroup | null {
    return (this.controlContainer?.control as FormGroup) ?? null;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public beginLoading(): void {
    this.clearErrorMessage();
    this.isLoading.set(true);
  }

  public clearErrorMessage(): void {
    this.errorMessage.set('');
  }

  public closeModal(): void {
    this.modal()?.closeModal();
  }

  public finishLoading(closeModal?: boolean): void {
    this.isLoading.set(false);

    if (this.formGroup && this.formGroup.disabled) {
      this.formGroup.enable();
    }

    if (closeModal) {
      this.closeModal();
    }
  }

  public setErrorMessage(httpErrorResponse: HttpErrorResponse): void {
    this.finishLoading();

    if (httpErrorResponse.status === 400 && !!this.formGroup) {
      BackendFormValidationHelper.validateAllFormFields(httpErrorResponse, this.formGroup);
    } else {
      if (typeof httpErrorResponse.error === 'string') {
        this.errorMessage.set(httpErrorResponse.error);
      } else {
        this.errorMessage.set('Modal-Failed-DefaultMessage');
      }
    }
  }

  public toggleModal(): void {
    if (!!this.formService && this.formService.loading) {
      return;
    }

    if (this.formGroup) {
      // TODO: TEST THIS CHANGE
      this.formGroup.reset();
      this.formService?.resetForm();
    }

    this.clearErrorMessage();
    this.modal()?.toggleModal();
  }
  //#endregion

  //#region Private methods
  //#endregion
}
