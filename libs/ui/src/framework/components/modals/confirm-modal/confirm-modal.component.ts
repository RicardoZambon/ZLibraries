import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, InputSignal, model, ModelSignal, Signal, viewChild } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
import { FormService, IModal, ModalComponent, ModalSize } from '@zambon-dev/ui/library';
import { TranslatePipe } from '@ngx-translate/core';
import { BackendFormValidationHelper } from '../../../helpers';

/**
 * Modal that asks the user to confirm an action. Project the confirm button into `[footer]` and
 * any extra content into the body. The host drives the loading state and shows request errors.
 */
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
  /** Translation key or text of the error shown under the message. Defaults to `''` (no error). */
  public readonly errorMessage: ModelSignal<string> = model('');
  /** Whether the confirmed action is running. Defaults to `false`. */
  public readonly isLoading: ModelSignal<boolean> = model(false);

  /** Translation key of the message. May contain HTML. Defaults to `''` (no message). */
  public readonly message: InputSignal<string> = input('');
  /** Font Awesome classes of the icon beside the message. Defaults to `fa-regular fa-circle-question`. */
  public readonly messageIcon: InputSignal<string> = input('fa-regular fa-circle-question');
  /** Tailwind text-colour class of the message icon. Defaults to `text-cyan-500`. */
  public readonly messageIconColor: InputSignal<string> = input('text-cyan-500');
  /** Whether to show the icon beside the message. Defaults to `true`. */
  public readonly showMessageIcon: InputSignal<boolean> = input(true);
  /** Width of the modal. Defaults to `xl`. */
  public readonly size: InputSignal<ModalSize> = input<ModalSize>('xl');
  /** Translation key of the modal's title. Defaults to `''`. */
  public readonly title: InputSignal<string> = input('');
  //#endregion

  //#region Variables

  protected formService: FormService | undefined = inject(FormService, { optional: true }) ?? undefined;
  //#endregion

  //#region Properties
  /** Whether the modal is open. */
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
  /** Clears any error and marks the action as running. */
  public beginLoading(): void {
    this.clearErrorMessage();
    this.isLoading.set(true);
  }

  /** Removes the error message. */
  public clearErrorMessage(): void {
    this.errorMessage.set('');
  }

  /** Closes the modal. */
  public closeModal(): void {
    this.modal()?.closeModal();
  }

  /** Marks the action as finished, re-enables the surrounding form, and closes the modal when `closeModal` is `true`. */
  public finishLoading(closeModal?: boolean): void {
    this.isLoading.set(false);

    if (this.formGroup && this.formGroup.disabled) {
      this.formGroup.enable();
    }

    if (closeModal) {
      this.closeModal();
    }
  }

  /**
   * Ends loading and shows a failed request. A 400 response is mapped onto the surrounding form's
   * fields; anything else shows its text, or a default message, in the modal.
   */
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

  /** Opens or closes the modal, resetting the surrounding form and any error. Does nothing while the form is loading. */
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
