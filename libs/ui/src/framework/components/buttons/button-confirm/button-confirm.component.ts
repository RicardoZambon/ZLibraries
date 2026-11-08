import { HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, inject, input, InputSignal, Signal, viewChild } from '@angular/core';
import {
  ButtonComponent,
  type ButtonIntent,
  DataGridDataset,
  RibbonButtonComponent,
  RibbonGroupChild,
} from '@zambon-dev/ui/library';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, take } from 'rxjs';
import { ConfirmModalComponent } from '../../modals';
import { BaseButton } from '../base-button';

/**
 * Ribbon button that asks for confirmation in a modal, then runs `action`. On success it closes the
 * modal and refreshes the surrounding data grid; on failure the modal shows the error.
 */
@Component({
  selector: 'framework-button-confirm',
  templateUrl: './button-confirm.component.html',
  imports: [ButtonComponent, ConfirmModalComponent, RibbonButtonComponent, TranslatePipe],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonConfirmComponent) }],
})
export class ButtonConfirmComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  private readonly confirmModal: Signal<ConfirmModalComponent | undefined> = viewChild(ConfirmModalComponent);

  /** Request to run once the user confirms. Required. Subscribed to once per confirmation. */
  public readonly action: InputSignal<Observable<any>> = input.required<Observable<any>>();
  /** Tailwind text-colour class for the ribbon button's icon. Defaults to `text-primary-500`. */
  public readonly color: InputSignal<string> = input('text-primary-500');
  /** Font Awesome icon class of the ribbon button. Defaults to `''` (no icon). */
  public readonly icon: InputSignal<string> = input('');
  /** Translation key of the ribbon button's label. Defaults to `''`. */
  public readonly label: InputSignal<string> = input('');
  /** What the modal's confirm button is for. Sets its fill and text colour. Defaults to `danger`. */
  public readonly modalConfirmButtonIntent: InputSignal<ButtonIntent> = input<ButtonIntent>('danger');
  /** Translation key of the modal's confirm button. Defaults to `''`. */
  public readonly modalConfirmButtonLabel: InputSignal<string> = input('');
  /** Translation key of the message in the modal. May contain HTML. Defaults to `''` (no message). */
  public readonly modalMessage: InputSignal<string> = input('');
  /** Font Awesome classes of the icon beside the message. Defaults to `fa-solid fa-circle-question`. */
  public readonly modalMessageIcon: InputSignal<string> = input('fa-solid fa-circle-question');
  /** Tailwind text-colour class of the message icon. Defaults to `''` (no colour class). */
  public readonly modalMessageIconColor: InputSignal<string> = input('');
  /** Translation key of the modal's title. Defaults to `''`. */
  public readonly modalTitle: InputSignal<string> = input('');
  //#endregion

  //#region Variables
  protected gridDataset: DataGridDataset = inject(DataGridDataset);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.disabled.set(true);
  }
  //#endregion

  //#region Event handlers
  protected onButtonClicked(): void {
    this.confirmModal()?.toggleModal();
  }

  protected onDelete(): void {
    const confirmModal: ConfirmModalComponent | undefined = this.confirmModal();
    if (!confirmModal || confirmModal.isLoading() || !confirmModal.isOpen()) {
      return;
    }

    confirmModal.beginLoading();

    this.action()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.finishLoading('success');
          confirmModal.finishLoading(true);
          this.gridDataset.refresh();
        },
        error: (e: HttpErrorResponse) => {
          confirmModal.setErrorMessage(e);
        },
      });
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
